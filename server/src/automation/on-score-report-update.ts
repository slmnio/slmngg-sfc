import { AnyAirtableID, EventSettings, Report } from "../types.js";
import { get } from "../action-utils/action-cache.js";
import * as Cache from "../cache.js";
import { getInternalManager } from "../action-utils/action-manager.js";
import { cleanID, hammerTime, looseDeleteMessage, sendMessage, updateRecord } from "../action-utils/action-utils.js";
import client from "../discord/client.js";
import { MapObject } from "../discord/managers.js";
import { generateMatchReportText } from "../action-utils/ts-action-utils.js";

const processing = new Set<AnyAirtableID>();

export default {
    async handler({ id, newData: report, oldData }: { id: AnyAirtableID, newData: Report, oldData: Report }) {
        // if (!process.env.IS_SLMNGG_MAIN_SERVER) return;
        if (report?.__tableName !== "Reports") return;
        if (report.approved) {
            console.log("Already approved");
            return;
        }

        if (processing.has(id)) return;
        console.log("--- Blocking");
        processing.add(id);

        try {
            if (!report?.match?.length) return;
            const match = await get(report?.match?.[0]);
            if (!match?.id) return;
            if (!match?.event?.length) return;
            const event = await get(match?.event?.[0]);
            if (!event?.id || !event?.blocks) return;

            const opponentIDs = (match.teams || []).filter(id => cleanID(id) !== cleanID(report.team?.[0]));
            const opponents = await Promise.all(opponentIDs.map(id => get(id)));
            const submittingTeam = report.team?.[0] ? await get(report.team?.[0]) : null;
            const allTeams = await Promise.all((match.teams || []).map(id => get(id)));

            let subdomain = "";
            if (event?.subdomain || event?.partial_subdomain) {
                subdomain = (event.subdomain || event.partial_subdomain || "") + ".";
            }
            const matchLink = `https://${subdomain}slmn.gg/match/${cleanID(match.id)}`;
            const eventSettings = JSON.parse(event.blocks) as EventSettings;

            let messageData = new MapObject(report.message_data);

            if (report.type === "Scores" && report.data) {
                if (!eventSettings?.reporting?.score?.use) return;
                const reportApproved =
                    report.force_approved || (
                        (report.approved_by_team &&
                            (eventSettings.reporting.score.opponentApprove ? report.approved_by_opponent : true) &&
                            (eventSettings.reporting.score.staffApprove ? report.approved_by_staff : true))
                    );

                if (reportApproved) {
                    // Process approval
                    console.log("Report is now ready for approval");
                    const manager = getInternalManager();
                    if (!manager) return console.error("No internal manager can run automation action");
                    try {
                        const { matchData, mapData } = JSON.parse(report.data);
                        console.log({
                            matchData,
                            mapData
                        });
                        if (mapData) {
                            await manager.runActionAsAutomation("update-map-data", {
                                matchID: match.id,
                                mapData
                            });
                        }
                        if (matchData) {
                            await manager.runActionAsAutomation("update-match-data", {
                                matchID: match.id,
                                updatedData: matchData
                            });
                        }
                        // Delete record here (not implemented?)
                        console.log("Can now delete the score report");

                        messageData = await looseDeleteMessage(messageData, "staff_notification");

                        if (client &&
                            opponents.length &&
                            eventSettings?.logging?.staffCompletedScoreReport
                        ) {
                            messageData = await sendMessage({
                                key: "staff_confirmation",
                                mapObject: messageData,
                                channelID: eventSettings.logging.staffCompletedScoreReport,
                                content: `🎉 Score report approved\n${report.log}\n${matchLink}/score-reporting`
                            });
                        }
                        if (client && eventSettings?.logging?.postMatchReports) {
                            messageData = await sendMessage({
                                key: "score_report",
                                mapObject: messageData,
                                channelID: eventSettings.logging.postMatchReports,
                                content: await generateMatchReportText(await get(match.id))
                            });
                        }

                        await updateRecord(Cache, "Reports", report, {
                            "Approved": true,
                            "Message Data": messageData.textMap
                        });

                    } catch (e) {
                        console.error("Action error - not continuing");
                    }
                } else {
                    // Not ready to approve - see what changed though

                    if (eventSettings.reporting.score.opponentApprove && (!oldData.approved_by_opponent && report.approved_by_opponent)) {
                        // Now approved by opponent
                        console.log("Report not ready for approval but has been approved by opponent");
                        // Staff can now approve

                        if (client &&
                            opponents.length &&
                            eventSettings?.logging?.staffScoreReport &&
                            eventSettings?.reporting?.score?.staffApprove &&
                            !report.approved_by_staff
                        ) {
                            messageData = await sendMessage({
                                key: "staff_notification",
                                mapObject: messageData,
                                channelID: eventSettings.logging.staffScoreReport,
                                content: `📣 A score report from ${submittingTeam ? submittingTeam.name : "a team"} has been approved by their opponent and is ready for staff approval\n${matchLink}/score-reporting`,
                                success: async (mapObject : MapObject) => {
                                    await updateRecord(Cache, "Reports", report, {
                                        "Message Data": mapObject.textMap
                                    });
                                }
                            });
                        }

                    } else if (!oldData.approved_by_team && report.approved_by_team) {
                        // Opponent can now approve
                        console.log("Report has been approved by initial team");
                        console.log({oldData, newData: report});


                        if (client &&
                            opponents.length &&
                            eventSettings?.logging?.captainNotifications &&
                            eventSettings?.reporting?.score?.opponentApprove &&
                            !report.approved_by_opponent
                        ) {
                            const opponentPings = opponents.map(opponent => {
                                const discordControl = new MapObject(opponent?.discord_control);
                                return discordControl.get("role_id") ? `<@&${discordControl.get("role_id")}>` : opponent.name;
                            });
                            messageData = await sendMessage({
                                key: "opponent_captain_notification",
                                mapObject: messageData,
                                channelID: eventSettings.logging.captainNotifications,
                                content: `📣 ${opponentPings.join(" ")}\nA score report from ${submittingTeam ? submittingTeam.name : "your opponent"} is ready for approval\n${matchLink}/score-reporting`,
                                success: async (mapObject : MapObject) => {
                                    await updateRecord(Cache, "Reports", report, {
                                        "Message Data": mapObject.textMap
                                    });
                                }
                            });

                            // we can also go straight to staff approving if necessary
                        } else if (client &&
                            (!eventSettings?.reporting?.score?.opponentApprove || report.approved_by_opponent) && // passed opponent approval
                            eventSettings?.logging?.staffScoreReport &&
                            eventSettings?.reporting?.score?.staffApprove &&
                            !report.approved_by_staff
                        ) {
                            messageData = await sendMessage({
                                key: "staff_notification",
                                mapObject: messageData,
                                channelID: eventSettings.logging.staffScoreReport,
                                content: `📣 A score report from ${submittingTeam ? submittingTeam.name : "a team"} has been approved by their opponent and is ready for staff approval\n${matchLink}/score-reporting`,
                                success: async (mapObject : MapObject) => {
                                    await updateRecord(Cache, "Reports", report, {
                                        "Message Data": mapObject.textMap
                                    });
                                }
                            });

                        }

                    } else if (!oldData.countered_by_opponent && report.countered_by_opponent) {
                        // Opponent has counter
                        console.log("Report has been counted by opposing team");
                        console.log({oldData, newData: report});

                        messageData = await looseDeleteMessage(messageData, "opponent_captain_notification");

                        // tell opponent
                        if (client &&
                            submittingTeam &&
                            eventSettings?.logging?.captainNotifications &&
                            !report.approved_by_opponent
                        ) {
                            const discordControl = new MapObject(submittingTeam.discord_control);
                            const originalPing = discordControl.get("role_id") ? `<@&${discordControl.get("role_id")}>` : submittingTeam.name;

                            messageData = await sendMessage({
                                key: "original_captain_notification",
                                mapObject: messageData,
                                channelID: eventSettings.logging.captainNotifications,
                                content: `📣 ${originalPing}\nYour score report has been denied and countered by your opponent. Please check their submission to see if it is correct:\n${matchLink}/score-reporting`
                            });
                        }

                        // tell staff?
                        if (client &&
                            eventSettings?.logging?.staffScoreReport &&
                            !report.approved_by_staff
                        ) {
                            messageData = await looseDeleteMessage(messageData, "staff_notification");
                            messageData = await sendMessage({
                                key: "staff_notification",
                                mapObject: messageData,
                                channelID: eventSettings.logging.staffScoreReport,
                                content: `📣 A score report from ${submittingTeam ? submittingTeam.name : "a team"} has been **denied and countered** by their opponent.\n${matchLink}/score-reporting`,
                                success: async (mapObject : MapObject) => {
                                    await updateRecord(Cache, "Reports", report, {
                                        "Message Data": mapObject.textMap
                                    });
                                }
                            });
                        }

                    } else {
                        // other change
                        console.log("Report changed something else");
                        const keys = Object.keys({...report,...structuredClone(oldData)}) as (keyof Report)[];
                        const changes = keys
                            .map(key => ({ key, newVal: report[key], oldVal: structuredClone(oldData[key])}))
                            .filter(({ oldVal, newVal}) => JSON.stringify(oldVal) !== JSON.stringify(newVal));

                        console.log({oldData, newData: report});
                        console.log(changes);
                    }
                }
            }
            else if (report.type === "Rescheduling" && report.data) {
                if (!eventSettings?.reporting?.rescheduling?.use) return;
                const { start: proposedStart } = JSON.parse(report.data);

                const reportApproved =
                    report.force_approved || (
                        (report.approved_by_team &&
                            (eventSettings.reporting.rescheduling.opponentApprove ? report.approved_by_opponent : true) &&
                            (eventSettings.reporting.rescheduling.staffApprove ? report.approved_by_staff : true))
                    );

                if (reportApproved) {
                    // Process approval
                    console.log("Reschedule request is now ready for approval");
                    const manager = getInternalManager();
                    if (!manager) return console.error("No internal manager can run automation action");

                    messageData = await looseDeleteMessage(messageData, "opponent_reschedule_request");

                    try {
                        const { start } = JSON.parse(report.data);
                        if (start) {
                            await manager.runActionAsAutomation("update-match-data", {
                                matchID: match.id,
                                updatedData: {
                                    start
                                }
                            });
                        }

                        // Delete record here (not implemented?)
                        console.log("Can now delete the score report");

                        messageData = await looseDeleteMessage(messageData, "staff_reschedule_notification");

                        // #3 Teams pinged about reschedule

                        const teamPings = allTeams.map(opponent => {
                            const discordControl = new MapObject(opponent?.discord_control);
                            return discordControl.get("role_id") ? `<@&${discordControl.get("role_id")}>` : opponent.name;
                        });
                        messageData = await sendMessage({
                            key: "reschedule_log",
                            mapObject: messageData,
                            channelID: eventSettings.logging?.matchTimeChanges,
                            content: `⌚ Match reschedule ${teamPings.join(" ")}: ${opponents.map(t => t.name || t.code).join(" vs ")} ${match.start ? "rescheduled to" : "scheduled for"} ${hammerTime(proposedStart)}.\n${matchLink}`
                        });
                        await updateRecord(Cache, "Reports", report, {
                            "Approved": true,
                            "Message Data": messageData.textMap
                        });

                    } catch (e) {
                        console.error("Action error - not continuing");
                    }

                } else {
                    // Not ready to approve - see what changed though

                    if (
                        (!oldData.approved_by_team && report.approved_by_team) &&   // just submitted
                        eventSettings.reporting.rescheduling.opponentApprove &&     // opponent approval required
                        !report.approved_by_opponent                                // not yet approved by opponent
                    ) {
                        // #1 Opponent pinged about request

                        const opponentPings = opponents.map(opponent => {
                            const discordControl = new MapObject(opponent?.discord_control);
                            return discordControl.get("role_id") ? `<@&${discordControl.get("role_id")}>` : opponent.name;
                        });
                        messageData = await sendMessage({
                            key: "opponent_reschedule_request",
                            mapObject: messageData,
                            channelID: eventSettings.logging?.captainNotifications,
                            content: `📣 ${opponentPings.join(" ")}\n${submittingTeam?.name || "Your opponent"} ${match.start ? "has requested a reschedule to" : "requested a start time of"} ${hammerTime(proposedStart)}\n${matchLink}/rescheduling`,
                            success: async (mapObject : MapObject) => {
                                await updateRecord(Cache, "Reports", report, {
                                    "Message Data": mapObject.textMap
                                });
                            }
                        });
                    } else if (
                        (
                            (!oldData.approved_by_team && report.approved_by_team && !eventSettings.reporting.rescheduling.opponentApprove) ||   // just submitted and opponent not required
                            (!oldData.approved_by_opponent && report.approved_by_opponent) // or opponent approval just completed
                        ) &&
                        eventSettings.reporting.rescheduling.staffApprove &&     // staff approval required
                        !report.approved_by_staff                                // not yet approved by staff
                    ) {
                        // #2 Staff prompted about request
                        console.log("Staff prompt for request");

                        messageData = await sendMessage({ mapObject: messageData,
                            key: "staff_reschedule_notification",
                            channelID: eventSettings.logging?.staffScoreReport,
                            content: `📣 A reschedule request from ${submittingTeam ? submittingTeam.name : "a team"} requires staff approval\n${matchLink}/rescheduling`,
                            success: async (mapObject : MapObject) => {
                                await updateRecord(Cache, "Reports", report, {
                                    "Message Data": mapObject.textMap
                                });
                            }
                        });
                    } else {
                        console.log("Reschedule report changed something else");
                        const keys = Object.keys({...report,...structuredClone(oldData)}) as (keyof Report)[];
                        const changes = keys
                            .map(key => ({ key, newVal: report[key], oldVal: structuredClone(oldData[key])}))
                            .filter(({ oldVal, newVal}) => JSON.stringify(oldVal) !== JSON.stringify(newVal));

                        console.log({oldData, newData: report});
                        console.log(changes);
                    }
                }
            }
        } finally {
            console.log("--- Unblocking");
            processing.delete(id);
        }
    }
};

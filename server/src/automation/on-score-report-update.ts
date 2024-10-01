import { AnyAirtableID, EventSettings, Report } from "../types.js";
import { get } from "../action-utils/action-cache.js";
import * as Cache from "../cache.js";
import { getInternalManager } from "../action-utils/action-manager.js";
import { cleanID, updateRecord } from "../action-utils/action-utils.js";
import client from "../discord/client.js";
import { MapObject } from "../discord/managers.js";
import { generateMatchReportText } from "../action-utils/ts-action-utils.js";

const processing = new Set<AnyAirtableID>();

export default {
    /**
     *
     * @param {AnyAirtableID} id
     * @param {object} newData
     * @param {object?} oldData
     * @returns {Promise<void>}
     */
    async handler({ id, newData: report, oldData }: { id: AnyAirtableID, newData: Report, oldData: Report }) {
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

            let subdomain = "";

            if (match?.event?.length) {
                const event = await Cache.get(match?.event?.[0]);
                if (event?.subdomain || event?.partial_subdomain) {
                    subdomain = (event.subdomain || event.partial_subdomain || "") + ".";
                }
            }
            const matchLink = `https://${subdomain}slmn.gg/match/${cleanID(match.id)}/score-reporting`;
            const eventSettings = JSON.parse(event.blocks) as EventSettings;

            const messageData = new MapObject(report.message_data);

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


                        if (client &&
                            opponents.length &&
                            eventSettings?.logging?.staffCompletedScoreReport
                        ) {
                            const channel = await client.channels.fetch(eventSettings.logging.staffCompletedScoreReport);
                            if (channel?.isTextBased()) {
                                try {
                                    const scoreReportMessage = await channel.send(`🎉 Score report approved\n${report.log}\n${matchLink}`);
                                    messageData.push("staff_confirmation_channel_id", channel.id);
                                    messageData.push("staff_confirmation_message_id", scoreReportMessage.id);
                                } catch (e) {
                                    console.error("Channel sending error", e);
                                }
                            }
                        }
                        if (client && eventSettings?.logging?.postMatchReports) {
                            const channel = await client.channels.fetch(eventSettings.logging.postMatchReports);
                            if (channel?.isTextBased()) {
                                try {
                                    const reportText = await generateMatchReportText(await get(match.id));
                                    if (reportText) {
                                        const scoreReportMessage = await channel.send(reportText);
                                        messageData.push("score_report_channel_id", channel.id);
                                        messageData.push("score_report_message_id", scoreReportMessage.id);
                                    }
                                } catch (e) {
                                    console.error("Channel sending error", e);
                                }
                            }
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
                            const channel = await client.channels.fetch(eventSettings.logging.staffScoreReport);
                            if (channel?.isTextBased()) {
                                try {
                                    const staffNotification = await channel.send(`📣 A score report from ${submittingTeam ? submittingTeam.name : "a team"} has been approved by their opponent and is ready for staff approval\n${matchLink}`);
                                    messageData.push("staff_notification_channel_id", channel.id);
                                    messageData.push("staff_notification_message_id", staffNotification.id);
                                    await updateRecord(Cache, "Reports", report, {
                                        "Message Data": messageData.textMap
                                    });
                                } catch (e) {
                                    console.error("Channel sending error", e);
                                }
                            }
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
                            const channel = await client.channels.fetch(eventSettings.logging.captainNotifications);
                            if (channel?.isTextBased()) {
                                const opponentPings = opponents.map(opponent => {
                                    const discordControl = new MapObject(opponent?.discord_control);
                                    return discordControl.get("role_id") ? `<@&${discordControl.get("role_id")}>` : opponent.name;
                                });
                                try {
                                    const opponentNotification = await channel.send(`📣 ${opponentPings.join(" ")}\nA score report from ${submittingTeam ? submittingTeam.name : "your opponent"} is ready for approval\n${matchLink}`);
                                    messageData.push("opponent_captain_notification_channel_id", channel.id);
                                    messageData.push("opponent_captain_notification_message_id", opponentNotification.id);
                                    await updateRecord(Cache, "Reports", report, {
                                        "Message Data": messageData.textMap
                                    });
                                } catch (e) {
                                    console.error("Channel sending error", e);
                                }
                            }

                            // we can also go straight to staff approving if necessary
                        } else if (client &&
                            (!eventSettings?.reporting?.score?.opponentApprove || report.approved_by_opponent) && // passed opponent approval
                            eventSettings?.logging?.staffScoreReport &&
                            eventSettings?.reporting?.score?.staffApprove &&
                            !report.approved_by_staff
                        ) {
                            const channel = await client.channels.fetch(eventSettings.logging.staffScoreReport);
                            if (channel?.isTextBased()) {
                                try {
                                    const staffNotification = await channel.send(`📣 A score report from ${submittingTeam ? submittingTeam.name : "a team"} has been approved by their opponent and is ready for staff approval\n${matchLink}`);
                                    messageData.push("staff_notification_channel_id", channel.id);
                                    messageData.push("staff_notification_message_id", staffNotification.id);
                                    await updateRecord(Cache, "Reports", report, {
                                        "Message Data": messageData.textMap
                                    });
                                } catch (e) {
                                    console.error("Channel sending error", e);
                                }
                            }
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
        } finally {
            console.log("--- Unblocking");
            processing.delete(id);
        }
    }
};

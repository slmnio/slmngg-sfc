import { AnyAirtableID, EventSettings, Report } from "../types.js";
import { get } from "../action-utils/action-cache.js";
// @ts-expect-error not a ts file
import * as Cache from "../cache.js";
// @ts-expect-error not a ts file
import { getInternalManager } from "../action-utils/action-manager.js";
// @ts-expect-error not a ts file
import { cleanID, updateRecord } from "../action-utils/action-utils.js";
// @ts-expect-error not a ts file
import client from "../discord/client.js";
// @ts-expect-error not a ts file
import { MapObject } from "../discord/managers.js";

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
        if (!eventSettings?.reporting?.score?.use) return;
        if (report.type === "Scores" && report.data) {
            const reportApproved =
                (report.approved_by_team &&
                (eventSettings.reporting.score.opponentApprove ? report.approved_by_opponent : true) &&
                (eventSettings.reporting.score.staffApprove ? report.approved_by_staff : true));

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

                    await updateRecord(Cache, "Reports", report, {
                        "Approved": true
                    });

                    if (client &&
                        opponents.length &&
                        eventSettings?.logging?.staffCompletedScoreReport
                    ) {
                        const channel = await client.channels.fetch(eventSettings.logging.staffCompletedScoreReport);
                        if (channel) {
                            try {
                                channel.send(`🎉 A score report has been fully approved and the data is now live.\n${matchLink}\nImagine an embed here.`);
                            } catch (e) {
                                console.error("Channel sending error", e);
                            }
                        }
                    }

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
                        if (channel) {
                            try {
                                channel.send(`📣 A score report from ${submittingTeam ? submittingTeam.name : "a team"} has been approved by their opponent and is ready for staff approval\n${matchLink}`);
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
                        if (channel) {
                            const opponentPings = opponents.map(opponent => {
                                const discordControl = new MapObject(opponent?.discord_control);
                                return discordControl.get("role_id") ? `<@&${discordControl.get("role_id")}>` : opponent.name;
                            });
                            try {
                                channel.send(`📣 ${opponentPings.join(" ")}\nA score report from ${submittingTeam ? submittingTeam.name : "your opponent"} is ready for approval\n${matchLink}`);
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
                        if (channel) {
                            try {
                                channel.send(`📣 A score report from ${submittingTeam ? submittingTeam.name : "a team"} has been approved by their opponent and is ready for staff approval\n${matchLink}`);
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
    }
};

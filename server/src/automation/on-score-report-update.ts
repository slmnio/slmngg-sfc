import {
    AnyAirtableID,
    EventSettings,
    Report,
    ReschedulingReportKeys,
    ScoreReportingReportKeys,
    Theme
} from "../types.js";
import { get } from "../action-utils/action-cache.js";
import * as Cache from "../cache.js";
import { getInternalManager } from "../action-utils/action-manager.js";
import { cleanID, hammerTime, updateRecord } from "../action-utils/action-utils.js";
import client from "../discord/client.js";
import { MapObject } from "../discord/managers.js";
import {
    generateMatchReportText,
    getTeamEmojiText,
    looseDeleteRecordedMessage,
    looseDeleteRecordedMessages,
    readableMatchLog,
    sendRecordedMessage
} from "../action-utils/ts-action-utils.js";
import { ButtonBuilder, ButtonStyle } from "discord.js";
import emoji from "../discord/emoji.js";

const processing = new Set<AnyAirtableID>();
const dataServer = process.env.NODE_ENV === "development" ? "http://localhost:8901" : "https://data.slmn.gg";

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

            const defaultColor = "#4468a8";
            let eventTheme: Theme | null = null;
            if (event?.theme?.length) {
                eventTheme = await get(event.theme[0]);
            }
            const eventColor = parseInt((eventTheme?.color_theme_on_dark || eventTheme?.color_theme || defaultColor).slice(1), 16);

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
                            (eventSettings.reporting.score.staffApprove ? report.approved_by_staff : true)) &&
                        !report.denied_by_staff &&
                        !report.denied_by_opponent
                    );

                if (reportApproved) {
                    // Process approval
                    console.log("Report is now ready for approval");
                    const manager = getInternalManager();
                    if (!manager) return console.error("No internal manager can run automation action");
                    try {
                        const {matchData, mapData} = JSON.parse(report.data);
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

                        messageData = await looseDeleteRecordedMessage<ScoreReportingReportKeys>(messageData, "report_staff_notification");

                        if (client && eventSettings?.logging?.staffCompletedScoreReport && report?.log) {
                            const readableLog = await readableMatchLog(report.log);
                            messageData = await sendRecordedMessage<ScoreReportingReportKeys>({
                                key: "report_completed_staff",
                                mapObject: messageData,
                                channelID: eventSettings.logging.staffCompletedScoreReport,
                                content: `${emoji.circle.success_check} **Score report approved**\n${readableLog}\n${matchLink}/score-reporting`
                            });
                        }
                        if (client && eventSettings?.logging?.postMatchReports) {
                            messageData = await sendRecordedMessage<ScoreReportingReportKeys>({
                                key: "report_completed_public",
                                mapObject: messageData,
                                channelID: eventSettings.logging.postMatchReports,
                                content: await generateMatchReportText(await get(match.id))
                            });
                        }

                        await updateRecord(Cache, "Reports", report, {
                            "Approved": true,
                            "Message Data": messageData.textMap
                        }, "automation/on-score-report-update");

                        if (match.brackets) {
                            for (const bracketID of match.brackets) {
                                await manager.runActionAsAutomation("resolve-entire-bracket", { bracketID });
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
                            messageData = await sendRecordedMessage<ScoreReportingReportKeys>({
                                key: "report_staff_notification",
                                mapObject: messageData,
                                channelID: eventSettings.logging.staffScoreReport,
                                content: `📣 A score report from ${submittingTeam ? submittingTeam.name : "a team"} has been approved by their opponent and is ready for staff approval\n${matchLink}/score-reporting`,
                                success: async (mapObject : MapObject) => {
                                    await updateRecord(Cache, "Reports", report, {
                                        "Message Data": mapObject.textMap
                                    }, "automation/on-score-report-update");
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
                                return discordControl.get("role_id") ? `<@&${discordControl.get("role_id")}>` : "";
                            });
                            messageData = await sendRecordedMessage<ScoreReportingReportKeys>({
                                key: "report_opponent_notification",
                                mapObject: messageData,
                                channelID: eventSettings.logging.captainNotifications,
                                content: `📣 ${opponentPings.join(" ")}\nA score report from ${submittingTeam ? submittingTeam.name : "your opponent"} is ready for approval\n${matchLink}/score-reporting`,
                                success: async (mapObject : MapObject) => {
                                    await updateRecord(Cache, "Reports", report, {
                                        "Message Data": mapObject.textMap
                                    }, "automation/on-score-report-update");
                                }
                            });

                            // we can also go straight to staff approving if necessary
                        } else if (client &&
                            (!eventSettings?.reporting?.score?.opponentApprove || report.approved_by_opponent) && // passed opponent approval
                            eventSettings?.logging?.staffApprovalNotifications &&
                            eventSettings?.reporting?.score?.staffApprove &&
                            !report.approved_by_staff
                        ) {
                            messageData = await sendRecordedMessage<ScoreReportingReportKeys>({
                                key: "report_staff_notification",
                                mapObject: messageData,
                                channelID: eventSettings.logging.staffApprovalNotifications,
                                content: `📣 A score report from ${submittingTeam ? submittingTeam.name : "a team"} has been approved by their opponent and is ready for staff approval\n${matchLink}/score-reporting`,
                                success: async (mapObject : MapObject) => {
                                    await updateRecord(Cache, "Reports", report, {
                                        "Message Data": mapObject.textMap
                                    }, "automation/on-score-report-update");
                                }
                            });

                        }

                    } else if (!oldData.countered_by_opponent && report.countered_by_opponent) {
                        // Opponent has counter
                        console.log("Report has been counted by opposing team");
                        console.log({oldData, newData: report});

                        messageData = await looseDeleteRecordedMessage<ScoreReportingReportKeys>(messageData, "report_opponent_notification");

                        // tell opponent
                        if (client &&
                            submittingTeam &&
                            eventSettings?.logging?.captainNotifications &&
                            !report.approved_by_opponent
                        ) {
                            const discordControl = new MapObject(submittingTeam.discord_control);
                            const originalPing = discordControl.get("role_id") ? `<@&${discordControl.get("role_id")}>` : submittingTeam.name;

                            messageData = await sendRecordedMessage<ScoreReportingReportKeys>({
                                key: "report_opponent_notification",
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
                            messageData = await looseDeleteRecordedMessage<ScoreReportingReportKeys>(messageData, "report_staff_notification");
                            messageData = await sendRecordedMessage<ScoreReportingReportKeys>({
                                key: "report_staff_notification",
                                mapObject: messageData,
                                channelID: eventSettings.logging.staffScoreReport,
                                content: `📣 A score report from ${submittingTeam ? submittingTeam.name : "a team"} has been **denied and countered** by their opponent.\n${matchLink}/score-reporting`,
                                success: async (mapObject : MapObject) => {
                                    await updateRecord(Cache, "Reports", report, {
                                        "Message Data": mapObject.textMap
                                    }, "automation/on-score-report-update");
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
                        // approval messages that need to be deleted
                        messageData = await looseDeleteRecordedMessages<ReschedulingReportKeys>(messageData, ["reschedule_opponent_approval", "reschedule_staff_approval", "reschedule_staff_preapproval"]);

                        // #3 Teams pinged about reschedule

                        const teamPings = allTeams.map(opponent => {
                            const discordControl = new MapObject(opponent?.discord_control);
                            return discordControl.get("role_id") ? `<@&${discordControl.get("role_id")}>` : "";
                        });

                        // remove old completion message
                        messageData = await looseDeleteRecordedMessage<ReschedulingReportKeys>(messageData, "reschedule_completed");
                        messageData = await sendRecordedMessage<ReschedulingReportKeys>({
                            key: "reschedule_completed",
                            mapObject: messageData,
                            channelID: eventSettings.logging?.matchTimeChanges,
                            content: `⌚ Match reschedule ${teamPings.join(" ")}: \n${allTeams.map(t =>  (getTeamEmojiText(t) || "") + (t.name || t.code || "")).join(" vs ")} ${match.start ? "rescheduled to" : "scheduled for"} ${hammerTime(proposedStart)}.\n${matchLink}`
                        });
                        await updateRecord(Cache, "Reports", report, {
                            "Approved": true,
                            "Message Data": messageData.textMap
                        }, "automation/on-score-report-update");


                        if (match.brackets) {
                            for (const bracketID of match.brackets) {
                                await manager.runActionAsAutomation("resolve-entire-bracket", { bracketID });
                            }
                        }

                    } catch (e) {
                        console.error("Action error - not continuing");
                    }

                } else {
                    // Not ready to approve - see what changed though
                    if (
                        (!oldData.approved_by_team && report.approved_by_team) &&     // just submitted
                        eventSettings.reporting.rescheduling.staffApprove &&          // staff approval required
                        eventSettings.logging?.sendStaffPreapprovalNotifications &&   // staff pre approval messages enabled
                        eventSettings.logging?.staffApprovalNotifications &&          // staff notification channel set up
                        !report.approved_by_staff                                     // not yet approved by staff
                    ) {
                        // Send a pre-approval message
                        console.log("Triggering pre-approval message for staff");
                        messageData = await sendRecordedMessage<ReschedulingReportKeys>({
                            key: "reschedule_staff_preapproval",
                            mapObject: messageData,
                            channelID: eventSettings.logging.staffApprovalNotifications,
                            content: {
                                content: "",
                                embeds: [{
                                    title: `${match.start ? "Reschedule" : "Schedule"} request: ${allTeams.map(t => (getTeamEmojiText(t) || "") + (t.name || t.code || "")).join(" vs ")}`,
                                    url: `${matchLink}/rescheduling`,
                                    description: `${submittingTeam?.name ? `${submittingTeam.name} have` : "An opponent has"} ${match.start ? "requested a reschedule" : "requested a start time"} for the match.\nStaff approval is required, pre-approval is available now.`,
                                    fields: [
                                        {
                                            name: "Proposed start time",
                                            value: hammerTime(proposedStart),
                                            inline: true
                                        },
                                        {
                                            name: "Current start time",
                                            value: match.start ? hammerTime(match.start) : "Not yet scheduled",
                                            inline: true
                                        }
                                    ],
                                    thumbnail: {
                                        url: `${dataServer}/match.png?id=${cleanID(match.id)}&size=720&padding=30`,
                                    },
                                    color: eventColor
                                }],
                                components: [
                                    {
                                        type: 1,
                                        components: [
                                            new ButtonBuilder()
                                                .setLabel("Pre-approve")
                                                .setEmoji(emoji.transparent.shield_check)
                                                .setStyle(ButtonStyle.Primary)
                                                .setCustomId(`reschedule_staff_approval/${cleanID(match.id)}/pre-approve`),
                                            new ButtonBuilder()
                                                .setLabel("Force approve")
                                                .setEmoji(emoji.transparent.check)
                                                .setStyle(ButtonStyle.Success)
                                                .setCustomId(`reschedule_staff_approval/${cleanID(match.id)}/force-approve`),
                                            new ButtonBuilder()
                                                .setLabel("Deny")
                                                .setEmoji(emoji.transparent.times)
                                                .setStyle(ButtonStyle.Danger)
                                                .setCustomId(`reschedule_staff_approval/${cleanID(match.id)}/deny`),
                                            new ButtonBuilder()
                                                .setLabel("Details")
                                                .setStyle(ButtonStyle.Link)
                                                .setURL(`${matchLink}/rescheduling`)
                                        ]
                                    }
                                ]
                            },
                            success: async (mapObject: MapObject) => {
                                await updateRecord(Cache, "Reports", report, {
                                    "Message Data": mapObject.textMap
                                }, "automation/on-score-report-update");
                            }
                        });
                    }

                    if (
                        (!oldData.approved_by_team && report.approved_by_team) &&     // just submitted
                        eventSettings.reporting.rescheduling.opponentApprove &&       // opponent approval required
                        !report.approved_by_opponent                                  // not yet approved by opponent
                    ) {
                        // #1 Opponent approval request
                        console.log("Opponent approval request");

                        const opponentPings = opponents.map(opponent => {
                            const discordControl = new MapObject(opponent?.discord_control);
                            return discordControl.get("role_id") ? `<@&${discordControl.get("role_id")}>` : "";
                        });


                        if (eventSettings.logging?.captainNotifications) {
                            messageData = await sendRecordedMessage<ReschedulingReportKeys>({
                                key: "reschedule_opponent_approval",
                                mapObject: messageData,
                                channelID: eventSettings.logging?.captainNotifications,
                                content: {
                                    content: `📣 ${opponentPings.join(" ")}`,
                                    embeds: [{
                                        title: `${match.start ? "Reschedule" : "Schedule"} request: ${allTeams.map(t => (getTeamEmojiText(t) || "") + (t.name || t.code || "")).join(" vs ")}`,
                                        url: `${matchLink}/rescheduling`,
                                        description: `${submittingTeam?.name ? `${submittingTeam.name} have` : "Your opponent has"} ${match.start ? "requested a reschedule" : "requested a start time"} for the match.`,
                                        fields: [
                                            {
                                                name: "Proposed start time",
                                                value: hammerTime(proposedStart),
                                                inline: true
                                            },
                                            {
                                                name: "Current start time",
                                                value: match.start ? hammerTime(match.start) : "Not yet scheduled",
                                                inline: true
                                            }
                                        ],
                                        // author: {
                                        //     name: event.name,
                                        //     icon_url: eventTheme?.id ? `${dataServer}/theme.png?id=${cleanID(eventTheme?.id)}&size=500&padding=20` : null,
                                        //     author_url: `https://${subdomain}slmn.gg/event/${cleanID(event.id)}`
                                        // },
                                        thumbnail: {
                                            url: `${dataServer}/match.png?id=${cleanID(match.id)}&size=720&padding=30`,
                                        },
                                        color: eventColor
                                    }],
                                    components: [
                                        {
                                            type: 1,
                                            components: [
                                                new ButtonBuilder()
                                                    .setLabel("Approve")
                                                    .setEmoji(emoji.transparent.check)
                                                    .setStyle(ButtonStyle.Success)
                                                    .setCustomId(`reschedule_opponent_approval/${cleanID(match.id)}/approve`),
                                                new ButtonBuilder()
                                                    .setLabel("Deny")
                                                    .setEmoji(emoji.transparent.times)
                                                    .setStyle(ButtonStyle.Danger)
                                                    .setCustomId(`reschedule_opponent_approval/${cleanID(match.id)}/deny`),
                                                new ButtonBuilder()
                                                    .setLabel("Details")
                                                    // .setEmoji("<:infocircle:1322010140916056225>")
                                                    .setStyle(ButtonStyle.Link)
                                                    .setURL(`${matchLink}/rescheduling`)
                                            ]
                                        }
                                    ]
                                },
                                success: async (mapObject: MapObject) => {
                                    await updateRecord(Cache, "Reports", report, {
                                        "Message Data": mapObject.textMap
                                    }, "automation/on-score-report-update");
                                }
                            });
                        }
                    } else if (
                        (
                            (!oldData.approved_by_team && report.approved_by_team &&
                                !eventSettings.reporting.rescheduling.opponentApprove) ||   // just submitted and opponent not required
                            (!oldData.approved_by_opponent && report.approved_by_opponent) // or opponent approval just completed
                        ) &&
                        eventSettings.reporting.rescheduling.staffApprove &&     // staff approval required
                        !report.approved_by_staff                                // not yet approved by staff
                    ) {
                        // #2 Staff prompted about request
                        console.log("Staff prompt for request");

                        messageData = await looseDeleteRecordedMessage<ReschedulingReportKeys>(messageData, "reschedule_staff_preapproval");
                        messageData = await sendRecordedMessage<ReschedulingReportKeys>({
                            key: "reschedule_staff_approval",
                            mapObject: messageData,
                            channelID: eventSettings.logging?.staffApprovalNotifications,
                            content: {
                                content: "",
                                embeds: [{
                                    title: `${match.start ? "Reschedule" : "Schedule"} request: ${allTeams.map(t => (getTeamEmojiText(t) || "") + (t.name || t.code || "")).join(" vs ")}`,
                                    url: `${matchLink}/rescheduling`,
                                    description: `${submittingTeam?.name ? `${submittingTeam.name} have` : "An opponent has"} ${match.start ? "requested a reschedule" : "requested a start time"} for the match.\nStaff approval is required.`,
                                    fields: [
                                        {
                                            name: "Proposed start time",
                                            value: hammerTime(proposedStart),
                                            inline: true
                                        },
                                        {
                                            name: "Current start time",
                                            value: match.start ? hammerTime(match.start) : "Not yet scheduled",
                                            inline: true
                                        }
                                    ],
                                    thumbnail: {
                                        url: `${dataServer}/match.png?id=${cleanID(match.id)}&size=720&padding=30`,
                                    },
                                    color: eventColor
                                }],
                                components: [
                                    {
                                        type: 1,
                                        components: [
                                            new ButtonBuilder()
                                                .setLabel("Approve")
                                                .setEmoji(emoji.transparent.check)
                                                .setStyle(ButtonStyle.Success)
                                                .setCustomId(`reschedule_staff_approval/${cleanID(match.id)}/approve`),
                                            new ButtonBuilder()
                                                .setLabel("Deny")
                                                .setEmoji(emoji.transparent.times)
                                                .setStyle(ButtonStyle.Danger)
                                                .setCustomId(`reschedule_staff_approval/${cleanID(match.id)}/deny`),
                                            new ButtonBuilder()
                                                .setLabel("Details")
                                                .setStyle(ButtonStyle.Link)
                                                .setURL(`${matchLink}/rescheduling`)
                                        ]
                                    }
                                ]
                            },
                            success: async (mapObject: MapObject) => {
                                await updateRecord(Cache, "Reports", report, {
                                    "Message Data": mapObject.textMap
                                }, "automation/on-score-report-update");
                            }
                        });
                    } else if (
                        eventSettings.reporting.rescheduling.opponentApprove && // opponent approval required
                        (!oldData.denied_by_opponent && report.denied_by_opponent) && // just denied by opponent
                        client && eventSettings?.logging?.captainNotifications
                    ) {
                        // opponent denial
                        console.log("Just Denied");
                        messageData = await looseDeleteRecordedMessages<ReschedulingReportKeys>(messageData, ["reschedule_opponent_approval", "reschedule_staff_approval", "reschedule_staff_preapproval"]);

                        const teamPings = allTeams.map(opponent => {
                            const discordControl = new MapObject(opponent?.discord_control);
                            return discordControl.get("role_id") ? `<@&${discordControl.get("role_id")}>` : "";
                        });

                        const opponentNames = opponents.map(opponent => opponent.name || opponent.code).join(" & ");

                        console.log("Message send start");
                        messageData = await sendRecordedMessage<ReschedulingReportKeys>({
                            key: "reschedule_opponent_denial",
                            mapObject: messageData,
                            channelID: eventSettings.logging?.captainNotifications,
                            content: {
                                content: `📣 ${teamPings.join(" ")}`,
                                embeds:  match.start ? [{
                                    title: `Reschedule request denied: ${allTeams.map(t => (getTeamEmojiText(t) || "") + (t.name || t.code || "")).join(" vs ")}`,
                                    url: `${matchLink}/rescheduling`,
                                    description: `${emoji.circle.danger_exclamation} ${opponentNames ? `${opponentNames} have` : "Your opponent has"} denied a reschedule for the match.\nYou can start a new request on SLMN.GG.`,
                                    fields: [
                                        {
                                            name: "Match start time",
                                            value: `The match has **not been rescheduled** and is still set for ${hammerTime(match.start)}`
                                        },
                                        {
                                            name: "Proposed start time",
                                            value: hammerTime(proposedStart),
                                            inline: true
                                        },

                                    ],
                                    thumbnail: {
                                        url: `${dataServer}/match.png?id=${cleanID(match.id)}&size=720&padding=30`,
                                    },
                                    color: parseInt("dc3545", 16)
                                }] : [{
                                    title: `Schedule request denied: ${allTeams.map(t => (getTeamEmojiText(t) || "") + (t.name || t.code || "")).join(" vs ")}`,
                                    url: `${matchLink}/rescheduling`,
                                    description: `${emoji.circle.danger_exclamation} ${opponentNames ? `${opponentNames} have` : "Your opponent has"} denied the requested start time for the match.\nYou can start a new request on SLMN.GG.`,
                                    fields: [
                                        {
                                            name: "Match start time",
                                            value: "The match has **not been scheduled**.",
                                            inline: true
                                        },
                                        {
                                            name: "Proposed start time",
                                            value: hammerTime(proposedStart),
                                            inline: true
                                        },
                                    ],
                                    thumbnail: {
                                        url: `${dataServer}/match.png?id=${cleanID(match.id)}&size=720&padding=30`,
                                    },
                                    color: parseInt("dc3545", 16)
                                }],
                                components: [
                                    {
                                        type: 1,
                                        components: [
                                            new ButtonBuilder()
                                                .setLabel("Details")
                                                // .setEmoji("<:infocircle:1322010140916056225>")
                                                .setStyle(ButtonStyle.Link)
                                                .setURL(`${matchLink}/rescheduling`)
                                        ]
                                    }
                                ]
                            },
                            success: async (mapObject) => {
                                console.log("Message send success", mapObject.data);
                                await updateRecord(Cache, "Reports", report, {
                                    "Message Data": mapObject.textMap
                                }, "automation/on-score-report-update");
                            }
                        });
                    } if (
                        (!oldData.denied_by_staff && report.denied_by_staff) && // just denied by staff
                        client && eventSettings?.logging?.captainNotifications
                    ) {
                        // opponent denial
                        console.log("Just Denied by staff");
                        messageData = await looseDeleteRecordedMessages<ReschedulingReportKeys>(messageData, ["reschedule_opponent_approval", "reschedule_staff_approval", "reschedule_staff_preapproval", "reschedule_opponent_denial"]);

                        const teamPings = allTeams.map(opponent => {
                            const discordControl = new MapObject(opponent?.discord_control);
                            return discordControl.get("role_id") ? `<@&${discordControl.get("role_id")}>` : "";
                        });

                        console.log("Message send start");
                        messageData = await sendRecordedMessage<ReschedulingReportKeys>({
                            key: "reschedule_staff_denial",
                            mapObject: messageData,
                            channelID: eventSettings.logging?.captainNotifications,
                            content: {
                                content: `📣 ${teamPings.join(" ")}`,
                                embeds:  match.start ? [{
                                    title: `Reschedule request denied: ${allTeams.map(t => (getTeamEmojiText(t) || "") + (t.name || t.code || "")).join(" vs ")}`,
                                    url: `${matchLink}/rescheduling`,
                                    description: `${emoji.circle.danger_exclamation} Staff have denied a reschedule for the match.\nRescheduling for this match has been locked, contact staff for more information.`,
                                    fields: [
                                        {
                                            name: "Match start time",
                                            value: `The match has **not been rescheduled** and is still set for ${hammerTime(match.start)}`
                                        },
                                        {
                                            name: "Proposed start time",
                                            value: hammerTime(proposedStart),
                                            inline: true
                                        },

                                    ],
                                    thumbnail: {
                                        url: `${dataServer}/match.png?id=${cleanID(match.id)}&size=720&padding=30`,
                                    },
                                    color: parseInt("dc3545", 16)
                                }] : [{
                                    title: `Schedule request denied: ${allTeams.map(t => (getTeamEmojiText(t) || "") + (t.name || t.code || "")).join(" vs ")}`,
                                    url: `${matchLink}/rescheduling`,
                                    description: `${emoji.circle.danger_exclamation} Staff have denied the requested start time for the match.\nScheduling for this match has been locked, contact staff for more information.`,
                                    fields: [
                                        {
                                            name: "Match start time",
                                            value: "The match has **not been scheduled**.",
                                            inline: true
                                        },
                                        {
                                            name: "Proposed start time",
                                            value: hammerTime(proposedStart),
                                            inline: true
                                        },
                                    ],
                                    thumbnail: {
                                        url: `${dataServer}/match.png?id=${cleanID(match.id)}&size=720&padding=30`,
                                    },
                                    color: parseInt("dc3545", 16)
                                }],
                                components: [
                                    {
                                        type: 1,
                                        components: [
                                            new ButtonBuilder()
                                                .setLabel("Details")
                                                // .setEmoji("<:infocircle:1322010140916056225>")
                                                .setStyle(ButtonStyle.Link)
                                                .setURL(`${matchLink}/rescheduling`)
                                        ]
                                    }
                                ]
                            },
                            success: async (mapObject) => {
                                console.log("Message send success", mapObject.data);
                                await updateRecord(Cache, "Reports", report, {
                                    "Message Data": mapObject.textMap
                                }, "automation/on-score-report-update");
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

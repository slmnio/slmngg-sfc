import { ActionAuth, EventSettings, Match, MatchResolvableID, Report, ScoreReportingReportKeys } from "../types.js";
import { Action } from "../action-utils/action-manager-models.js";
import { cleanTypedID, dirtyID } from "shared";
import { getMatchScoreReporting } from "../action-utils/action-utils.js";
import { get } from "../action-utils/action-cache.js";
import { isEventStaffOrHasRole } from "../action-utils/action-permissions.js";
import { MapObject } from "../discord/managers.js";
import client from "../discord/client.js";
import { looseDeleteRecordedMessage, looseDeleteRecordedMessages } from "../action-utils/ts-action-utils.js";

export default {
    key: "staff-approve-score-report",
    requiredParams: ["matchID", "reaction"],
    auth: ["user"],
    async handler(
        { matchID, reaction }: { matchID: MatchResolvableID, reaction: "approve" | "pre-approve" | "force-approve" | "delete" | "force-counter-approve" },
        { user }: ActionAuth
    ) {
        const { match, report } : { match: Match, report: Report | undefined } = await getMatchScoreReporting(matchID);
        if (!report) {
            throw "There is no score report on this match";
        }

        if (!match?.event?.[0]) throw "Event couldn't be loaded for this match";
        const event = await get(match.event[0]);
        if (!event?.id) throw "Event couldn't be loaded for this match";

        if (!(await isEventStaffOrHasRole(user, event, null, ["Can edit any match", "Can edit any event", "Full broadcast permissions"]))) {
            throw "You don't have permission to edit this match, including score reporting.";
        }

        let messageData = new MapObject(report.message_data);

        console.log(messageData.data);
        // Remove previous staff notifications
        messageData = await looseDeleteRecordedMessage<ScoreReportingReportKeys>(messageData, "report_staff_notification");

        if (reaction === "pre-approve") {
            await this.helpers.updateRecord("Reports", report, {
                "Approved by staff": true,
                "Log": (report.log ? report.log + "\n" : "") + [
                    `date=${(new Date()).getTime()}`,
                    `user=${user.airtable.id}`,
                    "staff=true",
                    "text=Pre-approved score report",
                    "key=staff_preapproved"
                ].join("|"),
                "Message Data": messageData.textMap
            });
        } else if (reaction === "approve") {
            await this.helpers.updateRecord("Reports", report, {
                "Approved by staff": true,
                "Log": (report.log ? report.log + "\n" : "") + [
                    `date=${(new Date()).getTime()}`,
                    `user=${user.airtable.id}`,
                    "staff=true",
                    "text=Approved score report",
                    "key=staff_approved"
                ].join("|"),
                "Message Data": messageData.textMap
            });
        } else if (reaction === "force-approve") {
            messageData = await looseDeleteRecordedMessage<ScoreReportingReportKeys>(messageData, "report_opponent_notification");
            await this.helpers.updateRecord("Reports", report, {
                "Approved by staff": true,
                "Force approved": true,
                "Log": (report.log ? report.log + "\n" : "") + [
                    `date=${(new Date()).getTime()}`,
                    `user=${user.airtable.id}`,
                    "staff=true",
                    "text=Force-approved score report",
                    "key=staff_force_approved"
                ].join("|"),
                "Message Data": messageData.textMap
            });
        } else if (reaction === "force-counter-approve") {

            await this.helpers.updateRecord("Reports", report, {
                "Approved by staff": true,
                "Force approved": true,

                "Data": report.countered_data,
                "Countered Data": "",

                "Log": (report.log ? report.log + "\n" : "")  + [
                    `date=${(new Date()).getTime()}`,
                    `user=${user.airtable.id}`,
                    "staff=true",
                    "text=Force-approved counter report",
                    "key=staff_force_approved_counter"
                ].join("|"),
                "Message Data": messageData.textMap
            });
        } else if (reaction === "delete") {
            messageData = await looseDeleteRecordedMessages<ScoreReportingReportKeys>(messageData, ["report_opponent_notification", "report_staff_notification", "report_completed_staff", "report_completed_public"]);

            await this.helpers.updateRecord("Matches", match, {
                "Reports": [],
                "Report History": [...(match.report_history || []), report.id].map(x => dirtyID(x))
            });

            const eventSettings = JSON.parse(event.blocks || "") as EventSettings;
            let subdomain = "";
            if (event?.subdomain || event?.partial_subdomain) {
                subdomain = (event.subdomain || event.partial_subdomain || "") + ".";
            }
            const matchLink = `https://${subdomain}slmn.gg/match/${cleanTypedID(match.id)}`;

            if (client && eventSettings?.logging?.staffScoreReport) {
                const channel = await client.channels.fetch(eventSettings.logging.staffScoreReport);
                if (channel?.isSendable()) {
                    try {
                        await channel.send(`🗑️ **Denied & deleted**: Score report removed by ${user.airtable.name}.\n${matchLink}`);
                    } catch (e) {
                        console.error("Channel sending error", e);
                    }
                }
            }
        } else {
            throw {
                errorCode: 501,
                errorMessage: "Unknown method for staff approvals"
            };
        }


    }
// @ts-expect-error Needs some action refactoring before it can fully satisfy
} satisfies Action;

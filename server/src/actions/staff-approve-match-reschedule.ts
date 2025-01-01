import { ActionAuth, Match, MatchResolvableID, Report, ReschedulingReportKeys } from "../types.js";
import { Action } from "../action-utils/action-manager-models.js";
import { dirtyID, getMatchRescheduling } from "../action-utils/action-utils.js";
import { get } from "../action-utils/action-cache.js";
import { isEventStaffOrHasRole } from "../action-utils/action-permissions.js";
import { MapObject } from "../discord/managers.js";
import { looseDeleteRecordedMessages } from "../action-utils/ts-action-utils.js";

export default {
    key: "staff-approve-match-reschedule",
    requiredParams: ["matchID", "reaction"],
    auth: ["user"],
    async handler(
        { matchID, reaction }: { matchID: MatchResolvableID, reaction: "approve" | "pre-approve" | "force-approve" | "deny" | "delete" },
        { user }: ActionAuth
    ) {
        const { match, report } : { match: Match, report: Report | undefined } = await getMatchRescheduling(matchID);
        if (!report) {
            throw "There is no match rescheduling request on this match";
        }

        if (!match?.event?.[0]) throw "Event couldn't be loaded for this match";
        const event = await get(match.event[0]);
        if (!event?.id) throw "Event couldn't be loaded for this match";

        if (!(await isEventStaffOrHasRole(user, event, null, ["Can edit any match", "Can edit any event", "Full broadcast permissions"]))) {
            throw "You don't have permission to edit this match, including match rescheduling.";
        }

        let messageData = new MapObject(report.message_data);

        // Remove previous notifications
        // messageData = await looseDeleteRecordedMessage<ReschedulingReportKeys>(messageData, "staff_reschedule_notification");

        if (reaction === "pre-approve") {
            messageData = await looseDeleteRecordedMessages<ReschedulingReportKeys>(messageData, ["reschedule_staff_approval", "reschedule_staff_preapproval"]);

            await this.helpers.updateRecord("Reports", report, {
                "Approved by staff": true,
                "Log": (report.log ? report.log + "\n" : "") + [
                    `date=${(new Date()).getTime()}`,
                    `user=${user.airtable.id}`,
                    "staff=true",
                    "text=Pre-approved match reschedule",
                    "key=staff_preapproved"
                ].join("|"),
                "Message Data": messageData.textMap
            });
        } else if (reaction === "approve") {
            messageData = await looseDeleteRecordedMessages<ReschedulingReportKeys>(messageData, ["reschedule_staff_approval", "reschedule_staff_preapproval"]);

            await this.helpers.updateRecord("Reports", report, {
                "Approved by staff": true,
                "Log": (report.log ? report.log + "\n" : "") + [
                    `date=${(new Date()).getTime()}`,
                    `user=${user.airtable.id}`,
                    "staff=true",
                    "text=Approved match reschedule",
                    "key=staff_approved"
                ].join("|"),
                "Message Data": messageData.textMap
            });
        } else if (reaction === "force-approve") {
            messageData = await looseDeleteRecordedMessages<ReschedulingReportKeys>(messageData, ["reschedule_staff_approval", "reschedule_staff_preapproval", "reschedule_opponent_approval"]);
            await this.helpers.updateRecord("Reports", report, {
                "Approved by staff": true,
                "Force approved": true,
                "Log": (report.log ? report.log + "\n" : "") + [
                    `date=${(new Date()).getTime()}`,
                    `user=${user.airtable.id}`,
                    "staff=true",
                    "text=Force-approved match reschedule",
                    "key=staff_force_approved"
                ].join("|"),
                "Message Data": messageData.textMap
            });
        } else if (reaction === "deny") {
            // approval messages that need to be deleted
            messageData = await looseDeleteRecordedMessages<ReschedulingReportKeys>(messageData, ["reschedule_opponent_approval", "reschedule_staff_approval", "reschedule_staff_preapproval"]);

            await this.helpers.updateRecord("Reports", report, {
                "Denied by staff": true,
                "Log": (report.log ? report.log + "\n" : "") + [
                    `date=${(new Date()).getTime()}`,
                    `user=${user.airtable.id}`,
                    "staff=true",
                    "text=Denied match reschedule",
                    "key=staff_denied"
                ].join("|"),
                "Message Data": messageData.textMap
            });
        } else if (reaction === "delete") {
            // any messages from a previous approval that was denied
            messageData = await looseDeleteRecordedMessages<ReschedulingReportKeys>(messageData, ["reschedule_staff_denial", "reschedule_opponent_denial", "reschedule_team_cancel", "reschedule_opponent_cancel"]);
            // approval messages that need to be deleted
            messageData = await looseDeleteRecordedMessages<ReschedulingReportKeys>(messageData, ["reschedule_opponent_approval", "reschedule_staff_approval", "reschedule_staff_preapproval"]);

            await this.helpers.updateRecord("Reports", report, {
                "Log": (report.log ? report.log + "\n" : "") + [
                    `date=${(new Date()).getTime()}`,
                    `user=${user.airtable.id}`,
                    "staff=true",
                    "text=Deleted match reschedule",
                    "key=staff_deleted"
                ].join("|"),
                "Message Data": messageData.textMap
            });
            await this.helpers.updateRecord("Matches", match, {
                "Reports": [],
                "Report History": [...(match.report_history || []), report.id].map(x => dirtyID(x))
            });
        } else {
            throw {
                errorCode: 501,
                errorMessage: "Unknown method for staff approvals"
            };
        }


    }
// @ts-expect-error Needs some action refactoring before it can fully satisfy
} satisfies Action;

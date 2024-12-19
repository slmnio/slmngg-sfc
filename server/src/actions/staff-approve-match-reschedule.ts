import { ActionAuth, Match, MatchResolvableID, Report } from "../types.js";
import { Action } from "../action-utils/action-manager-models.js";
import { getMatchRescheduling, looseDeleteMessage } from "../action-utils/action-utils.js";
import { get } from "../action-utils/action-cache.js";
import { isEventStaffOrHasRole } from "../action-utils/action-permissions.js";
import { MapObject } from "../discord/managers.js";

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
        messageData = await looseDeleteMessage(messageData, "staff_reschedule_notification");

        if (reaction === "pre-approve") {
            await this.helpers.updateRecord("Reports", report, {
                "Approved by staff": true,
                "Log": (report.log ? report.log + "\n" : "") + `${(new Date()).toLocaleString()}: ${user.airtable.name} pre-approved match reschedule request as staff`,
                "Message Data": messageData.textMap
            }, "actions/staff-approve-match-reschedule");
        } else if (reaction === "approve") {
            await this.helpers.updateRecord("Reports", report, {
                "Approved by staff": true,
                "Log": (report.log ? report.log + "\n" : "") + `${(new Date()).toLocaleString()}: ${user.airtable.name} approved match reschedule request as staff`,
                "Message Data": messageData.textMap
            }, "actions/staff-approve-match-reschedule");
        } else if (reaction === "force-approve") {
            messageData = await looseDeleteMessage(messageData, "opponent_captain_notification");

            await this.helpers.updateRecord("Reports", report, {
                "Approved by staff": true,
                "Force approved": true,
                "Log": (report.log ? report.log + "\n" : "") + `${(new Date()).toLocaleString()}: ${user.airtable.name} force-approved match reschedule as staff`,
                "Message Data": messageData.textMap
            }, "actions/staff-approve-match-reschedule");
        } else if (reaction === "deny") {
            messageData = await looseDeleteMessage(messageData, "opponent_captain_notification");

            await this.helpers.updateRecord("Reports", report, {
                "Denied by staff": true,
                "Log": (report.log ? report.log + "\n" : "") + `${(new Date()).toLocaleString()}: ${user.airtable.name} denied match reschedule as staff`,
                "Message Data": messageData.textMap
            }, "actions/staff-approve-match-reschedule");
        } else if (reaction === "delete") {
            messageData = await looseDeleteMessage(messageData, "opponent_captain_notification");

            await this.helpers.updateRecord("Reports", report, {
                "Log": (report.log ? report.log + "\n" : "") + `${(new Date()).toLocaleString()}: ${user.airtable.name} deleted match reschedule as staff`,
                "Message Data": messageData.textMap
            }, "actions/staff-approve-match-reschedule");
            await this.helpers.updateRecord("Matches", match, {
                "Reports": []
            }, "actions/staff-approve-match-reschedule");
        } else {
            throw {
                errorCode: 501,
                errorMessage: "Unknown method for staff approvals"
            };
        }


    }
// @ts-expect-error Needs some action refactoring before it can fully satisfy
} satisfies Action;

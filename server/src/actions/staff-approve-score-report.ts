import { ActionAuth, Match, MatchResolvableID, Report } from "../types.js";
import { Action } from "../action-utils/action-manager-models.js";
import { getMatchScoreReporting } from "../action-utils/action-utils.js";
import { get } from "../action-utils/action-cache.js";
import { isEventStaffOrHasRole } from "../action-utils/action-permissions.js";

export default {
    key: "staff-approve-score-report",
    requiredParams: ["matchID", "reaction"],
    auth: ["user"],
    async handler(
        { matchID, reaction }: { matchID: MatchResolvableID, reaction: "approve" | "deny" },
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
            throw "You don't have permission to edit this match";
        }

        if (reaction !== "approve") throw {
            errorCode: 501,
            errorMessage: "Only approvals are supported right now."
        };

        await this.helpers.updateRecord("Reports", report, {
            "Approved by staff": true,
            "Log": (report.log ? report.log + "\n" : "") + `${(new Date()).toLocaleString()}: ${user.airtable.name} approved score report as staff`
        });
    }
// @ts-expect-error Needs some action refactoring before it can fully satisfy
} satisfies Action;

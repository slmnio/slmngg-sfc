import { ActionAuth, Match, MatchResolvableID, Report, ReschedulingReportKeys } from "../types.js";
import { cleanID, dirtyID, getMatchRescheduling, } from "../action-utils/action-utils.js";
import { Action } from "../action-utils/action-manager-models.js";
import { get } from "../action-utils/action-cache.js";
import { MapObject } from "../discord/managers.js";
import { looseDeleteRecordedMessage, looseDeleteRecordedMessages } from "../action-utils/ts-action-utils.js";

export default {
    key: "approve-match-reschedule",
    requiredParams: ["matchID", "reaction"],
    auth: ["user"],
    async handler(
        {matchID, reaction}: { matchID: MatchResolvableID, reaction: "approve" | "deny" | "delete" },
        {user}: ActionAuth
    ) {
        const {match, report}: { match: Match, report: Report | undefined } = await getMatchRescheduling(matchID);
        if (!report) {
            throw "There is no reschedule request on this match";
        }

        const teams = await Promise.all((match.teams || []).map(t => get(t)));

        const reportableTeams = teams.filter(t => {
            // if (reaction === "counter-approve" || reaction === "counter-deny") {
            //     // original team
            //     return cleanID(t.id) === cleanID(report.team?.[0]);
            // }
            return cleanID(t.id) !== cleanID(report.team?.[0]);
        });

        const actingTeam = reportableTeams.find(team => [
            ...(team.players || []),
            ...(team.captains || []),
            ...(team.staff || []),
            ...(team.owners || []),
        ].includes(dirtyID(user.airtable.id)));

        const isRelated = teams.some(team => [
            ...(team.players || []),
            ...(team.captains || []),
            ...(team.staff || []),
            ...(team.owners || []),
        ].includes(dirtyID(user.airtable.id)));

        if (!isRelated) throw "You don't have permission to use rescheduling for this match";

        if (reaction === "approve") {
            if (!actingTeam) throw "You don't have permission to approve this request";
            if (report.approved) throw "This request has already been approved";
            if (report.denied_by_opponent) throw "This request has already been denied";

            let messageData = new MapObject(report.message_data);

            messageData = await looseDeleteRecordedMessage<ReschedulingReportKeys>(messageData, "reschedule_opponent_approval");

            const response = await this.helpers.updateRecord("Reports", report, {
                "Approved by opponent": true,
                "Log": (report.log ? report.log + "\n" : "") + [
                    `date=${(new Date()).getTime()}`,
                    `user=${user.airtable.id}`,
                    `team=${actingTeam?.id}`,
                    "text=Approved match reschedule",
                    "key=approved_by_opponent"
                ].join("|"),
                "Message Data": messageData.textMap
            });
            if ("error" in response) {
                console.error("Airtable error", response.error);
                throw "System error";
            }
            return "Match reschedule approved";

        } else if (reaction === "deny") {
            if (!actingTeam) throw "You don't have permission to approve this request";
            if (report.approved) throw "This request has already been approved";
            if (report.denied_by_opponent) throw "This request has already been denied";

            let messageData = new MapObject(report.message_data);
            // approval messages that need to be deleted
            messageData = await looseDeleteRecordedMessages<ReschedulingReportKeys>(messageData, ["reschedule_opponent_approval", "reschedule_staff_approval", "reschedule_staff_preapproval"]);

            const response = await this.helpers.updateRecord("Reports", report, {
                "Denied by opponent": true,
                "Log": (report.log ? report.log + "\n" : "") + [
                    `date=${(new Date()).getTime()}`,
                    `user=${user.airtable.id}`,
                    `team=${actingTeam?.id}`,
                    "text=Denied match reschedule",
                    "key=denied_by_opponent"
                ].join("|"),
                "Message Data": messageData.textMap
            });
            if ("error" in response) {
                console.error("Airtable error", response.error);
                throw "System error";
            }

            return "Match reschedule denied";

        } else if (reaction === "delete") {
            // any messages from a previous approval that was denied

            if ((report.approved || report.denied_by_opponent) && !report.denied_by_staff) {
                // Finished report or opponent denial can start a fresh one. Staff deny locks it

                let messageData = new MapObject(report.message_data);
                // any messages from a previous approval that was denied
                messageData = await looseDeleteRecordedMessages<ReschedulingReportKeys>(messageData, ["reschedule_opponent_denial", "reschedule_staff_denial", "reschedule_team_cancel", "reschedule_opponent_cancel"]);

                const response = await this.helpers.updateRecord("Reports", report, {
                    "Log": (report.log ? report.log + "\n" : "") + [
                        `date=${(new Date()).getTime()}`,
                        `user=${user.airtable.id}`,
                        `team=${actingTeam?.id}`,
                        "text=Deleted match reschedule",
                        "key=deleted"
                    ].join("|"),
                    "Message Data": messageData.textMap
                });
                if ("error" in response) {
                    console.error("Airtable error", response.error);
                    throw "System error";
                }
                const matchClearResponse = await this.helpers.updateRecord("Matches", match, {
                    "Reports": [],
                    "Report History": [...(match.report_history || []), report.id].map(x => dirtyID(x))
                });
                if ("error" in matchClearResponse) {
                    console.error("Airtable error", matchClearResponse.error);
                    throw "System error";
                }

                return "Match reschedule deleted";

            } else {
                throw "You don't have permission to start a new request on this match";
            }
        }
    }
// @ts-expect-error Needs some action refactoring before it can fully satisfy
} satisfies Action;

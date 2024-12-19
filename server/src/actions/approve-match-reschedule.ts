import { ActionAuth, Match, MatchResolvableID, Report } from "../types.js";
import { cleanID, dirtyID, getMatchRescheduling, looseDeleteMessage } from "../action-utils/action-utils.js";
import { Action } from "../action-utils/action-manager-models.js";
import { get } from "../action-utils/action-cache.js";
import { MapObject } from "../discord/managers.js";

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
            let messageData = new MapObject(report.message_data);
            messageData = await looseDeleteMessage(messageData, "opponent_reschedule_request");

            await this.helpers.updateRecord("Reports", report, {
                "Approved by opponent": true,
                "Log": (report.log ? report.log + "\n" : "") + `${(new Date()).toLocaleString()}: ${user.airtable.name} approved reschedule request as ${actingTeam?.name}`,
                "Message Data": messageData.textMap
            });
        } else if (reaction === "deny") {
            if (!actingTeam) throw "You don't have permission to approve this request";
            let messageData = new MapObject(report.message_data);
            messageData = await looseDeleteMessage(messageData, "opponent_reschedule_request");

            await this.helpers.updateRecord("Reports", report, {
                "Denied by opponent": true,
                "Log": (report.log ? report.log + "\n" : "") + `${(new Date()).toLocaleString()}: ${user.airtable.name} denied reschedule request as ${actingTeam?.name}`,
                "Message Data": messageData.textMap
            });

        } else if (reaction === "delete") {
            if ((report.approved || report.denied_by_opponent) && !report.denied_by_staff) {
                // Finished report or opponent denial can start a fresh one. Staff deny locks it
                await this.helpers.updateRecord("Matches", match, {
                    "Reports": []
                });
            } else {
                throw "You don't have permission to start a new request on this match";
            }
        }
    }
// @ts-expect-error Needs some action refactoring before it can fully satisfy
} satisfies Action;

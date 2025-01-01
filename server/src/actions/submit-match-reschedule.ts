import { ActionAuth, Match, MatchResolvableID, Report } from "../types.js";
import { deAirtableRecord, dirtyID, getMatchRescheduling } from "../action-utils/action-utils.js";
import { get } from "../action-utils/action-cache.js";
import { Action } from "../action-utils/action-manager-models.js";

export default {
    key: "submit-match-reschedule",
    requiredParams: ["matchID", "startTime"],
    auth: ["user"],
    async handler(
        {matchID, startTime}: {
            matchID: MatchResolvableID,
            startTime: string
        },
        {user}: ActionAuth
    ) {
        const { match, report: request } : { match: Match, report: Report | undefined } = await getMatchRescheduling(matchID, { excludeCompleted: true });
        if (request) {
            throw "A reschedule request is already active on this match.";
        }

        const teams = await Promise.all((match.teams || []).map(t => get(t)));
        const actingTeam = teams.find(team => [
            ...(team.players || []),
            ...(team.captains || []),
            ...(team.staff || []),
            ...(team.owners || []),
        ].includes(dirtyID(user.airtable.id)));

        if (!actingTeam) throw "You don't have permission to report the score of this match";

        if (match.start) {
            const startTimeDate = new Date(startTime);
            const matchTimeDate = new Date(match.start);
            if (startTimeDate.getTime() === matchTimeDate.getTime()) {
                throw "The match is already scheduled for this time";
            }
        }

        const response = await this.helpers.createRecord("Reports", {
            "Type": "Rescheduling",
            "Player": [dirtyID(user.airtable.id)],
            "Team": [dirtyID(actingTeam.id)],
            "Match": [dirtyID(match.id)],
            "Data": JSON.stringify({
                start: startTime
            }),
            "Log": [
                `date=${(new Date()).getTime()}`,
                `user=${user.airtable.id}`,
                `team=${actingTeam?.id}`,
                `text=Requested ${match.start ? "schedule" : "reschedule"}`,
                "key=submitted_request"
            ].join("|")
        });
        if ("error" in response) {
            throw `Airtable error: ${response.errorMessage}`;
        }
        if (response?.[0]?.id) {
            await this.helpers.updateRecord("Matches", match, {
                "Reports": [...(match.reports || []), response?.[0].id]
            });
            await this.helpers.updateRecord("Reports", deAirtableRecord(response[0]), {
                "Approved by team": true
            });
            return response?.[0].id;
        }
    }
// @ts-expect-error Needs some action refactoring before it can fully satisfy
} satisfies Action;

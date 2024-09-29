import { Action } from "../action-utils/action-manager-models.js";
import { dirtyID, getMatchScoreReporting } from "../action-utils/action-utils.js";

import { ActionAuth, Match, MatchResolvableID, Report } from "../types.js";
import { get } from "../action-utils/action-cache.js";

export default {
    key: "submit-score-report",
    requiredParams: ["matchID", "reportData"],
    auth: ["user"],
    async handler(
        { matchID, reportData } : { matchID: MatchResolvableID, reportData: { mapData: object[], matchData: object[] }},
        { user } : ActionAuth
    ) {
        const { match, report } : { match: Match, report: Report | undefined } = await getMatchScoreReporting(matchID);
        if (report) {
            throw "A score has already been reported on this match";
        }

        // permissions:
        // any player (players) / staff (staff,captains,owners)
        // can do this

        const teams = await Promise.all((match.teams || []).map(t => get(t)));
        const actingTeam = teams.find(team => [
            ...(team.players || []),
            ...(team.captains || []),
            ...(team.staff || []),
            ...(team.owners || []),
        ].includes(dirtyID(user.airtable.id)));

        if (!actingTeam) throw "You don't have permission to report the score of this match";

        // no report exists

        const response = await this.helpers.createRecord("Reports", {
            "Type": "Scores",
            "Player": [dirtyID(user.airtable.id)],
            "Team": [dirtyID(actingTeam.id)],
            "Match": [dirtyID(match.id)],
            "Data": JSON.stringify(reportData),
            "Approved by team": true,
            "Log": `${(new Date()).toLocaleString()}: ${user.airtable.name} reported score as ${actingTeam?.name}`
        });

        console.log(response);

        if ("error" in response) {
            throw `Airtable error: ${response.errorMessage}`;
        }
        if (response?.[0]?.id) {
            await this.helpers.updateRecord("Matches", match, {
                "Reports": [...(match.reports || []), response?.[0].id]
            });
            return response?.[0].id;
        }


    }
// @ts-expect-error Needs some action refactoring before it can fully satisfy
} satisfies Action;

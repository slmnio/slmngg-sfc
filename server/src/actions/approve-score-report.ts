import { ActionAuth, Match, MatchResolvableID, Report } from "../types.js";
import { Action } from "../action-utils/action-manager-models.js";
import { cleanID, dirtyID, getMatchScoreReporting } from "../action-utils/action-utils.js";
import { get } from "../action-utils/action-cache.js";

export default {
    key: "approve-score-report",
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

        // permissions:
        // any player (players) / staff (staff,captains,owners)
        // can do this

        const teams = await Promise.all((match.teams || []).map(t => get(t)));
        const opponentTeams = teams.filter(t => cleanID(t.id) !== cleanID(report.team?.[0]));
        const actingTeam = opponentTeams.find(team => [
            ...(team.players || []),
            ...(team.captains || []),
            ...(team.staff || []),
            ...(team.owners || []),
        ].includes(dirtyID(user.airtable.id)));

        if (!actingTeam) throw "You don't have permission to report the score of this match";

        if (reaction !== "approve") throw {
            errorCode: 501,
            errorMessage: "Only approvals are supported right now. Talk to staff."
        };

        await this.helpers.updateRecord("Reports", report, {
            "Approved by opponent": true,
            "Log": (report.log ? report.log + "\n" : "") + `${(new Date()).toLocaleString()}: ${user.airtable.name} approved score report as ${actingTeam?.name}`
        });
    }
} satisfies Action;

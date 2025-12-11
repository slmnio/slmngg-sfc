import type { Action } from "../action-utils/action-manager-models.js";
import { deAirtableRecord, getMatchScoreReporting } from "../action-utils/action-utils.js";

import type { ActionAuth, Match, MatchResolvableID, Report } from "shared";
import { cleanTypedID, dirtyID } from "shared";
import { get } from "../action-utils/action-cache.js";

export default {
    key: "submit-score-report",
    requiredParams: ["matchID", "reportData", "action"],
    auth: ["user"],
    async handler(
        { matchID, reportData, action } : { matchID: MatchResolvableID, reportData: { mapData: object[], matchData: object[] }, action: "submit" | "counter" },
        { user } : ActionAuth
    ) {
        const { match, report } : { match: Match, report: Report | undefined } = await getMatchScoreReporting(matchID);
        if (action === "submit" && report) {
            throw "A score has already been reported on this match";
        } else if (action === "counter" && !report) {
            throw "A report has not been made on this match";
        }

        if (action === "submit") {
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
                "Log": [
                    `date=${(new Date()).getTime()}`,
                    `user=${user.airtable.id}`,
                    `team=${actingTeam?.id}`,
                    "text=Reported score",
                    "key=submitted_score_report"
                ].join("|"),
            });

            console.log(response);

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


        } else if (action === "counter") {
            // opponent people

            if (!report?.team?.[0]) throw "Unknown team in original score report";
            const originalSubmissionTeam = await get(report?.team?.[0]);
            if (!originalSubmissionTeam?.id) throw "Unknown team in original score report";

            const teams = await Promise.all((match.teams || []).map(t => get(t)));
            const actingTeam = teams.filter(t => cleanTypedID(t.id) !== cleanTypedID(originalSubmissionTeam.id)).find(team => [
                ...(team.players || []),
                ...(team.captains || []),
                ...(team.staff || []),
                ...(team.owners || []),
            ].includes(dirtyID(user.airtable.id)));

            if (!actingTeam) throw "You don't have permission to counter the score report of this match";

            const response = await this.helpers.updateRecord("Reports", report, {
                "Log": report.log + "\n" + [
                    `date=${(new Date()).getTime()}`,
                    `user=${user.airtable.id}`,
                    `team=${actingTeam?.id}`,
                    "text=Countered score report",
                    "key=countered_score_report"
                ].join("|"),
                "Countered Data": JSON.stringify(reportData),
                "Countered by opponent": true
            });

            console.log(response);

            if ("error" in response) {
                throw `Airtable error: ${response.errorMessage}`;
            }
        }


    }
// @ts-expect-error Needs some action refactoring before it can fully satisfy
} satisfies Action;

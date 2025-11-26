import { ActionAuth, Match, MatchResolvableID, Report, ScoreReportingReportKeys } from "../types.js";
import { Action } from "../action-utils/action-manager-models.js";
import { cleanTypedID, dirtyID } from "shared";
import { getMatchScoreReporting } from "../action-utils/action-utils.js";
import { get } from "../action-utils/action-cache.js";
import { MapObject } from "../discord/managers.js";
import { looseDeleteRecordedMessage } from "../action-utils/ts-action-utils.js";

export default {
    key: "approve-score-report",
    requiredParams: ["matchID", "reaction"],
    auth: ["user"],
    async handler(
        { matchID, reaction }: { matchID: MatchResolvableID, reaction: "approve" | "counter-approve" | "counter-deny" },
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
        const reportableTeams = teams.filter(t => {
            if (reaction === "counter-approve" || reaction === "counter-deny") {
                // original team
                return (report.team?.[0]) && cleanTypedID(t.id) === cleanTypedID(report.team?.[0]);
            }
            return (report.team?.[0]) && cleanTypedID(t.id) !== cleanTypedID(report.team?.[0]);
        });

        const actingTeam = reportableTeams.find(team => [
            ...(team.players || []),
            ...(team.captains || []),
            ...(team.staff || []),
            ...(team.owners || []),
        ].includes(dirtyID(user.airtable.id)));

        if (!actingTeam) throw "You don't have permission to report the score of this match";

        if (reaction === "counter-deny") throw {
            errorCode: 501,
            errorMessage: "Please contact event staff to resolve this match"
        };

        if (reaction === "approve") {
            // opponent approves original's report

            let messageData = new MapObject(report.message_data);
            // Remove previous captain notification
            console.log(messageData.data);

            messageData = await looseDeleteRecordedMessage<ScoreReportingReportKeys>(messageData, "report_opponent_notification");
            await this.helpers.updateRecord("Reports", report, {
                "Approved by opponent": true,
                "Log": (report.log ? report.log + "\n" : "") + [
                    `date=${(new Date()).getTime()}`,
                    `user=${user.airtable.id}`,
                    `team=${actingTeam?.id}`,
                    "text=Approved score report",
                    "key=approved_by_opponent"
                ].join("|"),
                "Message Data": messageData.textMap
            });


        } else if (reaction === "counter-approve") {
            // original approves opponent's counter report

            let messageData = new MapObject(report.message_data);
            // Remove previous captain notification
            console.log(messageData.data);

            messageData = await looseDeleteRecordedMessage<ScoreReportingReportKeys>(messageData, "report_opponent_notification");

            await this.helpers.updateRecord("Reports", report, {
                "Approved by opponent": true,
                "Approved by team": true,
                "Countered by opponent": false,
                "Data": report.countered_data,
                "Countered Data": "",
                "Log": (report.log ? report.log + "\n" : "") + [
                    `date=${(new Date()).getTime()}`,
                    `user=${user.airtable.id}`,
                    `team=${actingTeam?.id}`,
                    "text=Approved counter report",
                    "key=approved_counter_report"
                ].join("|"),
                // `${(new Date()).toLocaleString()}: ${user.airtable.name} approved counter report as ${actingTeam?.name}`
            });
        }
    }
// @ts-expect-error Needs some action refactoring before it can fully satisfy
} satisfies Action;

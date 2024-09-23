// @ts-expect-error not a ts file
import { Action } from "../action-utils/action-manager-models.js";
// @ts-expect-error not a ts file
import { dirtyID } from "../action-utils/action-utils.js";

import { ActionAuth, EventSettings, MatchResolvableID } from "../types.js";
import { get } from "../action-utils/action-cache.js";

export default {
    key: "submit-score-report",
    requiredParams: ["matchID", "mapData"],
    auth: ["user"],
    async handler(
        { matchID, mapData } : { matchID: MatchResolvableID, mapData: object[]},
        { user } : ActionAuth
    ) {
        const match = await get(matchID);

        if (!match?.id) throw "Couldn't load match data";

        if (!match?.event?.[0]) throw "Couldn't load event data for this match";
        const event = await get(match?.event?.[0]);
        if (!event?.id) throw "Couldn't load event data for this match";

        // event score reporting must be active

        if (!event?.blocks) throw "Event doesn't have score reporting set up";
        const eventSettings: EventSettings = JSON.parse(event.blocks);
        if (!eventSettings?.reporting?.score?.use) throw "Score reporting is not enabled on this match";

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

        // check existing report
        if (match?.reports?.[0]) {
            const report = await get(match?.reports?.[0]);
            if (report?.id) {
                throw "A score has already been reported on this match";
            }
            throw "An error occurred loading match data";
        }

        // no report exists

        const response = this.helpers.createRecord("Reports", {
            "Type": "Scores",
            "Player": [dirtyID(user.airtable.id)],
            "Team": [dirtyID(actingTeam.id)],
            "Match": [dirtyID(match.id)],
            "Data": JSON.stringify(mapData),
            "Approved by team": true,
            "Log": `${(new Date()).toLocaleString()}: ${user.airtable.name} reported score as ${actingTeam?.name}`
        });

        if (response.error) {
            throw `Airtable error: ${response.error.errorMessage}`;
        }
        if (response?.id) {
            await this.helpers.updateRecord("Matches", match, {
                "Reports": [...(match.reports || []), response.id]
            });
            return response.id;
        }

    }
} satisfies Action;

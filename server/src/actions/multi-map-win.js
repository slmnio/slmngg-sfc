import { dirtyID, getBroadcast, getMaps, getMatchData } from "../action-utils/action-utils.js";

export default {
    key: "multi-map-win",
    auth: ["client"],
    requiredParams: ["teamNum"],
    optionalParams: ["unsetMapAttack"],
    async handler({ teamNum, unsetMapAttack }, { client }) {
        teamNum = parseInt(teamNum);
        if (![1,2].includes(teamNum)) throw { errorMessage: "Invalid team number - 1 or 2 required", errorCode: 400 };
        console.log({ teamNum, unsetMapAttack });

        // set map winner
        // update score + 1
        // clear broadcast.map_attack if unsetMapAttack

        const broadcast = await getBroadcast(client);
        const { match, team1, team2 } = await getMatchData(broadcast, true);

        if (match.score_1 === match.first_to || match.score_2 === match.first_to) throw { errorMessage: "This match has already been decided" };

        const maps = await getMaps(match);

        const winningTeam = teamNum === 1 ? team1 : team2;

        let targetedMaps = maps.filter(map => !map.winner?.length && !map.draw && !map.banner?.length);

        console.log({maps, targetedMaps});

        if (!targetedMaps?.length) throw { errorMessage: "Couldn't find a map for the team to win" };

        let targetedMap = targetedMaps?.[0];

        let mapUpdateData = {
            "Winner": [ dirtyID(winningTeam.id) ]
        };

        let matchUpdateData = {};

        if (teamNum === 1) {
            matchUpdateData["Score 1"] = (match.score_1 || 0) + 1;
            if (matchUpdateData["Score 1"] > match.first_to) throw { errorMessage: "The team winning this match would go over the match's first to number" };

        } else {
            matchUpdateData["Score 2"] = (match.score_2 || 0) + 1;
            if (matchUpdateData["Score 2"] > match.first_to) throw { errorMessage: "The team winning this match would go over the match's first to number" };
        }

        const promises = [];

        promises.push(this.helpers.updateRecord("Maps", targetedMap, mapUpdateData));
        promises.push(this.helpers.updateRecord("Matches", match, matchUpdateData));

        if (unsetMapAttack) {
            promises.push(this.helpers.updateRecord("Broadcasts", broadcast, {
                "Map Attack": null
            }));
        }

        await Promise.all(promises);
    }
};

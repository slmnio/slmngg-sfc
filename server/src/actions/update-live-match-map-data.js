import { dirtyID } from "shared";
import { getBroadcast, getMatchData } from "../action-utils/action-utils.js";

export default {
    key: "update-live-match-map-data",
    requiredParams: ["mapData"],
    auth: ["user", "client"],
    /***
     * @param {object} mapData
     * @param {CleanAirtableID?} mapData.map - Map text to set
     * @param {CleanAirtableID?} mapData.existingID - Existing map object ID
     * @param {CleanAirtableID?} mapData.winner - ID of winning team
     * @param {CleanAirtableID?} mapData.banner - ID of team that banned the map
     * @param {CleanAirtableID?} mapData.picker - ID of team that picker the map
     * @param {number?} mapData.score_1
     * @param {number?} mapData.score_2
     * @param {boolean?} mapData.draw
     *
     * @param {ActionAuth["user"]} user
     * @param {ActionAuth["client"]} client
     * @param {ActionAuth["isAutomation"]} isAutomation
     * @returns {Promise<void>}
     */
    async handler({ mapData }, { user, client, isAutomation }) {

        const broadcast = await getBroadcast(client);
        const { match } = await getMatchData(broadcast, false);
        if (!(isAutomation || (await this.helpers.permissions.canEditMatch(user, { match })))) throw { errorMessage: "You don't have permission to edit this item", errorCode: 403 };
        if (!match?.id) throw "Couldn't load match data";

        const matchTeamIDs = [...(match.teams || []), null];

        const currentMaps = await Promise.all((match.maps || []).map(m => this.helpers.get(m)));

        const eligibleMaps = currentMaps.filter(map => !map.banner);
        const currentMap = eligibleMaps.find(map => !(map.draw || map.winner));

        if (!currentMap?.id) throw "Couldn't find a current map";

        const mapRecordUpdates = {};

        mapData.existingID = dirtyID(mapData.existingID);
        mapData.map = dirtyID(mapData.map);
        mapData.winner = dirtyID(mapData.winner);
        mapData.banner = dirtyID(mapData.banner);
        mapData.picker = dirtyID(mapData.picker);

        if (mapData.number === null || mapData.number === "") {
            mapData.number = null;
        }

        if ((mapData.map !== undefined) && mapData.map !== currentMap.map?.[0]) {
            mapRecordUpdates.Map = [mapData.map].filter(f => f);
        }
        if ((mapData.winner !== undefined) && mapData.winner !== currentMap.winner?.[0] && matchTeamIDs.includes(mapData.winner)) {
            mapRecordUpdates.Winner = [mapData.winner].filter(f => f);
        }
        if ((mapData.banner !== undefined) && mapData.banner !== currentMap.banner?.[0] && matchTeamIDs.includes(mapData.banner)) {
            mapRecordUpdates.Banner = [mapData.banner].filter(f => f);
        }
        if ((mapData.picker !== undefined) && mapData.picker !== currentMap.picker?.[0] && matchTeamIDs.includes(mapData.picker)) {
            mapRecordUpdates.Picker = [mapData.picker].filter(f => f);
        }
        if ((mapData.draw !== undefined) && mapData.draw !== currentMap.draw) {
            mapRecordUpdates.Draw = mapData.draw;
        }
        if ((mapData.flip_pick_ban_order !== undefined) && mapData.flip_pick_ban_order !== currentMap.flip_pick_ban_order) {
            mapRecordUpdates["Flip Pick Ban Order"] = mapData.flip_pick_ban_order;
        }
        if ((mapData.public !== undefined) && mapData.public !== currentMap.public) {
            mapRecordUpdates["Public"] = mapData.public;
        }
        if ((mapData.score_1 !== undefined) && mapData.score_1 !== currentMap.score_1) {
            mapRecordUpdates["Score 1"] = mapData.score_1;
        }
        if ((mapData.score_2 !== undefined) && mapData.score_2 !== currentMap.score_2) {
            mapRecordUpdates["Score 2"] = mapData.score_2;
        }
        if ((mapData.number !== undefined) && mapData.number !== currentMap.number) {
            mapRecordUpdates.Number = mapData.number;
        }
        if ((mapData.replay_code !== undefined) && mapData.replay_code !== currentMap.replay_code) {
            mapRecordUpdates["Replay Code"] = mapData.replay_code.toString();
        }

        if (mapData.team_1_picks !== undefined) {
            const team_1_picks = (mapData.team_1_picks || []).filter(Boolean).map(id => dirtyID(id));
            if (JSON.stringify(team_1_picks) !== JSON.stringify(currentMap.team_1_picks || [])) {
                mapRecordUpdates["Team 1 Picks"] = team_1_picks;
            }
        }
        if (mapData.team_1_bans !== undefined) {
            const team_1_bans = (mapData.team_1_bans || []).filter(Boolean).map(id => dirtyID(id));
            if (JSON.stringify(team_1_bans) !== JSON.stringify(currentMap.team_1_bans || [])) {
                mapRecordUpdates["Team 1 Bans"] = team_1_bans;
            }
        }
        if (mapData.team_2_picks !== undefined) {
            const team_2_picks = (mapData.team_2_picks || []).filter(Boolean).map(id => dirtyID(id));
            if (JSON.stringify(team_2_picks) !== JSON.stringify(currentMap.team_2_picks || [])) {
                mapRecordUpdates["Team 2 Picks"] = team_2_picks;
            }
        }
        if (mapData.team_2_bans !== undefined) {
            const team_2_bans = (mapData.team_2_bans || []).filter(Boolean).map(id => dirtyID(id));
            if (JSON.stringify(team_2_bans) !== JSON.stringify(currentMap.team_2_bans || [])) {
                mapRecordUpdates["Team 2 Bans"] = team_2_bans;
            }
        }

        return this.helpers.updateRecord("Maps", currentMap, mapRecordUpdates);
    }
};

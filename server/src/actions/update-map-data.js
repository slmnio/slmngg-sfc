import { dirtyID } from "../action-utils/action-utils.js";

export default {
    key: "update-map-data",
    requiredParams: ["matchID", "mapData"],
    auth: ["user"],
    /***
     * @param {AnyAirtableID} matchID
     *
     * @param {object[]} mapData
     * @param {CleanAirtableID?} mapData.map - Map text to set
     * @param {CleanAirtableID?} mapData.existingID - Existing map object ID
     * @param {CleanAirtableID?} mapData.winner - ID of winning team
     * @param {CleanAirtableID?} mapData.banner - ID of team that banned the map
     * @param {CleanAirtableID?} mapData.picker - ID of team that picker the map
     * @param {number?} mapData.score_1
     * @param {number?} mapData.score_2
     * @param {boolean?} mapData.draw
     *
     * @param {UserData} user
     * @returns {Promise<void>}
     */
    async handler({ matchID, mapData }, { user, isAutomation }) {
        const match = await this.helpers.get(matchID);
        if (!(isAutomation || (await this.helpers.permissions.canEditMatch(user, { match })))) throw { errorMessage: "You don't have permission to edit this item", errorCode: 403 };
        if (!match?.id) throw "Couldn't load match data";

        const existingMaps = await Promise.all((match.maps || []).map(m => this.helpers.get(m)));
        const matchTeamIDs = [...(match.teams || []), null];
        const recordUpdates = {};
        let recordCreations = [];

        mapData.forEach((newMap, i) => {
            newMap.existingID = dirtyID(newMap.existingID);
            newMap.map = dirtyID(newMap.map);
            newMap.winner = dirtyID(newMap.winner);
            newMap.banner = dirtyID(newMap.banner);
            newMap.picker = dirtyID(newMap.picker);

            if (newMap.number === null || newMap.number === "") {
                newMap.number = null;
            }

            const existingMap = existingMaps[i];

            if (!newMap.existingID) {
                return recordCreations.push({
                    ...newMap,
                    index: i
                });
            } else if (newMap.existingID !== existingMap.id) {
                return console.warn(`[map editor] Map ID mismatch: existing=${existingMap.id} new=${newMap.existingID}`);
            }

            if (newMap.map !== existingMap.map?.[0]) {
                if (!recordUpdates[existingMap.id]) recordUpdates[existingMap.id] = {};
                recordUpdates[existingMap.id].Map = [newMap.map].filter(f => f);
            }
            if (newMap.winner !== existingMap.winner?.[0] && matchTeamIDs.includes(newMap.winner)) {
                if (!recordUpdates[existingMap.id]) recordUpdates[existingMap.id] = {};
                recordUpdates[existingMap.id].Winner = [newMap.winner].filter(f => f);
            }
            if (newMap.banner !== existingMap.banner?.[0] && matchTeamIDs.includes(newMap.banner)) {
                if (!recordUpdates[existingMap.id]) recordUpdates[existingMap.id] = {};
                recordUpdates[existingMap.id].Banner = [newMap.banner].filter(f => f);
            }
            if (newMap.picker !== existingMap.picker?.[0] && matchTeamIDs.includes(newMap.picker)) {
                if (!recordUpdates[existingMap.id]) recordUpdates[existingMap.id] = {};
                recordUpdates[existingMap.id].Picker = [newMap.picker].filter(f => f);
            }
            if (newMap.draw !== existingMap.draw) {
                if (!recordUpdates[existingMap.id]) recordUpdates[existingMap.id] = {};
                recordUpdates[existingMap.id].Draw = newMap.draw;
            }
            if (newMap.score_1 !== existingMap.score_1) {
                if (!recordUpdates[existingMap.id]) recordUpdates[existingMap.id] = {};
                recordUpdates[existingMap.id]["Score 1"] = newMap.score_1;
            }
            if (newMap.score_2 !== existingMap.score_2) {
                if (!recordUpdates[existingMap.id]) recordUpdates[existingMap.id] = {};
                recordUpdates[existingMap.id]["Score 2"] = newMap.score_2;
            }
            if (newMap.number !== existingMap.number) {
                if (!recordUpdates[existingMap.id]) recordUpdates[existingMap.id] = {};
                recordUpdates[existingMap.id].Number = newMap.number;
            }
            if (newMap.replay_code !== existingMap.replay_code) {
                if (!recordUpdates[existingMap.id]) recordUpdates[existingMap.id] = {};
                recordUpdates[existingMap.id]["Replay Code"] = newMap.replay_code.toString();
            }

            const team_1_picks = (newMap.team_1_picks || []).filter(Boolean).map(id => dirtyID(id));
            if (JSON.stringify(team_1_picks) !== JSON.stringify(existingMap.team_1_picks || [])) {
                if (!recordUpdates[existingMap.id]) recordUpdates[existingMap.id] = {};
                recordUpdates[existingMap.id]["Team 1 Picks"] = team_1_picks;
            }
            const team_1_bans = (newMap.team_1_bans || []).filter(Boolean).map(id => dirtyID(id));
            if (JSON.stringify(team_1_bans) !== JSON.stringify(existingMap.team_1_bans || [])) {
                if (!recordUpdates[existingMap.id]) recordUpdates[existingMap.id] = {};
                recordUpdates[existingMap.id]["Team 1 Bans"] = team_1_bans;
            }
            const team_2_picks = (newMap.team_2_picks || []).filter(Boolean).map(id => dirtyID(id));
            if (JSON.stringify(team_2_picks) !== JSON.stringify(existingMap.team_2_picks || [])) {
                if (!recordUpdates[existingMap.id]) recordUpdates[existingMap.id] = {};
                recordUpdates[existingMap.id]["Team 2 Picks"] = team_2_picks;
            }
            const team_2_bans = (newMap.team_2_bans || []).filter(Boolean).map(id => dirtyID(id));
            if (JSON.stringify(team_2_bans) !== JSON.stringify(existingMap.team_2_bans || [])) {
                if (!recordUpdates[existingMap.id]) recordUpdates[existingMap.id] = {};
                recordUpdates[existingMap.id]["Team 2 Bans"] = team_2_bans;
            }
        });

        console.log({ recordUpdates });

        const responses = await Promise.all(Object.entries(recordUpdates).map(async([recordID, updates]) => {
            const localData = await this.helpers.get(recordID);
            return this.helpers.updateRecord("Maps", localData, updates);
        }));
        if (responses.some(r => r?.error)) throw "Airtable error";

        recordCreations = recordCreations
            .filter(rec => rec.map || rec.winner || rec.banner || rec.picker)
            .slice(0, 10)
            .map(map => {
                const fieldData = {
                    Match: [dirtyID(matchID)]
                };

                if (map.map) fieldData.Map = [map.map];
                if (map.winner) fieldData.Winner = [map.winner];
                if (map.banner) fieldData.Banner = [map.banner];
                if (map.picker) fieldData.Picker = [map.picker];
                if (map.number) fieldData.Number = map.number;
                if (map.draw) fieldData.Draw = map.draw;
                if (map.score_1 != null) fieldData["Score 1"] = map.score_1;
                if (map.score_2 != null) fieldData["Score 2"] = map.score_2;
                if (map.replay_code) fieldData["Replay Code"] = map.replay_code;
                if ((map.team_1_picks || [])?.length) fieldData["Team 1 Picks"] = map.team_1_picks.filter(Boolean).map(id => dirtyID(id));
                if ((map.team_2_picks || [])?.length) fieldData["Team 2 Picks"] = map.team_2_picks.filter(Boolean).map(id => dirtyID(id));
                if ((map.team_1_bans || [])?.length) fieldData["Team 1 Bans"] = map.team_1_bans.filter(Boolean).map(id => dirtyID(id));
                if ((map.team_2_bans || [])?.length) fieldData["Team 2 Bans"] = map.team_2_bans.filter(Boolean).map(id => dirtyID(id));

                return {
                    index: map.index,
                    fields: fieldData
                };
            });

        if (recordCreations.length) {
            console.log({ recordCreations });

            const createResponses = await this.helpers.createRecords("Maps", recordCreations.map(item => item.fields));
            if ((createResponses || []).some(r => r?.error)) throw "Airtable error";

            let mapIDs = existingMaps.map(m => m.id);
            createResponses.forEach((response, i) => {
                let index = recordCreations[i]?.index;
                if (index == null) return;
                mapIDs[index] = response.id;
            });

            console.log("Match's map IDs:", mapIDs);

            await this.helpers.updateRecord("Matches", match, {
                "Maps": mapIDs.filter(Boolean)
            });
        }
    }
};

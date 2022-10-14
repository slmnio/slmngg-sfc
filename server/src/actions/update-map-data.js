const { dirtyID } = require("../action-utils");
module.exports = {
    key: "update-map-data",
    requiredParams: ["matchID", "mapData"],
    auth: ["user"],
    /***
     * @param {ActionSuccessCallback} success
     * @param {ActionErrorCallback} error
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
     * @param {SimpleUpdateRecord} updateRecord
     * @param {CacheGetFunction} get - Cache.get
     * @returns {Promise<void>}
     */
    async handler(success, error, { matchID, mapData }, { user }, { updateRecord, get, createRecord }) {
        // TODO: expand permissions system to allow for event moderators/admins/staff --something to edit matches on an event-by-event basis
        if (!user.airtable?.website_settings?.includes("Can edit any match")) return error("You don't have permission to edit this item", 403);

        let match = await get(matchID);
        if (!match) return error("Couldn't load match data");

        let existingMaps = await Promise.all((match.maps || []).map(m => get(m)));
        let matchTeamIDs = [...match.teams, null];
        let recordUpdates = {};
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

            let existingMap = existingMaps[i];

            if (!newMap.existingID) {
                return recordCreations.push(newMap);
            } else if (newMap.existingID !== existingMap.id) {
                return console.warn(`[map editor] Map ID mismatch: existing=${existingMap.id} new=${newMap.existingID}`);
            }

            if (newMap.map !== existingMap.map?.[0]) {
                if (!recordUpdates[existingMap.id]) recordUpdates[existingMap.id] = {};
                recordUpdates[existingMap.id]["Map"] = [newMap.map].filter(f => f);
            }
            if (newMap.winner !== existingMap.winner?.[0] && matchTeamIDs.includes(newMap.winner)) {
                if (!recordUpdates[existingMap.id]) recordUpdates[existingMap.id] = {};
                recordUpdates[existingMap.id]["Winner"] = [newMap.winner].filter(f => f);
            }
            if (newMap.banner !== existingMap.banner?.[0] && matchTeamIDs.includes(newMap.banner)) {
                if (!recordUpdates[existingMap.id]) recordUpdates[existingMap.id] = {};
                recordUpdates[existingMap.id]["Banner"] = [newMap.banner].filter(f => f);
            }
            if (newMap.picker !== existingMap.picker?.[0] && matchTeamIDs.includes(newMap.picker)) {
                if (!recordUpdates[existingMap.id]) recordUpdates[existingMap.id] = {};
                recordUpdates[existingMap.id]["Picker"] = [newMap.picker].filter(f => f);
            }
            if (newMap.draw !== existingMap.draw) {
                if (!recordUpdates[existingMap.id]) recordUpdates[existingMap.id] = {};
                recordUpdates[existingMap.id]["Draw"] = newMap.draw;
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
                recordUpdates[existingMap.id]["Number"] = newMap.number;
            }

        });

        console.log({ recordUpdates });

        let responses = await Promise.all(Object.entries(recordUpdates).map(async([recordID, updates]) => {
            let localData = await get(recordID);
            return updateRecord("Maps", localData, updates);
        }));
        if (responses.some(r => r?.error)) error("Airtable error", 500);

        recordCreations = recordCreations
            .filter(rec => rec.map || rec.winner || rec.banner || rec.picker)
            .slice(0,10)
            .map(map => {
                let fieldData = {
                    "Match": [dirtyID(matchID)]
                };

                if (map.map) fieldData["Map"] = [map.map];
                if (map.winner) fieldData["Winner"] = [map.winner];
                if (map.banner) fieldData["Banner"] = [map.banner];
                if (map.picker) fieldData["Picker"] = [map.picker];
                if (map.number) fieldData["Number"] = map.number;
                if (map.draw) fieldData["Draw"] = map.draw;
                if (map.score_1) fieldData["Score 1"] = map.score_1;
                if (map.score_2) fieldData["Score 2"] = map.score_2;

                return fieldData;
            });

        if (recordCreations.length) {
            console.log({ recordCreations });

            let createResponses = await createRecord("Maps", recordCreations);
            if ((createResponses || []).some(r => r?.error)) return error("Airtable error", 500);
        }
        success();
    }
};

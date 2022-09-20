module.exports = {
    key: "update-match-data",
    requiredParams: ["matchID", "updatedData"],
    auth: ["user"],
    /***
     * @param {ActionSuccessCallback} success
     * @param {ActionErrorCallback} error
     * @param {AnyAirtableID} matchID
     * @param {object?} updatedData
     * @param {UserData} user
     * @param {SimpleUpdateRecord} updateRecord
     * @param {CacheGetFunction} get - Cache.get
     * @returns {Promise<void>}
     */
    async handler(success, error, { matchID, updatedData }, { user }, { updateRecord, get }) {
        // TODO: expand permissions system to allow for event moderators/admins/staff --something to edit matches on an event-by-event basis
        if (!user.airtable?.website_settings?.includes("Can edit any match")) return error("You don't have permission to edit this item", 403);

        let match = await get(matchID);
        if (!match) return error("Couldn't load match data");

        let validKeysMap = {
            "special_event": "Special Event",
            "custom_name": "Custom Name",
            "score_1": "Score 1",
            "score_2": "Score 2"
        };
        let validatedData = {};

        Object.entries(updatedData).forEach(([key, val]) => {
            let map = validKeysMap[key];
            if (!map) return;
            validatedData[map] = val;
        });

        console.log("[match]", user.airtable.name, user.airtable.id, "is setting", validatedData);
        let response = await updateRecord("Matches", match, {
            ...validatedData
        });

        return response?.error ? error("Airtable error", 500) : success();
    }
};

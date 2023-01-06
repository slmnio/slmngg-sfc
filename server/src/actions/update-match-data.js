module.exports = {
    key: "update-match-data",
    requiredParams: ["matchID", "updatedData"],
    auth: ["user"],
    /***
     * @param {AnyAirtableID} matchID
     * @param {object?} updatedData
     * @param {UserData} user
     * @returns {Promise<void>}
     */
    async handler({ matchID, updatedData }, { user }) {
        let match = await this.helpers.get(matchID);
        if (!(await this.helpers.permissions.canEditMatch(user, { match }))) throw { errorMessage: "You don't have permission to edit this item", errorCode: 403 };
        if (!match) throw "Couldn't load match data";

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
        let response = await this.helpers.updateRecord("Matches", match, {
            ...validatedData
        });


        if (response?.error) {
            console.error("Airtable error", response.error);
            throw "Airtable error";
        }
    }
};

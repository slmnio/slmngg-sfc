import { dirtyID } from "shared";

export default {
    key: "update-match-data",
    requiredParams: ["matchID", "updatedData"],
    auth: ["user"],
    /***
     * @param {AnyAirtableID} matchID
     * @param {object?} updatedData
     * @param {ActionAuth["user"]} user
     * @param {ActionAuth["isAutomation"]} isAutomation
     * @returns {Promise<void>}
     */
    async handler({ matchID, updatedData }, { user, isAutomation }) {
        let match = await this.helpers.get(matchID);
        if (!(isAutomation || (await this.helpers.permissions.canEditMatch(user, { match })))) throw { errorMessage: "You don't have permission to edit this item", errorCode: 403 };
        if (!match?.id) throw "Couldn't load match data";

        let validKeysMap = {
            "special_event": "Special Event",
            "custom_name": "Custom Name",
            "score_1": "Score 1",
            "score_2": "Score 2",
            "start": "Start",
            "forfeit": "Forfeit",
            "forfeit_reason": "Forfeit Reason",
            "vod": "VOD",
            "vod_2": "VOD 2",
            "alternative_vod": "Alternative VOD",
            "mvpPlayerID": "MVP",
        };
        let validatedData = {};

        Object.entries(updatedData).forEach(([key, val]) => {
            let map = validKeysMap[key];
            if (!map) return;

            if (map === "MVP") {
                if (!val) {
                    validatedData[map] = [];
                } else {
                    validatedData[map] = [dirtyID(val)];
                }
            } else {
                validatedData[map] = val;
            }
        });

        console.log("[match]", (isAutomation ? "Automation" : user.airtable?.name), "is setting", validatedData);
        let response = await this.helpers.updateRecord("Matches", match, {
            ...validatedData
        });


        if (response?.error) {
            console.error("Airtable error", response.error);
            throw "Airtable error";
        }
    }
};

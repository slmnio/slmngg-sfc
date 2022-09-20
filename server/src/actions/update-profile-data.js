const { getValidHeroes } = require("../action-utils");
module.exports = {
    key: "update-profile-data",
    requiredParams: ["profileData"],
    auth: ["user"],
    /***
     * @param {ActionSuccessCallback} success
     * @param {ActionErrorCallback} error
     * @param {object} profileData
     * @param {UserData} user
     * @param {SimpleUpdateRecord} updateRecord
     * @returns {Promise<void>}
     */
    async handler(success, error, { profileData }, { user }, { updateRecord }) {
        let validatedData = {};

        if (profileData.pronouns) {
            let valid = ["he/him", "she/her", "they/them", "he/they", "she/they", "any"];
            if (valid.includes(profileData.pronouns)) validatedData["Pronouns"] = profileData.pronouns;
        }

        if (profileData.role) {
            let valid = ["DPS", "Support", "Tank", "Flex"];
            if (valid.includes(profileData.role)) validatedData["Role"] = profileData.role;
        }

        if (profileData.pronunciation) {
            if (profileData.pronunciation.length > 100) return error("Pronunciation is too long. Please keep it under 100 characters.");
            validatedData["Pronunciation"] = profileData.pronunciation;
        }

        if (profileData.favourite_hero) {
            let validHeroes = await getValidHeroes();
            if (validHeroes.find(hero => hero.id === profileData.favourite_hero)) {
                validatedData["Favourite Hero"] = [profileData.favourite_hero]; // Needs to be in an array since it's a linked record
            }
        }

        console.log("[profile]", user.airtable.name, user.airtable.id, "is setting", validatedData);
        let response = await updateRecord("Players", user.airtable, {
            ...validatedData
        });
        return response?.error ? error("Airtable error", 500) : success();
    }
};

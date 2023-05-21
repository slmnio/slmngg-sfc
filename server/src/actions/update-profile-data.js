const { getValidHeroes,
    dirtyID
} = require("../action-utils/action-utils");
module.exports = {
    key: "update-profile-data",
    requiredParams: ["profileData"],
    auth: ["user"],
    /***
     * @param {object} profileData
     * @param {UserData} user
     * @returns {Promise<void>}
     */
    async handler({ profileData }, { user }) {
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
            if (profileData.pronunciation.length > 100) throw ("Pronunciation is too long. Please keep it under 100 characters.");
            validatedData["Pronunciation"] = profileData.pronunciation;
        }

        if (profileData.favourite_hero) {
            let validHeroes = await getValidHeroes();
            if (validHeroes.find(hero => hero.id === profileData.favourite_hero)) {
                validatedData["Favourite Hero"] = [profileData.favourite_hero]; // Needs to be in an array since it's a linked record
            }
        }

        if (profileData.profile_picture_theme) {
            // TODO: this should be restricted to a player's associated themes
            validatedData["Profile Picture Theme"] = [dirtyID(profileData.profile_picture_theme)];
        }

        console.log("[profile]", user.airtable.name, user.airtable.id, "is setting", validatedData);
        let response = await this.helpers.updateRecord("Players", user.airtable, {
            ...validatedData
        });

        if (response?.error) {
            console.error("Airtable error", response.error);
            throw "Airtable error";
        }
    }
};

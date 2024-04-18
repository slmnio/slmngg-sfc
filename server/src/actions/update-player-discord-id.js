const { canUpdateUserDetails } = require("../action-utils/action-permissions");
const { log } = require("../discord/slmngg-log");
const {
    User,
    userMention
} = require("discord.js");
const Cache = require("../cache");
const { cleanID } = require("../action-utils/action-utils");

module.exports = {
    key: "update-player-discord-id",
    requiredParams: ["discordData", "slmnggId"],
    auth: ["user"],
    /***
     * @param {User} discordData
     * @param {string} slmnggId
     * @param {UserData} user
     * @returns {Promise<string>}
     */
    async handler({ discordData, slmnggId }, { user }) {
        if (!canUpdateUserDetails(user)) {
            throw {
                errorMessage: "You don't have permission update user details",
                errorCode: 403
            };
        }

        const targetUser = await Cache.get(cleanID(slmnggId));

        if (!targetUser) throw { errorMessage: "No user found to send to Airtable" };

        let response = await this.helpers.updateRecord("Players", targetUser, {
            "Discord ID": discordData.id,
            "Discord Tag": discordData.username
        });

        log(`[Profile] ${user.airtable.name} ${userMention(user.discord.id)} ${cleanID(user.airtable.id)} is linking Discord account for ${userMention(discordData.id)} ${discordData.id} to ${targetUser.name} ${cleanID(targetUser.id)} https://slmn.gg/player/${cleanID(targetUser.id)}`);

        if (response?.error) {
            console.error("Airtable error", response.error);
            throw "Airtable error";
        }
        return targetUser.name;
    }
};

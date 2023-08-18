const { canUpdateUserDetails } = require("../action-utils/action-permissions");
const { log } = require("../discord/slmngg-log");
const {
    User
} = require("discord.js");
const Cache = require("../cache");

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

        const targetUser = Cache.get(slmnggId);

        log("[profile]", user.airtable.name, user.airtable.id, "is setting discord id for", targetUser.name, targetUser.id, "to", discordData.id);
        let response = await this.helpers.updateRecord("Players", targetUser, {
            "Discord ID": discordData.id,
            "Discord Tag": discordData.username
        });

        if (response?.error) {
            console.error("Airtable error", response.error);
            throw "Airtable error";
        }
        return targetUser.name;
    }
};

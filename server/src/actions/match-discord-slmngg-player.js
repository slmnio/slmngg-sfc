const { canUpdateUserDetails } = require("../action-utils/action-permissions");
const { log } = require("../discord/slmngg-log");
const {
    User
} = require("discord.js");
const Cache = require("../cache");

module.exports = {
    key: "match-discord-slmngg-player",
    requiredParams: ["discordData"],
    auth: ["user"],
    /***
     * @param {User} discordData
     * @param {UserData} user
     * @returns {Promise<UserData[]>}
     */
    async handler({ discordData }, { user }) {
        if (!canUpdateUserDetails(user)) {
            throw {
                errorMessage: "You don't have permission update user details",
                errorCode: 403
            };
        }

        let players = await Promise.all((await Cache.get("Players")).ids.map(id => (Cache.get(id.slice(3)))));

        if (await Cache.auth.getPlayer(discordData.id)) {
            throw {
                errorMessage: "This user is already linked to a SLMN.GG profile",
                errorCode: 400
            };
        }

        const isNewUsername = discordData.discriminator === "0";

        let searchValues = [discordData.username, discordData.globalName, !isNewUsername && `${discordData.username}#${discordData.discriminator}`]
            .filter(Boolean)
            .map((value) => value.toLocaleLowerCase());

        let potentials = players.filter((player) => {
            if (player.discord_id) return false;

            const discordSimple = player.discord_tag?.split("#")[0].toLocaleLowerCase();

            return searchValues.includes(discordSimple) || searchValues.includes(player.discord_tag?.toLocaleLowerCase()) || searchValues.includes(player.name?.toLocaleLowerCase());
        });

        if (potentials.length === 0) {
            throw {
                errorMessage: "Unable to find SLMN.GG user based on discord details",
                errorCode: 404
            };
        }

        return potentials;
    }
};

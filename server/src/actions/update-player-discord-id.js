const { canUpdateUserDetails } = require("../action-utils/action-permissions");
const {
    User
} = require("discord.js");
const Cache = require("../cache");

module.exports = {
    key: "update-player-discord-id",
    requiredParams: ["discordData"],
    auth: ["user"],
    /***
     * @param {User} discordData
     * @param {UserData} user
     * @returns {Promise<string>}
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
        } else if (potentials.length > 1) {
            throw {
                errorMessage: "Found more than 1 SLMN.GG player based on discord details",
                errorCode: 500
            };
        }

        const targetUser = potentials[0];

        console.log("[profile]", user.airtable.name, user.airtable.id, "is setting discord id for", targetUser.name, targetUser.id, "to", discordData.id);
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

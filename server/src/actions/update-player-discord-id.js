import { canUpdateUserDetails } from "../action-utils/action-permissions";
const Cache = require("../cache");

module.exports = {
    key: "update-player-discord-id",
    requiredParams: ["discordData"],
    auth: ["user"],
    /***
     * @param {object} discordData
     * @param {UserData} user
     * @returns {Promise<string>}
     */
    async handler({ discordData }, { user }) {
        // TODO: Check auth level of current user
        if (!canUpdateUserDetails(user)) {
            throw {
                errorMessage: "You don't have permission update user details",
                errorCode: 403
            };
        }

        // TODO: Get airtable user based on discordData
        let players = (await Promise.all((await Cache.get("Players")).ids.map(id => (Cache.get(id.slice(3))))));
        let searchValues = [`${discordData.username}`, `${discordData.username}#${discordData.discriminator ?? "0000"}`];
        let potentials = players.filter((player) => {
            return (!player.discord_id) && searchValues.includes(player.discord_tag);
        });

        if (potentials.length === 0) {
            throw {
                errorMessage: "Unable to find SLMN.GG user based on discord details",
                errorCode: 404
            };
        } else if (potentials.length > 1) {
            throw {
                errorMessage: "Found more than 1 SLMN.GG player baesd on discord details",
                errorCode: 500
            };
        }

        const targetUser = potentials[0];

        // TODO: Update record with discord ID

        console.log("[profile]", user.airtable.name, user.airtable.id, "is setting discord id for", targetUser.name, targetUser.id, "to", discordData.id);
        let response = await this.helpers.updateRecord("Players", targetUser, {
            "Discord Id": discordData.id
        });

        if (response?.error) {
            console.error("Airtable error", response.error);
            throw "Airtable error";
        }
        return targetUser.name;
    }
};

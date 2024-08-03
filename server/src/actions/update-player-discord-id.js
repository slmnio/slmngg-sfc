import { canUpdateUserDetails } from "../action-utils/action-permissions.js";
import { log } from "../discord/slmngg-log.js";
import { userMention } from "discord.js";
import * as Cache from "../cache.js";
import { cleanID } from "../action-utils/action-utils.js";


export default {
    key: "update-player-discord-id",
    requiredParams: ["discordData", "slmnggId"],
    auth: ["user"],
    /***
     * @param {import("discord.js").User} discordData
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

        if (!targetUser?.id) throw { errorMessage: "No user found to send to Airtable" };

        let response = await this.helpers.updateRecord("Players", targetUser, {
            "Discord ID": discordData.id,
            "Discord Tag": discordData.username
        });

        await log(`[Profile] ${user.airtable.name} ${userMention(user.discord.id)} ${cleanID(user.airtable.id)} is linking Discord account for ${userMention(discordData.id)} ${discordData.id} to ${targetUser.name} ${cleanID(targetUser.id)} https://slmn.gg/player/${cleanID(targetUser.id)}`);

        if (response?.error) {
            console.error("Airtable error", response.error);
            throw "Airtable error";
        }
        return targetUser.name;
    }
};

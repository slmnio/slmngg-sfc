import { deAirtable } from "shared";

export default {
    key: "create-live-guest",
    requiredParams: [],
    auth: ["user"],
    /***
     * @param {Object?} params
     * @param {ActionAuth["user"]} user
     * @returns {Promise<{}>}
     */
    async handler(params, { user }) {
        let response = await this.helpers.updateRecord("Players", user.airtable, {
            "Avatar": `https://cdn.discordapp.com/avatars/${user.discord.id}/${user.discord.avatar}.webp?size=512`,
            "Use Cam": true
        });
        if (response?.error) {
            console.error("Airtable error", response.error);
            throw "Airtable error";
        }
        return deAirtable(response.fields);
    }
};

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
        if (user.airtable?.live_guests?.length > 0) {
            const currentLiveGuest = await this.helpers.get(user.airtable?.live_guests[0]);
            if (!currentLiveGuest?.id) {
                console.error("No live guest data loaded", user.airtable?.live_guests[0], currentLiveGuest);
                throw "No live guest data available";
            }
            let response = await this.helpers.updateRecord("Live Guests", currentLiveGuest, {
                "Discord ID": user.discord.id,
                "Avatar": `https://cdn.discordapp.com/avatars/${user.discord.id}/${user.discord.avatar}.webp?size=512`,
                "Use Cam": true
            });
            if (response?.error) {
                console.error("Airtable error", response.error);
                throw "Airtable error";
            }
            return deAirtable(response.fields);
        } else {
            let response = await this.helpers.createRecord("Live Guests", {
                "Discord ID": user.discord.id,
                "Avatar": `https://cdn.discordapp.com/avatars/${user.discord.id}/${user.discord.avatar}.webp?size=512`,
                "Player": [user.airtable.id],
                "Use Cam": true
            });
            if (response?.error) {
                console.error("Airtable error", response.error);
                throw "Airtable error";
            }
            return deAirtable(response[0].fields);
        }
    }
};

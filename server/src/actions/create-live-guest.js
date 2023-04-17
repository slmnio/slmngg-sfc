module.exports = {
    key: "create-live-guest",
    requiredParams: [],
    auth: ["user"],
    /***
     * @param {Object?} params
     * @param {UserData} user
     * @returns {Promise<void>}
     */
    async handler(params, { user }) {
        if (user.airtable?.live_guests?.length > 0) {
            const currentLiveGuest = await this.helpers.get(user.airtable?.live_guests[0]);
            let response = await this.helpers.updateRecord("Live Guests", currentLiveGuest, {
                "Discord ID": user.discord.id,
                "Avatar": `https://cdn.discordapp.com/avatars/${user.discord.id}/${user.discord.avatar}.webp?size=512`,
                "Use Cam": true
            });
            if (response?.error) {
                console.error("Airtable error", response.error);
                throw "Airtable error";
            }
        } else {
            let response = await this.helpers.createRecord("Live Guests", {
                "Discord ID": user.discord.id,
                "Avatar": `https://cdn.discordapp.com/avatars/${user.discord.id}/${user.discord.avatar}.webp?size=512`,
                "Name": user.discord.username,
                "Player": [user.airtable.id],
                "Use Cam": true
            });
            if (response?.error) {
                console.error("Airtable error", response.error);
                throw "Airtable error";
            }
        }
    }
};

module.exports = {
    key: "create-live-guest",
    requiredParams: [],
    auth: ["user"],
    /***
     * @param {ActionSuccessCallback} success
     * @param {ActionErrorCallback} error
     * @param {object}
     * @param {UserData} user
     * @param {SimpleUpdateRecord} updateRecord
     * @returns {Promise<void>}
     */
    async handler(success, error, {  }, { user }, { updateRecord, get, createRecord }) {
        if (user.airtable?.live_guests?.length > 0) {
            const currentLiveGuest = await get(user.airtable?.live_guests[0]);
            console.log(currentLiveGuest);
            let response = await updateRecord("Live Guests", currentLiveGuest, {
                "Discord ID": user.discord.id,
                "Avatar": `https://cdn.discordapp.com/avatars/${user.discord.id}/${user.discord.avatar}.webp?size=512`
            });
            return response?.error ? error("Airtable error", 500) : success();
        } else {
            let response = await createRecord("Live Guests", {
                "Discord ID": user.discord.id,
                "Avatar": `https://cdn.discordapp.com/avatars/${user.discord.id}/${user.discord.avatar}.webp?size=512`,
                "Name": user.discord.username,
                "Player": [user.airtable.id]
            });
            return response?.error ? error("Airtable error", 500) : success();
        }
    }
};

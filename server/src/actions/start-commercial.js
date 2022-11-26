const { getTwitchChannel,
    getTwitchAPIClient
} = require("../action-utils");
module.exports = {
    key: "start-commercial",
    auth: ["client"],
    requiredParams: ["commercialDuration"],
    /***
     * @param {ActionSuccessCallback} success
     * @param {ActionErrorCallback} error
     * @param {30 | 60 | 90 | 120 | 150 | 180} commercialDuration
     * @param {ClientData} client
     * @param {CacheGetFunction} get
     * @param {CacheAuthFunctions} auth
     * @param {SimpleUpdateRecord} updateRecord
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line no-empty-pattern
    async handler(success, error, { commercialDuration }, { client }, { get, auth }) {
        if (!user.airtable?.website_settings?.includes("Full broadcast permissions")) return error("You don't have permission to start a commercial", 403);
        const { channel } = getTwitchChannel(client, ["channel:edit:commercial"], { success, error });
        const api = getTwitchAPIClient(channel);
        try {
            await api.channels.startChannelCommercial(channel.channel_id, commercialDuration);
        } catch (e) {
            console.log(e);
            return error("Failed to start commercial");
        }
        return success();
    }
};

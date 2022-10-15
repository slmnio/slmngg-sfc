const { ApiClient } = require("@twurple/api");
const { StaticAuthProvider } = require("@twurple/auth");
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
        const broadcast = await get(client?.broadcast?.[0]);
        if (!broadcast) return error("No broadcast associated");
        if (!broadcast.channel) return error("No channel associated with broadcast");

        const channel = await auth.getChannel(broadcast?.channel?.[0]);
        if (!channel.twitch_refresh_token) return error("No twitch auth token associated with channel");
        if (!channel.channel_id || !channel.name || !channel.twitch_scopes) return error("Invalid channel data");
        let scopes = channel.twitch_scopes.split(" ");
        if (!["channel:edit:commercial"].every(scope => scopes.includes(scope))) return error("Token doesn't have the required scopes");

        const accessToken = await auth.getTwitchAccessToken(channel);

        const authProvider = new StaticAuthProvider(process.env.TWITCH_CLIENT_ID, accessToken);
        const api = new ApiClient({authProvider});

        try {
            await api.channels.startChannelCommercial(channel.channel_id, commercialDuration);
        } catch (e) {
            console.log(e);
            return error("Failed to start commercial");
        }
        return success();
    }
};

const { ApiClient } = require("@twurple/api");
const { StaticAuthProvider } = require("@twurple/auth");
module.exports = {
    key: "set-title",
    auth: ["client"],
    /***
     * @param {ActionSuccessCallback} success
     * @param {ActionErrorCallback} error
     * @param {number?} autoLockAfter
     * @param {ClientData} client
     * @param {CacheGetFunction} get
     * @param {CacheAuthFunctions} auth
     * @param {SimpleUpdateRecord} updateRecord
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line no-empty-pattern
    async handler(success, error, { }, { client }, { get, auth }) {
        const broadcast = await get(client?.broadcast?.[0]);
        if (!broadcast) return error("No broadcast associated");
        if (!broadcast.channel) return error("No channel associated with broadcast");

        const event = await get(broadcast.event?.[0]);
        if (!event) return error("No event associated with broadcast");


        const channel = await auth.getChannel(broadcast?.channel?.[0]);
        if (!channel.twitch_refresh_token) return error("No twitch auth token associated with channel");
        if (!channel.channel_id || !channel.name || !channel.twitch_scopes) return error("Invalid channel data");
        let scopes = channel.twitch_scopes.split(" ");
        if (!["channel:manage:broadcast"].every(scope => scopes.includes(scope))) return error("Token doesn't have the required scopes");

        const accessToken = await auth.getTwitchAccessToken(channel);

        const authProvider = new StaticAuthProvider(process.env.TWITCH_CLIENT_ID, accessToken);
        const api = new ApiClient({authProvider});


        const match = await get(broadcast?.live_match?.[0]);
        if (!match) return error("No match associated");

        const team1 = await get(match?.teams?.[0]);
        const team2 = await get(match?.teams?.[1]);
        if (!team1 || !team2) return error("Did not find two teams!");

        const formatOptions = {
            "event": event.name,
            "event_long": event.name,
            "event_short": event.short,
            "team_1_code": team1.code,
            "team_1_name": team1.name,
            "team_2_code": team2.code,
            "team_2_name": team2.name,
            "match_sub_event": match.sub_event,
            "match_round": match.round,
            "match_number": match.match_number,
        };

        let newTitle = broadcast.title_format;

        Object.entries(formatOptions).forEach(([key, val]) => {
            newTitle = newTitle.replace(`{${key}}`, val);
        });

        const gameMap = {
            "Overwatch": "Overwatch 2",
            "Valorant": "VALORANT",
            "League of Legends": "League of Legends"
        };

        if (event.game && gameMap[event.game]) {
            const game = await api.games.getGameByName(gameMap[event.game]);
            const channelInfo = api.channels.updateChannelInfo(channel.channel_id, {
                title: newTitle,
                gameId: game.id
            });
            console.log(channelInfo);
        } else {
            const channelInfo = api.channels.updateChannelInfo(channel.channel_id, {
                title: newTitle
            });
            console.log(channelInfo);
        }

        return success();
        // return response?.error ? error("Airtable error", 500) : success();
    }
};

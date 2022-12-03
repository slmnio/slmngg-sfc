const { getTwitchChannel,
    getMatchData,
    getTwitchAPIClient
} = require("../action-utils");
module.exports = {
    key: "set-title",
    auth: ["client"],
    /***
     * @param {Object?} params
     * @param {ClientData} client
     * @param {CacheGetFunction} get
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line no-empty-pattern
    async handler(params, { client }) {
        const { broadcast, channel } = getTwitchChannel(client, ["channel:manage:broadcast"]);

        const event = await this.helpers.get(broadcast.event?.[0]);
        if (!event) throw ("No event associated with broadcast");

        const api = await getTwitchAPIClient(channel);
        const { match, team1, team2 } = await getMatchData(broadcast, true);

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
    }
};

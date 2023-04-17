const { getTwitchChannel,
    getMatchData,
    getTwitchAPIClient
} = require("../action-utils/action-utils");
module.exports = {
    key: "set-title",
    auth: ["client"],
    /***
     * @param {Object?} params
     * @param {ClientData} client
     * @param {CacheGetFunction} get
     * @returns {Promise<string>}
     */
    // eslint-disable-next-line no-empty-pattern
    async handler(params, { client }) {
        const { broadcast, channel } = await getTwitchChannel(client, ["channel:manage:broadcast"]);

        if (!broadcast.title_format) throw "The broadcast has no title format";

        const event = await this.helpers.get(broadcast.event?.[0]);
        if (!event) throw ("No event associated with broadcast");

        const api = await getTwitchAPIClient(channel);
        const { match, team1, team2 } = await getMatchData(broadcast, true);

        const formatOptions = {
            "event": event.name,
            "event_name": event.name,
            "event_long": event.name,
            "event_short": event.short,

            "team_1_code": team1.code,
            "team_1_name": team1.name,
            "team_2_code": team2.code,
            "team_2_name": team2.name,

            "match_custom_name": match.custom_name,
            "match_sub_event": match.sub_event,
            "match_group": match.match_group,
            "match_round": match.round,
            "match_number": match.match_number,
        };

        let newTitle = broadcast.title_format;

        Object.entries(formatOptions).forEach(([key, val]) => {
            newTitle = newTitle.replace(`{${key}}`, val || "");
        });

        newTitle = newTitle.trim();

        const gameMap = {
            "Overwatch": "Overwatch 2",
            "Valorant": "VALORANT",
            "League of Legends": "League of Legends",
            "F1": "F1 22"
        };

        if (event.game && gameMap[event.game]) {
            const game = await api.games.getGameByName(gameMap[event.game]);
            await api.channels.updateChannelInfo(channel.channel_id, {
                title: newTitle,
                gameId: game.id
            });
        } else {
            await api.channels.updateChannelInfo(channel.channel_id, {
                title: newTitle
            });
        }
        return `Updated ${channel.name}'s title to "${newTitle}"`;
    }
};

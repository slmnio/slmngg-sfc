import { getMatchData, getTwitchAPIClient, getTwitchAPIError, getTwitchChannel } from "../action-utils/action-utils.js";


export default {
    key: "set-title",
    auth: ["client"],
    /***
     * @param {Object?} params
     * @param {ActionAuth["client"]} client
     * @param {ActionAuth["isAutomation"]} isAutomation
     * @returns {Promise<string>}
     */
    // eslint-disable-next-line no-empty-pattern
    async handler(params, { client, isAutomation }) {
        const { broadcast, channel } = await getTwitchChannel(client, ["channel:manage:broadcast"], isAutomation ? params?.broadcastID : null);

        const event = await this.helpers.get(broadcast.event?.[0]);
        if (!event?.id) throw ("No event associated with broadcast");

        const api = await getTwitchAPIClient(channel);
        const { match, team1, team2 } = await getMatchData(broadcast, true);

        const format = (match.special_event ? broadcast.special_title_format : broadcast.title_format) || broadcast.title_format;
        if (!format) throw "The broadcast has no title format";

        const formatOptions = {
            "event": event.name,
            "event_name": event.name,
            "event_long": event.name,
            "event_short": event.short,

            "team_1_code": team1.code,
            "team_1_name": team1.safe_twitch_name || team1.name,
            "team_2_code": team2.code,
            "team_2_name": team2.safe_twitch_name || team2.name,

            "match_custom_name": match.custom_name,
            "match_sub_event": match.sub_event,
            "match_group": match.match_group,
            "match_round": match.round,
            "match_number": match.match_number,
            "match_week_text": match.week_text,
            "match_week_number": match.week,
            "match_division": match.division,
            "match_day": match.day,
            "match_first_to": match.first_to,
            "match_first_to_short": match.first_to ? `FT${match.first_to}` : null,
            "match_first_to_long": match.first_to ? `First to ${match.first_to}` : null,
            "match_best_of_short": match.first_to ? `BO${(match.first_to * 2) - 1}` : null,
            "match_best_of_long": match.first_to ? `Best of ${(match.first_to * 2) - 1}` : null
        };

        let newTitle = format;

        Object.entries(formatOptions).forEach(([key, val]) => {
            newTitle = newTitle.replace(`{${key}}`, val || "");
        });

        newTitle = newTitle.trim();

        const gameMap = {
            "Overwatch": "Overwatch 2",
            "Valorant": "VALORANT",
            "League of Legends": "League of Legends",
            "F1": "F1 23"
        };

        try {
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
        } catch (e) {
            console.error(getTwitchAPIError(e), e);
            throw { errorCode: 500, errorMessage: `Twitch error: ${getTwitchAPIError(e)}` };
        }
        return `Updated ${channel.name}'s title to "${newTitle}"`;
    }
};

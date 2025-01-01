import { getMatchData, getTwitchAPIClient, getTwitchAPIError, getTwitchChannel } from "../action-utils/action-utils.js";


export default {
    key: "set-marker",
    auth: ["client"],
    optionalParams: ["text"],
    /***
     * @param {Object?} params
     * @param {ActionAuth["client"]} client
     * @returns {Promise<string>}
     */
    // eslint-disable-next-line no-empty-pattern
    async handler({ text, broadcastID }, { client, isAutomation }) {
        const { broadcast, channel } = await getTwitchChannel(client, ["channel:manage:broadcast"], isAutomation ? broadcastID : null);

        const event = await this.helpers.get(broadcast.event?.[0]);
        if (!event?.id) throw ("No event associated with broadcast");

        const api = await getTwitchAPIClient(channel);
        const { match, team1, team2 } = await getMatchData(broadcast, true);

        const markerText = text || (match.special_event ? match.custom_name : [team1, team2].map(t => t.name).join(" vs "));

        try {
            await api.streams.createStreamMarker(channel.channel_id, markerText);
        } catch (e) {
            throw { errorCode: 500, errorMessage: `Error creating marker: ${getTwitchAPIError(e)}` };
        }

        return `Added a stream marker: "${markerText}"`;
    }
};

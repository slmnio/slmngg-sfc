const {
    getTwitchChannel,
    getMatchData,
    getTwitchAPIClient
} = require("../action-utils/action-utils");
module.exports = {
    key: "set-marker",
    auth: ["client"],
    optionalParams: ["text"],
    /***
     * @param {Object?} params
     * @param {ClientData} client
     * @param {CacheGetFunction} get
     * @returns {Promise<string>}
     */
    // eslint-disable-next-line no-empty-pattern
    async handler({ text, broadcastID }, { client, isAutomation }) {
        const { broadcast, channel } = await getTwitchChannel(client, ["channel:manage:broadcast"], isAutomation ? broadcastID : null);

        const event = await this.helpers.get(broadcast.event?.[0]);
        if (!event) throw ("No event associated with broadcast");

        const api = await getTwitchAPIClient(channel);
        const { match, team1, team2 } = await getMatchData(broadcast, true);

        const markerText = text || [team1, team2].map(t => t.name).join("vs");

        await api.streams.createStreamMarker(channel.channel_id, markerText);

        return `Added a stream marker: "${markerText}"`;
    }
};

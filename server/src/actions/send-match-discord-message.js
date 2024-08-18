const { getMatchData, cleanID } = require("../action-utils/action-utils");
const discordClient = require("../discord/client.js");
const { MapObject } = require("../discord/managers");
module.exports = {
    key: "send-match-discord-message",
    auth: ["client", "user"],
    /***
     * @param {Object?} params
     * @param {ClientData} client
     * @param {CacheGetFunction} get
     * @returns {Promise<string>}
     */
    // eslint-disable-next-line no-empty-pattern
    async handler({ broadcastID }, { user, client, isAutomation }) {
        if (!discordClient) throw "Discord is not set up on this server";
        if (!isAutomation && !user.airtable?.website_settings?.includes("Full broadcast permissions")) throw { errorCode: 403, errorMessage: "You don't have permission to start a commercial" };

        let broadcast = await this.helpers.get(isAutomation ? broadcastID : client?.broadcast?.[0]);
        if (!broadcast?.id) throw ("No broadcast associated");

        if (!broadcast?.discord_control) throw "No Discord data on this broadcast";
        const discordData = new MapObject(broadcast.discord_control);
        const channelID = discordData.get("live_text_channel");
        if (!channelID) throw "No live channel set on this broadcast";

        const channel = await discordClient.channels.fetch(channelID);
        if (!channel) throw "No live channel found on this broadcast";

        const { match } = await getMatchData(broadcast);
        if (!match) throw "No live match set on this broadcast";

        await channel.send(`https://slmn.gg/detailed/${cleanID(match.id)}`);
    }
};

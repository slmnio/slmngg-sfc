import { getTwitchAPIClient, getTwitchAPIError, getTwitchChannel } from "../action-utils/action-utils.js";

export default {
    key: "start-commercial",
    auth: ["user", "client"],
    requiredParams: ["commercialDuration"],
    /***
     * @param {30 | 60 | 90 | 120 | 150 | 180} commercialDuration
     * @param {UserData} user
     * @param {ClientData} client
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line no-empty-pattern
    async handler({ commercialDuration }, { user, client }) {
        if (!user.airtable?.website_settings?.includes("Full broadcast permissions")) throw { errorCode: 403, errorMessage: "You don't have permission to start a commercial" };
        const { channel } = await getTwitchChannel(client, ["channel:edit:commercial"]);
        const api = await getTwitchAPIClient(channel);
        try {
            await api.channels.startChannelCommercial(channel.channel_id, commercialDuration);
        } catch (e) {
            console.error(getTwitchAPIError(e), e);
            throw { errorCode: 500, errorMessage: `Failed to start commercial: ${getTwitchAPIError(e)}` };
        }
    }
};

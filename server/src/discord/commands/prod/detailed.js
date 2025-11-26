import { SlashCommandBuilder } from "discord.js";
import * as Cache from "../../../cache.js";
import { MapObject } from "../../managers.js";
import { cleanID } from "shared";


export default {
    data: new SlashCommandBuilder()
        .setName("detailed")
        .setDescription("Get a link to the current match's detailed view"),
    /**
     *
     * @param {import("discord.js").CommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        await interaction.deferReply();


        const broadcastIds = (await Cache.get("Broadcasts"))?.ids;
        const broadcasts = await Promise.all(broadcastIds.map(id => Cache.get(id)));

        let targetBroadcast = broadcasts.filter(broadcast => {
            if (!broadcast.active) return false;

            const discordData = new MapObject(broadcast.discord_control);
            return discordData.get("live_text_channel") === interaction.channelId;
        })?.[0];

        if (!targetBroadcast) {
            // check for user's linked broadcast
            const player = await Cache.auth.getPlayer(interaction.user.id);
            if (!player?.clients?.length) {
                return interaction.followUp("Couldn't find a broadcast");
            }
            const clientID = player.clients?.[0];

            const client = await Cache.get(clientID);
            if (!client) {
                return interaction.followUp("Couldn't find player client");
            }

            targetBroadcast = client?.broadcast
                .map(broadcastID => broadcasts.find(broadcast => broadcast.id === broadcastID))
                .find(broadcast => broadcast?.active);

        }

        if (!targetBroadcast) {
            return interaction.followUp("Couldn't find a broadcast");
        }

        if (!targetBroadcast.live_match) return interaction.followUp(`Couldn't find live match on broadcast ${targetBroadcast?.name}!`);
        const match = await Cache.get(targetBroadcast?.live_match?.[0]);
        if (!match?.id) return interaction.followUp(`Couldn't find live match on broadcast ${targetBroadcast?.name}!`);

        let subdomain = "";

        if (match?.event?.length) {
            const event = await Cache.get(match?.event?.[0]);
            if (event?.subdomain || event?.partial_subdomain) {
                subdomain = (event.subdomain || event.partial_subdomain || "") + ".";
            }
        }

        return interaction.followUp(`https://${subdomain}slmn.gg/detailed/${cleanID(match.id)}`);
    },
};

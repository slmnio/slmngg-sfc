const {
    SlashCommandBuilder,
    CommandInteraction
} = require("discord.js");

const Cache = require("../../../cache.js");
const { MapObject } = require("../../managers");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("detailed")
        .setDescription("Get a link to the current match's detailed view"),
    /**
     *
     * @param {CommandInteraction} interaction
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
            targetBroadcast = broadcasts.filter(broadcast => {
                if (!broadcast.active) return false;
                return (broadcast.clients || []).includes(clientID);
            })?.[0];
        }

        if (!targetBroadcast) {
            return interaction.followUp("Couldn't find a broadcast");
        }

        if (!targetBroadcast?.["live_match"]) return interaction.followUp(`Couldn't find live match on broadcast ${targetBroadcast?.name}!`);

        return interaction.followUp(`https://dev.slmn.gg/detailed/${targetBroadcast.live_match?.[0]}`);
    },
};

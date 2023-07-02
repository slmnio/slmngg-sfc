const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");
const Cache = require("../../../cache");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("rtmp")
        .addStringOption(option =>
            option.setName("feed").setDescription("Name of the feed"))
        .addStringOption(option =>
            option.setName("region")
                .setDescription("RTMP server region")
                .addChoices(
                    {
                        name: "US Central (default)",
                        value: "nac"
                    },
                    {
                        name: "EU West",
                        value: "eu"
                    }
                ))
        .setDescription("Get an RTMP link to a feed"),
    async execute(interaction) {
        await interaction.deferReply();

        let feedId = interaction.options.getString("feed")?.toLocaleLowerCase();
        if (!feedId) {
            const playerIds = (await Cache.get("Players"))?.ids;
            const players = await Promise.all(playerIds.map(id => Cache.get(id)));
            let targetPlayer = players.filter(player => {
                return player.discord_id === interaction.user.id;
            })?.[0];

            let playerClient = await Cache.get(targetPlayer?.clients?.[0]);
            if (!playerClient || !playerClient?.key) {
                return interaction.followUp("Couldn't find a feed");
            }
            feedId = playerClient?.key;
        }


        const region = interaction.options.getString("region") ?? "nac";

        const embed = new EmbedBuilder()
            .setTitle("RTMP Observer URLs")
            .addFields([
                {
                    name: "Observer",
                    value: `\`rtmp://${region}.borpa.business/live\`\nStream Key: \`${feedId}\``
                },
                {
                    name: "Producer",
                    value: `\`rtmp://${region}.borpa.business/live/${feedId}\``
                }
            ]);

        return interaction.followUp({
            embeds: [embed]
        });
    },
};

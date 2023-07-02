const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");
const Cache = require("../../../cache");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("srt")
        .addStringOption(option =>
            option.setName("feed").setDescription("Name of the feed"))
        .addStringOption(option =>
            option.setName("region")
                .setDescription("SRT server region")
                .addChoices(
                    {
                        name: "US East (default)",
                        value: "na"
                    },
                    {
                        name: "EU West",
                        value: "eu"
                    },
                    {
                        name: "US Central (deprecated)",
                        value: "nac"
                    },
                ))
        .addIntegerOption(option =>
            option.setName("latency")
                .setDescription("Latency of the SRT Feed (in ms)")
                .setMinValue(0)
                .setMaxValue(5000))
        .setDescription("Get an SRT link to a feed"),
    async execute(interaction) {
        await interaction.deferReply();

        let feedId = interaction.options.getString("feed")?.toLocaleLowerCase();
        if (!feedId) {
            let targetPlayer = await Cache.auth.getPlayer(interaction.user.id);
            let playerClient = await Cache.get(targetPlayer?.clients?.[0]);
            if (!playerClient || !playerClient?.key) {
                return interaction.followUp("Couldn't find a feed");
            }
            feedId = playerClient?.key;
        }

        const region = interaction.options.getString("region") ?? "na";
        const latency = interaction.options.getInteger("latency") ?? 500;

        const embed = new EmbedBuilder()
            .setTitle("SRT Observer URLs")
            .addFields([
                {
                    name: "Observer",
                    value: `\`srt://${region}.borpa.business:10000?streamid=publish/${feedId}&latency=${latency * 1000}\``
                },
                {
                    name: "Producer",
                    value: `\`srt://${region}.borpa.business:10000?streamid=play/${feedId}&latency=${latency * 1000}\``
                }
            ]);

        return interaction.followUp({
            embeds: [embed]
        });
    },
};

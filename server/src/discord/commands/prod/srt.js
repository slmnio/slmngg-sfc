const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("srt")
        .addStringOption(option =>
            option.setName("feed").setDescription("Name of the feed").setRequired(true))
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
        const feed = interaction.options.getString("feed")?.toLocaleLowerCase();

        const region = interaction.options.getString("region") ?? "na";
        const latency = interaction.options.getInteger("latency") ?? 500;

        const embed = new EmbedBuilder()
            .setTitle("SRT Observer URLs")
            .addFields([
                {
                    name: "Observer",
                    value: `\`srt://${region}.borpa.business:10000?streamid=publish/${feed}&latency=${latency * 1000}\``
                },
                {
                    name: "Producer",
                    value: `\`srt://${region}.borpa.business:10000?streamid=play/${feed}&latency=${latency * 1000}\``
                }
            ]);

        await interaction.reply({
            embeds: [embed]
        });
    },
};

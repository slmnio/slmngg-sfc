const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("rtmp")
        .addStringOption(option =>
            option.setName("feed").setDescription("Name of the feed").setRequired(true))
        .addStringOption(option =>
            option.setName("region")
                .setDescription("RTMP server region")
                .addChoices(
                    {
                        name: "US Central (deprecated)",
                        value: "nac"
                    },
                    {
                        name: "EU West",
                        value: "eu"
                    }
                ))
        .setDescription("Get an RTMP link to a feed"),
    async execute(interaction) {
        const feed = interaction.options.getString("feed")?.toLocaleLowerCase();
        const region = interaction.options.getString("region") ?? "nac";

        const embed = new EmbedBuilder()
            .setTitle("RTMP Observer URLs")
            .addFields([
                {
                    name: "Observer",
                    value: `\`rtmp://${region}.borpa.business/live\`\nStream Key: \`${feed}\``
                },
                {
                    name: "Producer",
                    value: `\`rtmp://${region}.borpa.business/live\``
                }
            ]);

        await interaction.reply({
            embeds: [embed]
        });
    },
};

const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");
const Cache = require("../../../cache");

const SERVERS = [
    {
        name: "EU West",
        region: "eu",
        domain: "srt://eu.borpa.business:10000",
        feeds: {
            observer: (streamId, latency) => `?streamid=publish/${streamId}&latency=${latency * 1000}`,
            producer: (streamId, latency) => `?streamid=play/${streamId}&latency=${latency * 1000}`
        }
    },
    {
        name: "US East",
        region: "na",
        domain: "srt://na.borpa.business:10000",
        feeds: {
            observer: (streamId, latency) => `?streamid=#!::m=publish,r=${streamId}&latency=${latency * 1000}`,
            producer: (streamId, latency) => `?streamid=#!::m=request,r=${streamId}&latency=${latency * 1000}`
        }
    }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("srt")
        .addStringOption(option =>
            option.setName("feed").setDescription("Name of the feed"))
        .addUserOption(option =>
            option.setName("user").setDescription("User to get the feed of"))
        .addStringOption(option =>
            option.setName("region")
                .setDescription("SRT server region")
                .addChoices(SERVERS.map(server => ({
                    name: server.name,
                    value: server.region
                }))))
        .addIntegerOption(option =>
            option.setName("latency")
                .setDescription("Latency of the SRT Feed (in ms)")
                .setMinValue(0)
                .setMaxValue(5000))
        .setDescription("Get an SRT link to a feed"),
    async execute(interaction) {
        await interaction.deferReply();

        let feedId = interaction.options.getString("feed")?.toLocaleLowerCase();
        let targetUser = interaction.options.getUser("user") ?? interaction.user;

        if (!feedId) {
            let targetPlayer = await Cache.auth.getPlayer(targetUser.id);
            let playerClient = await Cache.get(targetPlayer?.clients?.[0]);
            if (!playerClient || !playerClient?.key) {
                return interaction.followUp("Couldn't find a feed");
            }
            feedId = playerClient?.key;
        }

        const region = interaction.options.getString("region");
        const selectedServer = region ? SERVERS.find(server => region === server.region) : SERVERS[0];
        const latencyMs = interaction.options.getInteger("latency") ?? 500;

        const embed = new EmbedBuilder()
            .setTitle("SRT Observer URLs")
            .addFields([
                {
                    name: "Observer",
                    value: selectedServer.feeds.observer(feedId, latencyMs)
                },
                {
                    name: "Producer",
                    value: selectedServer.feeds.producer(feedId, latencyMs)
                }
            ]);

        return interaction.followUp({
            embeds: [embed]
        });
    },
};

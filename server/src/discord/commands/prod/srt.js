const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");
const Cache = require("../../../cache");
const { getInternalManager } = require("../../../action-utils/action-manager");

const SERVERS = [
    {
        name: "EU West",
        region: "eu",
        domain: "srt://eu.borpa.business:10000",
        feeds: {
            push: (streamId, latency) => `?streamid=publish/${streamId}&latency=${latency * 1000}`,
            view: (streamId, latency) => `?streamid=play/${streamId}&latency=${latency * 1000}`
        }
    },
    {
        name: "US East",
        region: "na",
        domain: "srt://na.borpa.business:10000",
        feeds: {
            push: (streamId, latency) => `?streamid=#!::m=publish,r=${streamId}&latency=${latency * 1000}`,
            view: (streamId, latency) => `?streamid=#!::m=request,r=${streamId}&latency=${latency * 1000}`
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

        let targetUser, targetPlayer, playerClient;

        if (!feedId) {
            targetUser = interaction.options.getUser("user") ?? interaction.user;
            targetPlayer = await Cache.auth.getPlayer(targetUser.id);
            playerClient = await Cache.get(targetPlayer?.clients?.[0]);
            if (!playerClient || !playerClient?.key) {
                return interaction.followUp("Couldn't find a client for the specified player");
            }
            feedId = playerClient?.key;
        }

        const region = interaction.options.getString("region");
        const selectedServer = region ? SERVERS.find(server => region === server.region) : SERVERS[0];
        const latencyMs = interaction.options.getInteger("latency") ?? 500;

        let footer;

        if (targetPlayer) {
            const newFeed = selectedServer.domain + selectedServer.feeds.view(feedId, latencyMs);
            if (targetPlayer?.remote_feed === newFeed) {
                footer = `Remote feed URL stored on ${targetUser.id === interaction.user.id ? "your" : targetPlayer + "'s"} player profile.`;
            } else {
                const internalManager = getInternalManager();

                if (internalManager) {
                    try {
                        await internalManager.runActionAsAutomation("set-player-remote-feed", {
                            player: targetPlayer,
                            feed: newFeed
                        });
                        footer = `New remote feed URL updated on ${targetUser.id === interaction.user.id ? "your" : targetPlayer.name + "'s"} player profile.`;
                    } catch (e) {
                        console.error("Error setting player remote feed", e);
                    }
                } else {
                    console.warn("Couldn't load internal manager");
                }
            }
        }

        const embed = new EmbedBuilder()
            .setTitle("SRT Observer URLs")
            .addFields([
                {
                    name: "Observer",
                    value: `\`\`\`${selectedServer.domain + selectedServer.feeds.push(feedId, latencyMs)}\`\`\``
                },
                {
                    name: "Producer",
                    value: `\`\`\`${selectedServer.domain + selectedServer.feeds.view(feedId, latencyMs)}\`\`\``
                }
            ]);
        if (footer) {
            embed.setFooter({ text: footer });
        }

        return interaction.followUp({
            embeds: [embed]
        });
    },
};

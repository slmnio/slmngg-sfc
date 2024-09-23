import * as Cache from "../../../cache.js";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";


export default {
    data: new SlashCommandBuilder()
        .setName("rtmp")
        .addStringOption(option =>
            option.setName("feed").setDescription("Name of the feed"))
        .addUserOption(option =>
            option.setName("user").setDescription("User to get the feed of"))
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
        let targetUser = interaction.options.getUser("user") ?? interaction.user;

        if (!feedId) {
            let targetPlayer = await Cache.auth.getPlayer(targetUser.id);
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

import { EmbedBuilder, SlashCommandBuilder, userMention } from "discord.js";
import * as Cache from "../../../cache.js";
import { getInternalManager } from "../../../action-utils/action-manager.js";


function generateWebcamLink(code) {
    if (code.includes("http")) return code.replace("view=", "push=");
    return `https://cams.prod.slmn.gg/?push=${code}&webcam&cb=0&nmb=0&hideaudio=1`;
}

export default {
    data: new SlashCommandBuilder()
        .setName("webcam")
        .addUserOption(option => option.setName("user").setDescription("The user to show the webcam of"))
        // .addStringOption(option => option.setName("forced-name").setDescription("Get a webcam link for a name"))
        .setDescription("Get a webcam link for a user"),
    /**
     *
     * @param {import("discord.js").CommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        const ephemeral = interaction.options.getUser("user") === interaction.user || interaction.options.getUser("user") === null;
        const target = interaction.options.getUser("user") ?? interaction.user;

        const startingPing = (ephemeral ? "" : (userMention(target.id) + " "));

        if (ephemeral) {
            await interaction.deferReply({ephemeral});
        } else {
            await interaction.reply(startingPing + " Grabbing your webcam link...");
        }

        const { token } = await Cache.auth.startRawDiscordAuth(target);

        if (!token) {
            return interaction.editReply({
                ephemeral, content: startingPing + "Lookup failed: no user player data found"
            });
        }

        const internalManager = getInternalManager();
        if (!internalManager) {
            return interaction.editReply(startingPing + "No action handlers can process your request.");
        }

        await internalManager.runAction("create-live-guest", {}, token)
            .then(async guestData => {
                const embed = new EmbedBuilder()
                    .setTitle("Webcam link")
                    .setDescription(`${userMention(target.id)}: ${generateWebcamLink(guestData?.cam_code || target.id)}
            ${ephemeral ? "This is your personal webcam link" : "**Links are unique** - make sure you click on your own! Do `/webcam` if you need your own!"}`);

                if (ephemeral) {
                    await interaction.editReply({
                        ephemeral, embeds: [embed]
                    });
                } else {
                    await interaction.editReply({
                        ephemeral, embeds: [embed],
                        content: startingPing + "Here is your webcam link:"
                    });
                }
            })
            .catch(({
                errorCode,
                errorMessage
            }) => {
                console.error({ errorCode, errorMessage });
                interaction.editReply({
                    ephemeral, content: `${startingPing}Lookup failed: ${errorMessage}`
                });
            });
    },
};

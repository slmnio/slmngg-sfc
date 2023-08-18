const {
    ContextMenuCommandBuilder,
    userMention,
    ApplicationCommandType,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuInteraction,
    ButtonInteraction
} = require("discord.js");
const Cache = require("../../../cache.js");

const { getInternalManager } = require("../../../action-utils/action-manager");

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName("Associate with SLMN.GG player")
        .setDMPermission(false)
        .setType(ApplicationCommandType.User),
    async execute(interaction) {
        const ephemeral = true;

        await interaction.deferReply({ ephemeral });

        const { token } = await Cache.auth.startRawDiscordAuth(interaction.user);

        if (!token) {
            return interaction.followUp({ ephemeral, content: "Action failed: no user player data found" });
        }

        const internalManager = getInternalManager();
        if (!internalManager) {
            return interaction.followUp({ ephemeral, content: "No action handlers can process your request." });
        }

        const potentials = await internalManager.runAction("match-discord-slmngg-player", { discordData: interaction.targetUser }, token);
        const rows = [];
        var selectedUser = potentials[0].id;
        var content = `Discord user ${userMention(interaction.targetUser.id)} will be linked to user ${selectedUser.name}`;
        if (potentials.length !== 1) {
            const options = potentials.map((p) => {
                return new StringSelectMenuOptionBuilder()
                    .setLabel(p.name)
                    .setDescription(p.name)
                    .setValue(p.id);
            });
            const dropdown = new StringSelectMenuBuilder()
                .setCustomId("slmngg-player")
                .setPlaceholder("Select SLMNGG player")
                .addOptions(options);
            rows.push(new ActionRowBuilder().addComponents(dropdown));
            content = "Please select the SLMN.GG user to link this account to.";
            selectedUser = null;
        }
        const confirmButton = new ButtonBuilder()
            .setCustomId("confirm")
            .setLabel("Confirm")
            .setStyle(ButtonStyle.Success);

        const cancelButton = new ButtonBuilder()
            .setCustomId("cancel")
            .setDescription("Cancel")
            .setStyle(ButtonStyle.Secondary);

        rows.push(new ActionRowBuilder().addComponents(cancelButton, confirmButton));

        const response = await interaction.followUp({ ephemeral, content, rows });

        const collector = await response.createMessageComponentCollector({ time: 3_600_000 });


        collector.on("collect", async i => {
            if (typeof (i) === StringSelectMenuInteraction) {
                selectedUser = i.values[0];
            } else if (typeof (i) === ButtonInteraction) {
                if (i.customId === "cancel") {
                    await interaction.followUp({ ephemeral, content: "Cancelled action." });
                } else if (i.customId === "confirm" && selectedUser !== null) {
                    await internalManager.runAction("update-player-discord-id", { discordData: interaction.targetUser, slmnggId: selectedUser }, token)
                        .then(async slmnggUser => {
                            await interaction.followUp({ ephemeral, content: `Linked discord user ${userMention(interaction.targetUser.id)} to SLMN.GG user ${slmnggUser}` });
                        })
                        .catch(({
                            errorCode,
                            errorMessage
                        }) => {
                            console.error({ errorCode, errorMessage });
                            interaction.followUp({
                                ephemeral, content: `Action failed: ${errorMessage}`
                            });
                        });
                }
            }

        });
    }
};

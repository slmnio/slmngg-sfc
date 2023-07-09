const {
    ContextMenuCommandBuilder,
    userMention,
    ContextMenuCommandType
} = require("discord.js");
const Cache = require("../../../cache.js");

const { getInternalManager } = require("../../../action-utils/action-manager");

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName("Associate with SLMN.GG player")
        .setDMPermission(false)
        .setType(ContextMenuCommandType.User),
    async execute(interaction) {
        const ephemeral = true;

        await interaction.deferReply({ ephemeral });

        const { token } = await Cache.auth.startRawDiscordAuth(interaction.user);

        if (!token) {
            return interaction.editReply({ ephemeral, content: "Auth failed: no user player data found" });
        }

        const internalManager = getInternalManager();
        if (!internalManager) {
            return interaction.editReply("No action handlers can process your request.");
        }

        await internalManager.runAction("update-player-discord-id", { discordData: interaction.targetUser }, token)
            .then(async slmnggUser => {
                await interaction.editReply({ ephemeral, content: `Linked discord user ${userMention(interaction.targetUser)} to SLMN.GG user ${slmnggUser}` });
            })
            .catch(({
                errorCode,
                errorMessage
            }) => {
                console.error({ errorCode, errorMessage });
                interaction.editReply({
                    ephemeral, content: `Action failed: ${errorMessage}`
                });
            });
    }
};

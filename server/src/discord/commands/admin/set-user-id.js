import {
    ActionRowBuilder,
    ApplicationCommandType,
    ButtonBuilder,
    ButtonStyle,
    ContextMenuCommandBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    userMention
} from "discord.js";
import * as Cache from "../../../cache.js";
import { getInternalManager } from "../../../action-utils/action-manager.js";
import { cleanID } from "shared";


function generatePlayerDescription(player) {
    let descriptionItems = [];
    // descriptionItems.push(`${player["#_of_teams"]} team${player["#_of_teams"] === 1 ? "" : "s"}`);
    if (player.pronouns) descriptionItems.push(`${player.pronouns}`);
    if (player.discord_tag) descriptionItems.push(`Discord: ${player.discord_tag}`);
    if (player.battletag) descriptionItems.push(`Battletag: ${player.battletag}`);
    if (!descriptionItems?.length) return "No additional info";
    return descriptionItems.join(", ");
}

function selectUserUI(targetUser, users, selectedUser) {
    let content;

    const rows = [];

    if (users.length === 1) {
        selectedUser = users[0];
        content = `Found match for ${userMention(targetUser.id)}: [${selectedUser.name}](https://slmn.gg/player/${cleanID(selectedUser.id)})`;
    } else  {
        const options = users.map((p) => {
            const option = new StringSelectMenuOptionBuilder()
                .setLabel(p.name + ` (${p["#_of_teams"]} team${p["#_of_teams"] === 1 ? "" : "s"})`)
                .setDescription(generatePlayerDescription(p))
                .setValue(p.id);
            if (p.id === selectedUser?.id) {
                option.setDefault(true);
            }
            return option;
        });
        const dropdown = new StringSelectMenuBuilder()
            .setCustomId("slmngg-player")
            .setPlaceholder("Select SLMNGG player")
            .addOptions(options);
        rows.push(new ActionRowBuilder().addComponents(dropdown));
        content = "Please select the SLMN.GG user to link this account to.";
    }

    if (selectedUser) {
        const confirmButton = new ButtonBuilder()
            .setCustomId("confirm")
            .setLabel("Confirm")
            .setStyle(ButtonStyle.Success);

        const cancelButton = new ButtonBuilder()
            .setCustomId("cancel")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Secondary);

        rows.push(new ActionRowBuilder().addComponents(cancelButton, confirmButton));
    }

    return {
        components: rows,
        content
    };
}

export default {
    data: new ContextMenuCommandBuilder()
        .setName("Associate with SLMN.GG player")
        .setDMPermission(false)
        .setType(ApplicationCommandType.User),
    async execute(interaction) {
        const ephemeral = true;

        await interaction.deferReply({ ephemeral });

        const { token } = await Cache.auth.startRawDiscordAuth(interaction.user);

        if (!token) {
            return interaction.followUp({ ephemeral, content: "Could not authenticate you with SLMN.GG." });
        }

        const internalManager = getInternalManager();
        if (!internalManager) {
            return interaction.followUp({ ephemeral, content: "Could not handle this request (no internal system available)" });
        }

        const potentials = await internalManager.runAction("match-discord-slmngg-player", { discordData: interaction.targetUser }, token);
        let selectedUser = potentials[0];

        let response = await interaction.followUp({ ephemeral, ...selectUserUI(interaction.targetUser, potentials, null) });

        const collector = await response.createMessageComponentCollector({ time: 3_600_000 });

        collector.on("collect", async event => {
            // console.log("collection", event);

            /* String menu selection */
            if (event.componentType === 3) {
                let selectedUserID = event.values[0];
                selectedUser = potentials.find(u => u.id === selectedUserID);
                console.log("collector setting selected user", selectedUser);
                console.table(event.values);

                let menuOptions = { ephemeral, ...selectUserUI(interaction.targetUser, potentials, selectedUser) };
                console.log(menuOptions);
                event.update({}); // tell discord we've handled this
                await interaction.editReply(menuOptions);

                return;
            }

            /* Button */
            if (event.componentType === 2) {
                event.update({}); // tell discord we've handled this

                if (event.customId === "cancel") {
                    await interaction.followUp({ ephemeral, content: "Cancelled action." });
                    collector.stop();
                } else if (event.customId === "confirm" && selectedUser !== null) {
                    await internalManager.runAction("update-player-discord-id", { discordData: interaction.targetUser, slmnggId: selectedUser?.id }, token)
                        .then(async slmnggUser => {
                            await interaction.followUp({ ephemeral, content: `Linked discord user ${userMention(interaction.targetUser.id)} to SLMN.GG user ${slmnggUser}` });
                            collector.stop();
                        })
                        .catch(async ({
                            errorCode,
                            errorMessage
                        }) => {
                            console.error({ errorCode, errorMessage });
                            await interaction.followUp({
                                ephemeral, content: `Action failed: ${errorMessage}`
                            });
                            collector.stop();
                        });
                }
            }

        });
    }
};

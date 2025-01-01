import fs from "node:fs";
import path from "node:path";
import { Collection, Events, InteractionType, MessageComponentInteraction } from "discord.js";
import client from "./client.js";
import { fileURLToPath, pathToFileURL } from "node:url";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));

if (client) {
    const interactions = new Collection();
    const foldersPath = path.join(DIRNAME, "interactions");
    const commandFolders = fs.readdirSync(foldersPath);

    console.log("[interactions] loading interactions");

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js") || file.endsWith(".ts"));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const { default: command } = await import(pathToFileURL(filePath));
            // Set a new item in the Collection with the key as the command name and the value as the exported module
            if ("execute" in command) {
                const commandName = command?.data?.name || [folder, (path.basename(filePath).replace(/\.(js|ts)$/, ""))].join("_");
                console.log("~/", commandName);

                interactions.set(commandName, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }

    async function respond(interaction: MessageComponentInteraction, response: string, isError = false) {
        if (isError) {
            response = `<:danger_exclamation_circle:1322072455346655334> ${response}`;
        } else {
            response = `<:success_check_circle:1322072439718416466> ${response}`;
        }
        if (!response.trim().endsWith(".")) response += ".";

        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: response,
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: response,
                    ephemeral: true
                });
            }
        } catch (e) {
            console.error("Error sending follow up/reply to interaction", e);
        }
    }

    client.on(Events.InteractionCreate, async (interaction) => {
        // console.dir(interaction, { depth: null });

        if (interaction.type !== InteractionType.MessageComponent) return;
        const [id, ...args] = interaction.customId.split("/");
        const command = interactions.get(id);


        if (!command) {
            if (id) console.error(`No interaction matching ID ${id} was found.`, { id, args });
            return await respond(interaction, "Unknown command", true);
        }

        try {
            const response = await command.execute(interaction, args);
            // console.log("Interaction execute response", response, response.error);
            if (response?.error) {
                throw response.error;
            } else if (response) {
                await respond(interaction, response);
            }
            // console.log({ replied: interaction.replied, deferred: interaction.deferred });
        } catch (error: any) {
            console.error(error);
            const errorMessage = typeof error === "string" ? error : (error.errorMessage || error.message);
            await respond(interaction, errorMessage, true);
        }
    });
} else {
    console.warn("Discord interactions will not be set up because no Discord key is set.");
}

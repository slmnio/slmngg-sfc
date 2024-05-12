import fs from "node:fs";
import path from "node:path";
import { Collection, Events } from "discord.js";
import client from "./client.js";
import { pathToFileURL } from "node:url";

client.commands = new Collection();
const foldersPath = path.join(import.meta.dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

console.log("[slash] loading slash commands");
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const { default: command } = await import(pathToFileURL(filePath));
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ("data" in command && "execute" in command) {
            console.log(" /", command.data.name);
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

client.on(Events.InteractionCreate, async (interaction) => {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        if (interaction.commandName) console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: `There was an error while executing this command: \n> ${error.errorMessage}`,
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: `There was an error while executing this command: \n> ${error.errorMessage}`,
                    ephemeral: true
                });
            }
        } catch (e) {
            console.error("Error sending follow up/reply to Discord slash command", e);
        }
    }
});

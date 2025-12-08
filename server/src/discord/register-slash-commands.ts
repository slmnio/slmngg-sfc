import "dotenv/config";
import { REST, Routes, SlashCommandBuilder } from "discord.js";
import fs from "node:fs";
import path from "node:path";

import { fileURLToPath, pathToFileURL } from "node:url";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));
if (!(process.env.DISCORD_TOKEN) || !(process.env.DISCORD_CLIENT_ID)) throw new Error("No discord token in .env");

interface SLMNggDiscordCommand {
    data: SlashCommandBuilder
}

const commands: SLMNggDiscordCommand[] = [];
// Grab all the command files from the commands directory you created earlier
const foldersPath = path.join(DIRNAME, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    // Grab all the command files from the commands directory you created earlier
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js") || file.endsWith(".ts"));
    // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
    for (const file of commandFiles) {
        const filePath = pathToFileURL(path.join(commandsPath, file)).toString();
        const command = (await import(filePath))?.default;
        if ("data" in command && "execute" in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// and deploy your commands!
const registerCommands = (async () => {
    if (!(process.env.DISCORD_TOKEN) || !(process.env.DISCORD_CLIENT_ID)) throw new Error("No discord token in .env");
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
            {body: commands},
        ) as any[];

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
});

registerCommands().finally(() => {
    console.log("Command registration complete");
    process.exit();
});

import { Client, Intents, Permissions } from "discord.js";

let client = null;

if (process.env.DISCORD_TOKEN) {
    client = new Client({
        intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
        partials: ["MESSAGE", "REACTION"]
    });
    client.login(process.env.DISCORD_TOKEN);
    client.once("ready", () => console.log(`[discord] Logged in as ${client.user.tag}`));
}

export default client;

import { Client, GatewayIntentBits, Partials } from "discord.js";


/** @type {Client} */
let client;

if (process.env.DISCORD_TOKEN) {
    client = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildPresences],
        partials: [Partials.Message, Partials.Reaction]
    });
    client.login(process.env.DISCORD_TOKEN);
    client.once("clientReady", () => console.log(`[discord] Logged in as ${client.user.tag}`));
}

export default client;

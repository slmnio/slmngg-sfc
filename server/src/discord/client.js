const {Client, GatewayIntentBits, Partials} = require("discord.js");


/* @type {Client} */
let client;

if (process.env.DISCORD_TOKEN) {
    client = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
        partials: [Partials.Message, Partials.Reaction]
    });
    client.login(process.env.DISCORD_TOKEN);
    client.once("ready", () => console.log(`[discord] Logged in as ${client.user.tag}`));
}

module.exports = client;

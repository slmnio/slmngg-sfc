const client = require("./client.js");

async function getChannel() {
    if (!process.env.SLMNGG_LOGS_GUILD_ID) return null;
    if (!process.env.SLMNGG_LOGS_CHANNEL_ID) return null;


    const guild = await client.guilds.fetch(process.env.SLMNGG_LOGS_GUILD_ID);
    if (!guild) return console.error("No guild found whilst trying to log.");
    const channel = await guild.channels.fetch(process.env.SLMNGG_LOGS_CHANNEL_ID);
    if (!channel) return console.error("No channel found whilst trying to log.");

    return channel;
}

async function log(text) {
    console.log("[Log]", text);
    if (!client) return;
    let channel = await getChannel();
    if (!channel) return;
    return channel.send(text);
}

module.exports = {
    log
};

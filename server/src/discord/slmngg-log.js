const client = require("./client.js");
const EventEmitter = require("node:events");

async function getChannel() {
    if (!process.env.SLMNGG_LOGS_GUILD_ID) return null;
    if (!process.env.SLMNGG_LOGS_CHANNEL_ID) return null;


    const guild = await client.guilds.fetch(process.env.SLMNGG_LOGS_GUILD_ID);
    if (!guild) return console.error("No guild found whilst trying to log.");
    const channel = await guild.channels.fetch(process.env.SLMNGG_LOGS_CHANNEL_ID);
    if (!channel) return console.error("No channel found whilst trying to log.");

    return channel;
}
async function getVerboseChannel() {
    const GUILD_ID = process.env.SLMNGG_LOGS_GUILD_ID || process.env.SLMNGG_LOGS_GUILD_ID;
    if (!(GUILD_ID)) return null;
    if (!process.env.SLMNGG_LOGS_VERBOSE_CHANNEL_ID) return null;


    const guild = await client.guilds.fetch(GUILD_ID);
    if (!guild) return console.error("No guild found whilst trying to log.");
    const channel = await guild.channels.fetch(process.env.SLMNGG_LOGS_VERBOSE_CHANNEL_ID);
    if (!channel) return console.error("No channel found whilst trying to log.");

    return channel;
}

async function log(text) {
    if (process.env.IS_SLMNGG_MAIN_SERVER) {
        text = "[Main] " + text;
    }
    console.log("[Log]", text);
    if (!client) return;
    let channel = await getChannel();
    if (!channel) return;
    try {
        return channel.send(text);
    } catch (e) {
        console.error("[Log:failed]", e);
    }
}


const verboseEmitter = new EventEmitter();

verboseEmitter.on("log", async ({ text, json }) => {
    const composedText = `${text}\n\`\`\`json\n${JSON.stringify(json,null,2).slice(0, 1500)}\`\`\``;
    if (process.env.IS_SLMNGG_MAIN_SERVER) {
        text = "[Main] " + composedText;
    }
    console.log("[Verbose Log]", text, json);
    if (!client) return;
    let channel = await getVerboseChannel();
    if (!channel) return;
    try {
        return channel.send(composedText);
    } catch (e) {
        console.error("[Log:failed]", e);
    }

});

function verboseLog(text, json) {
    verboseEmitter.emit("log", {
        text,
        json
    });
}

module.exports = {
    log, verboseLog
};

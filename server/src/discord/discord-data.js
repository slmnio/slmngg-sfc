const client = require("./client");
const Cache = require("../cache");

async function updateGuilds() {
    return Cache.set("discord-guilds", {
        guilds: client.guilds.cache.map((g) => ({
            name: g.name,
            id: g.id
        })),
        __tableName: "DiscordGuilds"
    });
}

if (client && Cache) {
    client.on("ready", () => updateGuilds());
    client.on("guildCreate", () => updateGuilds());
    client.on("guildDelete", () => updateGuilds());
}

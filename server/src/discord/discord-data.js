import client from "./client.js";
import * as Cache from "../cache.js";

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
    client.on("clientReady", () => updateGuilds());
    client.on("guildCreate", () => updateGuilds());
    client.on("guildDelete", () => updateGuilds());
}

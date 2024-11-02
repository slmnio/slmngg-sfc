import { Match } from "../types.js";
import { get } from "./action-cache.js";
import { MapObject } from "../discord/managers.js";
import client from "../discord/client.js";
import { Guild } from "discord.js";
import { cleanID } from "./action-utils.js";


export async function generateMatchReportText(match: Match) {
    try {
        if (!match?.event?.[0]) return null;

        const lines: string[] = [];

        const event = await get(match.event?.[0]);
        let guild: Guild | null;


        let subdomain = "";
        if (event?.subdomain || event?.partial_subdomain) {
            subdomain = (event.subdomain || event.partial_subdomain || "") + ".";
        }
        const matchLink = `https://${subdomain}slmn.gg/match/${cleanID(match.id)}`;

        if (event.discord_control) {
            const eventDiscord = new MapObject(event.discord_control);
            if (eventDiscord.get("guild_id")) {
                const testGuild = await client.guilds.fetch(eventDiscord.get("guild_id"));
                if (testGuild?.available) {
                    guild = testGuild;
                }
            }
        }

        const teams = await Promise.all((match?.teams || []).map(id => get(id)));
        if (teams.length !== 2) {
            console.warn("Can't generate a report without 2 teams", match.id);
            return null;
        }
        const teamEmoji = await Promise.all(teams.map(async team => {
            if (guild && team.discord_control) {
                const teamDiscord = new MapObject(team.discord_control);
                if (teamDiscord.get("emoji_id")) {
                    const emoji = await guild.emojis.fetch(teamDiscord.get("emoji_id"));
                    if (emoji?.id) {
                        return (`<:${emoji.name}:${emoji.id}>`);
                    }
                }
            }
            return null;
        }));

        const maps = await Promise.all((match?.maps || []).map(async id => {
            const matchMap = await get(id);
            let gameMap;
            if (matchMap.map?.[0]) {
                gameMap = await get(matchMap.map[0]);
            }
            return {
                ...matchMap,
                map: gameMap
            };
        }));

        // Team 1 x-x Team 2

        const scores = [match.score_1 || 0, match.score_2 || 0];

        const teamText = teams.map((team, i) => {
            const items: string[] = [];
            const bold = scores[i] > scores[+!i];

            const emoji = teamEmoji[i];
            if (i === 0 && emoji) {
                // first team at start
                items.push(emoji);
            }

            items.push(`${bold ? "**" : ""}${team.name}${bold ? "**" : ""}`);

            if (i === 1 && emoji) {
                // second team at end
                items.push(emoji);
            }

            return items.join(" ");
        });

        lines.push(teamText.join(` ${scores.join("-")} `));
        if (match.forfeit) {
            lines.push("*Match forfeited*");
        }

        for (const map of maps.filter(map => !map.banner)) {
            const i = maps.filter(map => !map.banner).indexOf(map);
            const mapLine : string[] = [];
            mapLine.push(`Map ${i+1}`);
            if (map.map?.name) mapLine.push(map.map.name);

            const mapScores = [map.score_1 || 0, map.score_2 || 0];

            if (mapScores[0] < mapScores[1]) {
                // 1 wins
                mapLine.push([...mapScores].reverse().join("-"));
            } else {
                mapLine.push(mapScores.join("-"));
            }

            if (map.draw) {
                mapLine.push("Draw");
            } else {
                let winner = teams.find(t => cleanID(t.id) === cleanID(map.winner?.[0]));
                if (!winner) {
                    if (mapScores[0] > mapScores[1]) {
                        winner = teams[0];
                    } else if (mapScores[1] > mapScores[0]) {
                        winner = teams[1];
                    }
                }
                if (winner?.name) {
                    mapLine.push(winner.name);
                }
            }

            if (map.replay_code) {
                mapLine.push(map.replay_code);
            }


            lines.push(mapLine.join(" - "));

            if (map.team_1_bans?.length || map.team_2_bans?.length) {
                const teamBans = [];

                for (const teamI of [0, 1]) {
                    const team = teams[teamI];
                    const bannedHeroes = await Promise.all(([map.team_1_bans, map.team_2_bans][teamI] || []).map(id => get(id)));
                    teamBans.push(`${team.code || team.name} ban: ${bannedHeroes.map(hero => hero.icon_emoji_text || hero.name).join(" ")}`);
                }

                lines.push(`> ${teamBans.join(" | ")}`);
            }
        }


        lines.push(`<${matchLink}>`);
        return lines.join("\n");
    } catch (e) {
        console.error("Error generating match report text", e);
        return null;
    }
}

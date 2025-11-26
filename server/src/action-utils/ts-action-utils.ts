import type { Snowflake } from "discord-api-types/globals";
import { Match, MatchMap, Player, PlayerResolvableID, Team, TeamResolvableID } from "../types.js";
import { get } from "./action-cache.js";
import { MapObject } from "../discord/managers.js";
import client from "../discord/client.js";
import { ChannelType, Guild, MessageCreateOptions, MessagePayload } from "discord.js";
import { hammerTime, sendMessage } from "./action-utils.js";
import emoji from "../discord/emoji.js";
import { cleanTypedID } from "shared";


export async function getTeamEmojiText(team: Team | null) {
    if (!team) return null;

    if (!team?.event?.[0]) return null;
    const event = await get(team.event?.[0]);
    let guild: Guild | null = null;

    if (event.discord_control) {
        const eventDiscord = new MapObject(event.discord_control);
        if (eventDiscord.get("guild_id")) {
            const testGuild = await client.guilds.fetch(eventDiscord.get("guild_id"));
            if (testGuild?.available) {
                guild = testGuild;
            }
        }
    }

    if (guild && team.discord_control) {
        const teamDiscord = new MapObject(team.discord_control);
        if (teamDiscord.get("emoji_id")) {
            const emoji = await guild.emojis.fetch(teamDiscord.get("emoji_id"));
            if (emoji?.id) {
                return (`<:${emoji.name}:${emoji.id}> `);
            }
        }
    }
    return null;
}


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
        const matchLink = `https://${subdomain}slmn.gg/match/${cleanTypedID(match.id)}`;

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
                let winner = teams.find(t => map.winner?.[0] && cleanTypedID(t.id) === cleanTypedID(map.winner?.[0]));
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

            if (map.team_1_picks?.length || map.team_2_picks?.length) {
                const teamPicks = [];

                for (const teamI of [0, 1]) {
                    const team = teams[teamI];
                    const bannedHeroes = await Promise.all(([map.team_1_picks, map.team_2_picks][teamI] || []).map(id => get(id)));
                    teamPicks.push(`${team.code || team.name} ban: ${bannedHeroes.map(hero => hero.icon_emoji_text || hero.name).join(" ")}`);
                }

                lines.push(`Picks: ${teamPicks.join(" / ")}`);
            }
            if (map.team_1_bans?.length || map.team_2_bans?.length) {
                const teamBans = [];

                for (const teamI of [0, 1]) {
                    const team = teams[teamI];
                    const bannedHeroes = await Promise.all(([map.team_1_bans, map.team_2_bans][teamI] || []).map(id => get(id)));
                    teamBans.push(`${team.code || team.name} ban: ${bannedHeroes.map(hero => hero.icon_emoji_text || hero.name).join(" ")}`);
                }

                const banCount = (map.team_1_bans?.length || 0) + (map.team_2_bans?.length || 0);
                // if there are only 2 bans and no picks, add to the current line
                if (banCount <= 2 && !map.team_1_picks?.length && !map.team_2_picks?.length) {
                    lines[lines.length - 1] += ` - Bans: ${teamBans.join(" / ")}`;
                } else {
                    lines.push(`Bans: ${teamBans.join(" / ")}`);
                }

            }

        }


        lines.push(`<${matchLink}>`);
        return lines.join("\n");
    } catch (e) {
        console.error("Error generating match report text", e);
        return null;
    }
}

export async function checkDeleteMessage<KeyType extends string>(mapObject: MapObject, keyPrefix: KeyType) {
    if (mapObject.get(`${keyPrefix}_message_id`) && mapObject.get(`${keyPrefix}_channel_id`)) {
        try {
            const channel = await client.channels.fetch(mapObject.get(`${keyPrefix}_channel_id`));
            if (channel) {
                console.log(`${keyPrefix} - ${channel.id} ${channel.type !== ChannelType.DM ? channel.name : ""}`);
            } else {
                console.warn(`${keyPrefix} - No channel`);
            }
            if (channel?.isSendable()) await channel.messages.delete(mapObject.get(`${keyPrefix}_message_id`));
        } catch (e) {
            console.error(`Error trying to delete ${keyPrefix} message`, e);
        } finally {
            mapObject.push(`${keyPrefix}_message_id`, null);
            mapObject.push(`${keyPrefix}_channel_id`, null);
        }
    }
}

export async function looseDeleteRecordedMessage<KeyType extends string>(mapObject: MapObject, keyPrefix: KeyType) {
    console.log("Loose delete", mapObject.data, keyPrefix);
    await checkDeleteMessage(mapObject, keyPrefix);
    return mapObject;
}
export async function looseDeleteRecordedMessages<KeyType extends string>(mapObject: MapObject, keyPrefixes: KeyType[]) {
    console.log("Loose delete multiple", mapObject.data, keyPrefixes);
    if (!mapObject?.data) return mapObject;
    console.log(mapObject.data);
    await Promise.all(keyPrefixes.map(async keyPrefix => checkDeleteMessage(mapObject, keyPrefix)));
    return mapObject;
}

export async function sendRecordedMessage<KeyType extends string>({ key, mapObject, channelID, content, success } :
    {
        key: KeyType;
        mapObject: MapObject;
        channelID?: Snowflake;
        content?: null | string | MessagePayload | MessageCreateOptions;
        success?: (updatedMapObject: MapObject) => void;
    }
): Promise<MapObject> {
    console.log("Recorded message", key, mapObject.data);
    return sendMessage({ key, mapObject, channelID, content, success });
}

type StepTypeImport = {
    date: `${number}`;
    time: Date;
    key: string;
    text: string;

    user?: PlayerResolvableID;
    team?: TeamResolvableID;
    staff?: boolean;
}
type StepType = {
    date: `${number}`;
    time: Date;
    key: string;
    text: string;

    user?: Player;
    team?: Team;
    staff?: boolean;
}

export async function parseMatchLog(log: string) {

    const steps = log.split("\n").map(step => Object.fromEntries(step.split("|").map(pair => pair.split("=")))) as StepTypeImport[];

    for (const step of steps) {
        step.time = new Date(parseInt(step.date));
        if (step.user) step.user = await get(step.user as string);
        if (step.team) step.team = await get(step.team as string);
        if (step.staff) step.staff = true;
    }
    return steps as StepType[];
}


export async function readableMatchLog(log: string) {
    const steps = await parseMatchLog(log);

    const emojiKeyMap : {[key: StepType["key"]]: string} = {
        "approved_by_opponent": emoji.transparent.check,
        "staff_preapproved": emoji.transparent.check,
        "staff_approved": emoji.transparent.check,
        "staff_force_approved": emoji.transparent.shield_check,
        "staff_force_approved_counter": emoji.transparent.shield_check,
        "approved_counter_report": emoji.transparent.check,

        "deleted": emoji.circle.danger_times,
        "staff_deleted": emoji.circle.danger_times,

        "denied_by_opponent": emoji.transparent.times,
        "staff_denied": emoji.transparent.times,

        "submitted_request": emoji.transparent.check,
        "submitted_score_report": emoji.transparent.check,
        "countered_score_report": emoji.transparent.exchange,
    };
    const userTypeMap : {[key: StepType["key"]]: string} = {
        "approved_by_opponent": "Opponent",
        "staff_preapproved": "Staff",
        "staff_approved": "Staff",
        "staff_force_approved": "Staff",
        "staff_force_approved_counter": "Staff",
        "approved_counter_report": "Team",

        "deleted": "Team",
        "staff_deleted": "Staff",

        "denied_by_opponent": "Opponent",
        "staff_denied": "Staff",

        "submitted_request": "Team",
        "submitted_score_report": "Team",
        "countered_score_report": "Opponent",
    };

    return steps.map(step => {
        return [
            hammerTime(parseInt(step.date), "f"),
            emojiKeyMap[step.key] || emoji.blank,
            step.user?.name ? `**[${step.user.name}](<https://slmn.gg/player/${step.user.id}>)**` : userTypeMap[step.key] || "",
            step.text.slice(0,1).toLowerCase() + step.text.slice(1),
            step?.team?.name ? `as **[${step.team.name}](<https://slmn.gg/team/${step.team.id}>)**` :
                (step?.staff ? "as staff" : ""),
        ].filter(Boolean).join(" ");
    }).join("\n");
}

type MapPickBanType = "pick" | "ban" | "protect";
type MapPickBanTeamNumber = 1 | 2
type MapPickBanOrderItem = `${MapPickBanType}${MapPickBanTeamNumber}`

export function processPickBanOrder(order: Match["pick_ban_order"], flip: MatchMap["flip_pick_ban_order"]) {
    if (!order) return null;
    // const counts: { [key: MapPickBanType]: { [key: MapPickBanTeamNumber]: number } } = {};

    const counts: { [key: string]: { [key: number]: number } } = {};
    return order.split(",").map((text, i) => {
        const item = {
            type: (text.startsWith("pick") ? "pick" : (text.startsWith("ban") ? "ban" : (text.startsWith("protect") ? "protect" : null))),
            team: (text.endsWith("1") ? (flip ? 2 : 1) : (text.endsWith("2") ? (flip ? 1 : 2) : null)),
            num: i + 1,
            countOfTeamType: 0,
            countOfType: 0
        };

        if (item.type && item.team) {
            if (!counts?.[item.type]) {
                counts[item.type] = {};
            }
            if (!counts?.[item.type]?.[item.team]) {
                counts[item.type][item.team] = 0;
            }
            counts[item.type][item.team]++;
            item.countOfTeamType = counts[item.type][item.team];
            item.countOfType = Object.values(counts[item.type]).reduce((a, b) => a + b, 0);
        }
        return item;
    });

}

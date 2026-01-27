import Airtable from "airtable";
import * as Cache from "../cache.js";
import { StaticAuthProvider } from "@twurple/auth";
import { ApiClient } from "@twurple/api";
import { verboseLog } from "../discord/slmngg-log.js";
import { get } from "./action-cache.js";
import client from "../discord/client.js";
import { cleanID, deAirtable } from "shared";

const airtable = new Airtable({ apiKey: process.env.AIRTABLE_KEY });
const slmngg = airtable.base(process.env.AIRTABLE_APP);

export async function getSelfClient(Cache, token) {
    let userData = await Cache.auth.getData(token);
    if (!userData) return null;
    let clientID = userData?.user?.airtable?.clients?.[0];
    return await Cache.get(clientID);
}

const TimeOffset = 3 * 1000;

/**
 * @param {Cache} Cache - Cache object
 * @param {string} tableName - Airtable table name this record belongs to
 * @param {object} item - Full item as requested from Cache
 * @param {AnyAirtableID} item.id - Item must have its Airtable ID
 * @param {*} data - Data to update (can be partial)
 * @param {string?} source - Action or source
 */
export async function updateRecord(Cache, tableName, item, data, source = undefined) {
    // see: airtable-interface.js customUpdater
    console.log(`[update record] ${source ? `{${source}} ` : ""}updating table=${tableName} id=${item.id}`, data);

    let slmnggData = {
        __tableName: tableName,
        ...deAirtable({ ...item, ...data }),
        modified: (new Date((new Date()).getTime() + TimeOffset)).toString()
    };
    verboseLog(`Editing record on **${tableName}** \`${item.id}\`${source ? ` {${source}}` : ""}`, data);
    // Eager update
    Cache.set(cleanID(item.id), slmnggData, { eager: true, source });

    // Update custom keys
    if (tableName === "Broadcasts" && item.key) Cache.set(`broadcast-${item.key}`, { ...slmnggData, customKey: true }, { eager: true });
    if (tableName === "Clients" && item.key) Cache.set(`client-${item.key?.toLowerCase()}`, { ...slmnggData, customKey: true }, { eager: true });
    if (tableName === "Events" && item.subdomain) Cache.set(`subdomain-${item.subdomain}`, { ...slmnggData, customKey: true }, { eager: true });
    if (tableName === "News" && item.slug) Cache.set(`news-${item.slug}`, { ...slmnggData, customKey: true }, { eager: true });

    try {
        return await slmngg(tableName).update(item.id, data);
    } catch (e) {
        console.error("Airtable update failed", e);
        verboseLog(`Error updating record on **${tableName}** \`${item.id}\``, e.message);
        return { error: true, errorMessage: e.message };
    }
}

/**
 * @param {Cache} Cache
 * @param {string} tableName
 * @param {object[]} records
 * @param {string | null} source
 */
export async function createRecord(Cache, tableName, records, source = null) {
    console.log(`[create record] ${source ? `{${source}} ` : ""}creating table=${tableName} records=${records.length}`);
    try {
        let newRecords = await slmngg(tableName).create(records.map(recordData => {
            verboseLog(`Creating record on **${tableName}**${source ? ` {${source}}` : ""}`, recordData);
            return {
                fields: recordData
            };
        }));
        newRecords.forEach(record => {
            Cache.set(cleanID(record.id), {
                ...deAirtable(record.fields),
                id: record.id,
                __tableName: tableName
            }, { eager: true });
        });
        return newRecords;
    } catch (e) {
        console.error("Airtable create failed", e);
        verboseLog(`Error creating record on **${tableName}** `, e.message);
        return { error: true, errorMessage: e.message };
    }
}

export async function getValidHeroes() {
    // Get Heroes table
    // Get any OW hero only
    let heroIDs = (await Cache.get("Heroes"))?.ids;
    if (!heroIDs?.length) return [];
    let heroes = await Promise.all(heroIDs.map(async id => await Cache.get(id)));
    return heroes.filter(h => h.game === "Overwatch");
}

export async function getBroadcast(client) {
    if (!client?.broadcast?.[0]) throw "No broadcast associated with this client";
    const broadcast = await Cache.get(client?.broadcast?.[0]);
    if (!broadcast) throw "No broadcast associated";
    return broadcast;
}

export async function getAll(ids) {
    return await Promise.all((ids || []).map(m => Cache.get(m)));
}
export async function getMaps(match) {
    return getAll(match.maps);
}

export async function getTwitchChannel(client, requestedScopes, forceBroadcastID) {
    let broadcast = await (forceBroadcastID ? Cache.get(forceBroadcastID) : getBroadcast(client));
    const channel = await Cache.auth.getChannel(broadcast?.channel?.[0]);
    if (!channel?.twitch_refresh_token) throw "No Twitch auth token associated with channel";
    if (!channel?.channel_id || !channel?.name || !channel.twitch_scopes) throw "Invalid channel data";
    let scopes = channel.twitch_scopes.split(" ");
    if (!requestedScopes.every(scope => scopes.includes(scope))) throw "Token doesn't have the required scopes";

    return {
        broadcast,
        channel,
        scopes
    };
}

export async function getMatchData(broadcast, requireAll) {
    const match = await Cache.get(broadcast?.live_match?.[0]);
    if (!match) throw("No match associated");

    const team1 = await Cache.get(match?.teams?.[0]);
    const team2 = await Cache.get(match?.teams?.[1]);
    if (requireAll && (!team1 || !team2)) throw("Did not find two teams!");

    return {
        match,
        team1,
        team2
    };
}

/**
 *
 * @param matchID
 * @returns {Promise<({report: Report | undefined, match: Match})>}
 */
export async function getMatchScoreReporting(matchID) {
    /** @type {Match} */
    const match = await get(matchID);
    let report;

    if (!match?.id) throw "Couldn't load match data";

    if (!match?.event?.[0]) throw "Couldn't load event data for this match";
    const event = await get(match?.event?.[0]);
    if (!event?.id) throw "Couldn't load event data for this match";

    // event score reporting must be active

    if (!event?.blocks) throw "Event doesn't have score reporting set up";

    /** @type {EventSettings} */
    const eventSettings = JSON.parse(event.blocks);
    if (!eventSettings?.reporting?.score?.use) throw "Score reporting is not enabled on this match";

    // check existing report
    if ((match?.reports || []).length) {
        const reports = await Promise.all((match?.reports || []).map(rID => get(rID)));
        const firstReport = reports.find(r => r.type === "Scores");
        if (firstReport?.id) {
            report = firstReport;
        }
    }

    return { match, report };
}
/**
 *
 * @param matchID
 * @param { {excludeCompleted: Boolean } } settings
 * @returns {Promise<({report: Report | undefined, match: Match})>}
 */
export async function getMatchRescheduling(matchID, { excludeCompleted } = {}) {
    const match = await get(matchID);
    let report;

    if (!match?.id) throw "Couldn't load match data";

    if (!match?.event?.[0]) throw "Couldn't load event data for this match";
    const event = await get(match?.event?.[0]);
    if (!event?.id) throw "Couldn't load event data for this match";

    // event score reporting must be active

    if (!event?.blocks) throw "Event doesn't have rescheduling set up";

    /** @type {EventSettings} */
    const eventSettings = JSON.parse(event.blocks);
    if (!eventSettings?.reporting?.rescheduling?.use) throw "Rescheduling is not enabled on this event";
    if (!(match?.earliest_start || match?.latest_start)) throw "Rescheduling is not set up on this match";

    // check existing report
    if (match?.reports?.length) {
        const reports = await Promise.all((match?.reports || []).map(rID => get(rID)));
        const firstReport = reports.find(r => r.type === "Rescheduling" && (excludeCompleted ? !r.approved : true));
        if (firstReport?.id) {
            report = firstReport;
        }
    }

    return { match, report };
}

export async function getTwitchAPIClient(channel) {
    if (!channel) throw("Internal error connecting to Twitch");
    try {
        const accessToken = await Cache.auth.getTwitchAccessToken(channel);
        // this warning is because the twitch auth data is thrown into the general auth map but it shouldn't actually cause an error here
        const authProvider = new StaticAuthProvider(process.env.TWITCH_CLIENT_ID, accessToken);
        return new ApiClient({authProvider});
    } catch (e) {
        console.error(getTwitchAPIError(e), e);
        throw { errorCode: 500, errorMessage: `Twitch error: ${getTwitchAPIError(e)}` };
    }
}

export function getTwitchAPIError(error) {
    let libError = (error?.message || "").split("\n").shift() || null;
    try {
        if (!error?.body) return libError || null;
        let message = JSON.parse(error?._body)?.message;
        return message || libError;
    } catch (e) {
        console.warn("Error decoding Twitch API error", e);
        return libError || null;
    }
}

export function safeInput(string) {
    return string
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
export function safeInputNoQuotes(string) {
    return string
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

/**
 *
 * @param {Player?} player
 * @param {Team?} team
 * @param {Guild} guild
 * @returns {Promise<{member: GuildMember, fixes: *[]}>}
 */
export async function findMember(player, team, guild) {
    let member;
    let fixes = [];
    if (player.discord_id) {
        try {
            member = await guild.members.fetch(player.discord_id);
            if (!member) {
                fixes.push({
                    type: "discord_id_not_found",
                    playerID: player.id,
                    discordID: player.discord_id,
                    teamID: team?.id
                });
                console.warn(fixes[fixes.length - 1]);
            }
        } catch (e) {
            console.error(e?.rawError);
            fixes.push({
                type: "discord_id_not_found",
                playerID: player.id,
                discordID: player.discord_id,
                teamID: team?.id
            });
            console.warn(fixes[fixes.length - 1]);
        }
    }

    if (!member && player.discord_tag) {
        const tag = player.discord_tag.replace("@", "").trim();
        [member] = (await guild.members.fetch({
            query: tag,
            limit: 1,
        })).values();

        console.log({
            type: "player_search_results",
            discordID: member?.id,
            discordTag: member?.user?.username,
            tag: player.discord_tag
        });
    }

    if (!member) {
        fixes.push({
            type: "player_discord_not_found",
            playerID: player.id,
            discordID: player.discord_id,
            discordTag: player.discord_tag,
            teamID: team?.id
        });
        console.warn(fixes[fixes.length - 1]);
    }
    return { member, fixes };
}

export async function checkDeleteMessage(mapObject, keyPrefix) {
    if (mapObject.get(`${keyPrefix}_message_id`) && mapObject.get(`${keyPrefix}_channel_id`)) {
        try {
            const channel = await client.channels.fetch(mapObject.get(`${keyPrefix}_channel_id`));
            if (channel?.isSendable()) await channel.messages.delete(mapObject.get(`${keyPrefix}_message_id`));
        } catch (e) {
            console.error(`Error trying to delete ${keyPrefix} message`, e);
        } finally {
            mapObject.push(`${keyPrefix}_message_id`, null);
            mapObject.push(`${keyPrefix}_channel_id`, null);
        }
    }
}

/**
 * @param {object} options
 * @param {string} options.key
 * @param {MapObject} options.mapObject
 * @param {(Snowflake | null)=} options.channelID
 * @param {(string | null | object)=} options.content
 * @param {Function=} options.success
 * @returns {Promise<MapObject>}
 * @deprecated Use keyed sendRecordedMessage instead
 */
export async function sendMessage({
    key,
    mapObject,
    channelID,
    content,
    success,
}) {
    if (!channelID) {
        console.warn(`Can't send ${key} message without a channel`);
        return mapObject;
    }
    if (!content) {
        console.warn(`Can't send ${key} message without content`);
        return mapObject;
    }
    const channel = await client.channels.fetch(channelID);
    if (channel?.isSendable()) {
        try {
            const message = await channel.send(content);
            mapObject.push(`${key}_channel_id`, channel.id);
            mapObject.push(`${key}_message_id`, message.id);
            if (success) await success(mapObject);
        } catch (e) {
            console.error(`Sending error ${key}`, e);
            console.dir(e?.rawError?.errors, { depth: null, colors: true });
        }
    }
    return mapObject;
}

/**
 *
 * @param {number | string | Date} timeString
 * @param {"d"|"D"|"t"|"T"|"f"|"F"|"R"} format
 * @returns {string}
 */
export function hammerTime(timeString, format = "F") {
    let start = new Date(timeString).getTime();
    return `<t:${Math.floor(start / 1000)}:${format}>`;
}

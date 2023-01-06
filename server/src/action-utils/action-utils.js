const Airtable = require("airtable");
const Cache = require("../cache");
const { StaticAuthProvider } = require("@twurple/auth");
const { ApiClient } = require("@twurple/api");
const airtable = new Airtable({ apiKey: process.env.AIRTABLE_KEY });
const slmngg = airtable.base(process.env.AIRTABLE_APP);

async function getSelfClient(Cache, token) {
    let userData = await Cache.auth.getData(token);
    if (!userData) return null;
    let clientID = userData?.user?.airtable?.clients?.[0];
    return await Cache.get(clientID);
}

/**
 *
 * @param {AnyAirtableID|null} id
 * @returns {CleanAirtableID|null}
 */
function cleanID(id) {
    if (!id) return null;
    if (id?.id) return id.id;
    if (typeof id !== "string") return null;
    if (id.startsWith("rec") && id.length === 17) id = id.slice(3);
    return id;
}

/**
 * @param {AnyAirtableID} id
 * @returns {DirtyAirtableID}
 */
function dirtyID(id) {
    // add rec
    if (!id) return id;
    if (id.length === 14) return "rec" + id;
    return id;
}

const TimeOffset = 3 * 1000;

/**
 * @param {Cache} Cache - Cache object
 * @param {string} tableName - Airtable table name this record belongs to
 * @param {object} item - Full item as requested from Cache
 * @param {AnyAirtableID} item.id - Item must have its Airtable ID
 * @param {*?} item.* -  Item can have any other data
 * @param {*} data - Data to update (can be partial)
 */
async function updateRecord(Cache, tableName, item, data) {
    // see: airtable-interface.js customUpdater
    console.log(`[update record] updating table=${tableName} id=${item.id}`, data);

    let slmnggData = {
        ...deAirtable({ ...item, ...data }),
        modified: (new Date((new Date()).getTime() + TimeOffset)).toString()
    };
    // Eager update
    Cache.set(cleanID(item.id), slmnggData, { eager: true });

    // Update custom keys
    if (tableName === "Broadcasts" && item.key) Cache.set(`broadcast-${item.key}`, slmnggData, { eager: true });
    if (tableName === "Clients" && item.key) Cache.set(`client-${item.key}`, slmnggData, { eager: true });
    if (tableName === "Events" && item.subdomain) Cache.set(`subdomain-${item.subdomain}`, slmnggData, { eager: true });
    if (tableName === "News" && item.slug) Cache.set(`news-${item.slug}`, slmnggData, { eager: true });

    try {
        return await slmngg(tableName).update(item.id, data);
    } catch (e) {
        console.error("Airtable update failed", e);
        return { error: true };
    }
}

/**
 * @param {Cache} Cache
 * @param {string} tableName
 * @param {object[]} records
 * @returns {Promise}
 */
async function createRecord(Cache, tableName, records) {
    console.log(`[create record] creating table=${tableName} records=${records.length}`);

    // TODO: think about how eager update would work

    try {
        let newRecords = await slmngg(tableName).create(records.map(recordData => ({ fields: recordData })));
        newRecords.forEach(record => {
            Cache.set(cleanID(record.id), deAirtable(record.fields), { eager: true });
        });
        // console.log(newRecords.length);
        // console.log(newRecords);
        return newRecords;
    } catch (e) {
        console.error("Airtable create failed", e);
        return { error: true, errorMessage: e.message };
    }
}

function deAirtable(obj) {
    const data = {};
    Object.entries(obj).forEach(([key, val]) => {
        data[key.replace(/ +/g, "_").replace(/[:()]/g, "_").replace(/_+/g,"_").toLowerCase()] = val;
    });
    Object.entries(data).forEach(([key, val]) => {
        if (typeof val === "object" && val?.length === 0) {
            console.log("[Action deAirtable] Skipping", key, val);
            delete data[key];
        }
    });
    data.id = obj.id;
    return data;
}

async function getValidHeroes() {
    // Get Heroes table
    // Get any OW hero only
    let heroIDs = (await Cache.get("Heroes"))?.ids;
    if (!heroIDs?.length) return [];
    let heroes = await Promise.all(heroIDs.map(async id => await Cache.get(id)));
    return heroes.filter(h => h.game === "Overwatch");
}

async function getBroadcast(client) {
    if (!client?.broadcast?.[0]) throw "No broadcast associated with this client";
    const broadcast = await Cache.get(client?.broadcast?.[0]);
    if (!broadcast) throw "No broadcast associated";
    return broadcast;
}

async function getAll(ids) {
    return await Promise.all((ids || []).map(m => Cache.get(m)));
}
async function getMaps(match) {
    return getAll(match.maps);
}

async function getTwitchChannel(client, requestedScopes) {
    let broadcast = await getBroadcast(client);
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

async function getMatchData(broadcast, requireAll) {
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

async function getTwitchAPIClient(channel) {
    if (!channel) throw("Internal error connecting to Twitch");
    const accessToken = await Cache.auth.getTwitchAccessToken(channel);
    const authProvider = new StaticAuthProvider(process.env.TWITCH_CLIENT_ID, accessToken);
    return new ApiClient({authProvider});
}

function getTwitchAPIError(error) {
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


module.exports = {
    getSelfClient, cleanID, dirtyID, deAirtable, updateRecord, getValidHeroes, createRecord,
    getTwitchChannel, getMatchData, getTwitchAPIClient, getTwitchAPIError, getBroadcast, getMaps, getAll
};

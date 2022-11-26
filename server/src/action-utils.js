const Airtable = require("airtable");
const Cache = require("./cache");
const { StaticAuthProvider } = require("@twurple/auth");
const { ApiClient } = require("@twurple/api");
const { get, auth } = require("./cache");
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

async function updateRecord(Cache, tableName, item, data) {
    // see: airtable-interface.js customUpdater
    console.log(`[update record] updating table=${tableName} id=${item.id}`, data);

    let slmnggData = {
        ...deAirtable({ ...item, ...data }),
        modified: new Date().toString()
    };
    // Eager update
    Cache.set(cleanID(item.id), slmnggData, { eager: true });

    // Update custom keys
    if (tableName === "Broadcasts" && item.key) Cache.set(`broadcast-${item.key}`, slmnggData, { eager: true });
    if (tableName === "Clients" && item.key) Cache.set(`client-${item.key}`, slmnggData, { eager: true });
    if (tableName === "Events" && item.subdomain) Cache.set(`subdomain-${item.subdomain}`, slmnggData, { eager: true });
    if (tableName === "News" && item.slug) Cache.set(`news-${item.slug}`, slmnggData, { eager: true });

    try {
        await slmngg(tableName).update(item.id, data);
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
        console.log(newRecords.length);
        console.log(newRecords);
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

async function getTwitchChannel(client, requestedScopes, { success, error }) {
    const broadcast = await get(client?.broadcast?.[0]);
    if (!broadcast) return error("No broadcast associated");
    if (!broadcast.channel) return error("No channel associated with broadcast");

    const channel = await auth.getChannel(broadcast?.channel?.[0]);
    if (!channel.twitch_refresh_token) return error("No twitch auth token associated with channel");
    if (!channel.channel_id || !channel.name || !channel.twitch_scopes) return error("Invalid channel data");
    let scopes = channel.twitch_scopes.split(" ");
    if (!requestedScopes.every(scope => scopes.includes(scope))) return error("Token doesn't have the required scopes");
    return {
        broadcast,
        channel,
        scopes
    };
}

async function getMatchData(broadcast, requireAll, { success, error }) {
    const match = await get(broadcast?.live_match?.[0]);
    if (!match) return error("No match associated");

    const team1 = await get(match?.teams?.[0]);
    const team2 = await get(match?.teams?.[1]);
    if (requireAll && (!team1 || !team2)) return error("Did not find two teams!");

    return {
        match,
        team1,
        team2
    };
}

async function getTwitchAPIClient(channel) {
    const accessToken = await auth.getTwitchAccessToken(channel);
    const authProvider = new StaticAuthProvider(process.env.TWITCH_CLIENT_ID, accessToken);
    return new ApiClient({authProvider});
}


module.exports = {
    getSelfClient, dirtyID, deAirtable, updateRecord, getValidHeroes, createRecord, getTwitchChannel, getMatchData, getTwitchAPIClient
};

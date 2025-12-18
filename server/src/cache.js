import crypto from "node:crypto";
import { accessTokenIsExpired, refreshUserToken } from "@twurple/auth";
import { EventEmitter } from "events";
import { cleanID } from "shared";

/*
    - Get and set data
    - Store data
    - Check for changes and export that
 */

const store = new Map();
const hiddenEvents = new Map();

/***
 @type {Map<string, AuthUserData>}
 */
const authMap = new Map();
const players = new Map();
const attachments = new Map();

const emitter = new EventEmitter();
export const cacheStatusEmitter = new EventEmitter();

/**
 * @returns {Set<AnyAirtableID>}
 */
function getAntiLeakIDs() {
    if (process.env.DISABLE_ANTILEAK === "true") return null; // don't hide anything on local
    let ids = new Set();
    hiddenEvents.forEach((val) => {
        if (val?.length) val.forEach(id => ids.add(id));
    });
    return ids;
}

// TODO: Add a file manager (save to file, read to file)
// TODO: Add a save to file export so other scripts can call it (ie after a table has been synced)

/***
 *
 * @type {Server}
 */
let io = null;

export function setup(_io) {
    io = _io;
    return this;
}

async function broadcast(room, command, ...data) {
    io.to(room).emit(command, ...data);
}

// let updateFunctions = [];
/**
 *
 * @param {function(id: AnyAirtableID, data: {oldData: object, newData: object}, options: { custom?: boolean, source?: string})} callback
 */
export function onUpdate(callback) {
    emitter.on("update", callback);
    // updateFunctions.push(fn);
}

const updateFunction = function(id, data, options) {
    emitter.emit("update", id, data, options);
    // updateFunctions.forEach(fn => fn(id, data));
};

async function removeAntiLeak(id, data) {
    let antiLeakIDs = getAntiLeakIDs();
    if (!antiLeakIDs) return data;

    if (antiLeakIDs.has(id)) {
        // console.log("antileak", antiLeakIDs, id);
        return null;
    }

    Object.entries(data).forEach(([key, val]) => {
        if (typeof val === "object" && val?.length) {
            data[key] = val.filter(id => !antiLeakIDs.has(cleanID(id)));
            if (data[key].length === 0) delete data[key];
        }
    });

    return data;
}

let recents = {
    triggered: 0,
    sent: 0,
};

(() => {
    let seconds = 60;
    setInterval(() => {
        console.log(`[Cache log] secs=${seconds} triggered=${recents.triggered} sent=${recents.sent}`);
        recents.triggered = 0;
        recents.sent = 0;
    }, seconds * 1000);
})();

async function dataUpdate(id, data, options) {
    // broadcast something here
    if (options?.eager) console.log("Eager update on", id);
    recents.triggered++;
    const dataDifferent = JSON.stringify(({...(store.get(id) || {}), modified: null})) !== JSON.stringify({...(data || {}), modified: null});
    const oldDate = (store.get(id)?.modified);
    if (!dataDifferent && (data.modified !== oldDate)) {
        console.warn(`[cache] Data is the same but modified timestamps are different\n      id=${id} \n     old=${(new Date(oldDate)).toLocaleString()} \n     new=${(new Date(data.modified)).toLocaleString()}`);
    }
    if (dataDifferent) {
        // console.log(`Data update on [${id}]`);
        recents.sent++;
        if (data) data = await removeAntiLeak(id, data);
        // if (options?.eager) console.log("Sending");
        await broadcast(id, "data_update", id, data);
        if (!(options && options.custom)) updateFunction(id, { oldData: store.get(id), newData: data }, options);
    }
}

const longTextMap = {
    "Events": ["about"],
    "News": ["content"],
    "Matches": ["show_notes"],
    "Teams": ["show_notes"],
};

const slmnggAttachments = {
    "Events": ["broadcast_texture"],
    "Players": ["headshot"],
    "Themes": ["default_logo", "default_wordmark", "small_logo", "other_images", "logo_on_dark", "logo_on_light", "logo_on_theme", "wordmark_on_dark", "wordmark_on_light", "wordmark_on_theme"],
    "Broadcasts": ["break_image", "background"],
    "News": ["header", "thumbnail"],
    "Map Data": ["image", "big_image", "video", "audio"],
    "Maps": ["image", "big_image"],
    "Log Files": ["log_file"],
    "Heroes": ["icon", "main_image", "recolor_base", "recolor_layers", "alternate_set_image", "pick_audio", "ban_audio", "video", "background", "wordmark"],
    "Ad Reads": ["audio", "image"],
    "Tracks": ["file"],
    "Teams": ["icon", "images"],
    "GFX": ["image"],
    "Trivia": ["question_content", "reveal_content"]
};

function generateAttachmentURL(str, attachment) {
    let idx = str.indexOf("ts=");
    if (idx !== -1) str = str.slice(0, idx -1);

    let filename = attachment.filename;

    if (filename && !str.split("/").pop().includes(".")) {
        str += `?filename=${encodeURIComponent(filename.replaceAll("(", "%28").replaceAll(")", "%29"))}&id=${attachment.id}`;
    }
    return str;
}

/**
 * Generate a filename from its mimetype and record ID
 */
function getAutoFilename(attachment) {
    let ending = (attachment.type || "").split("/").pop();

    // specific overrides where the "group/[type]" doesn't match the extension
    if (attachment.type === "audio/mpeg") ending = "mp3";
    if (attachment.type === "text/plain") ending = "txt";
    if (attachment.type === "image/svg+xml") ending = "svg";

    if (!ending) return {
        ending,
        filename: attachment.id
    };

    return {
        ending,
        filename: `${attachment.id}.${ending}`
    };
}

async function removeAttachmentTimestamps(data) {
    if (!data?.__tableName) return data;

    data = JSON.parse(JSON.stringify(data));

    let tableData = slmnggAttachments[data.__tableName];
    if (tableData) {
        tableData.forEach(key => {
            if (data[key]) {
                data[key].forEach(attachment => {
                    let { ending, filename } = getAutoFilename(attachment);
                    attachment._autoFilename = filename;
                    attachment.fileExtension = ending;
                    attachments.set(attachment.id, JSON.parse(JSON.stringify(attachment)));
                    // console.log("att set", attachment, attachments.get(attachment.id));

                    // we don't want the URLs to appear in requests anymore
                    // the data server just uses the attachment IDs

                    attachment.url = null; // generateAttachmentURL(attachment.url, attachment);

                    for (let size in attachment.thumbnails) {
                        size = attachment.thumbnails[size];
                        size.url = null; // generateAttachmentURL(size.url, attachment);
                    }

                });
            }
        });
    }

    return data;
}

function keyDeAirtable(key) {
    return key.replace(/ +/g, "_").replace(/[:()]/g, "_").replace(/_+/g,"_").toLowerCase();
}

function generateLimitedPlayers(longText) {
    return longText.split(/[\n;]/g).filter(e => e).map(line => {
        let player = {
            limited: true
        };

        let parts = line.split("|");
        parts.forEach(part => {
            let split = part.indexOf("=");
            let key = keyDeAirtable(part.slice(0, split));
            let val = part.slice(split + 1).trim();

            if (!key || !val) return;

            if (key === "role") {
                if (val === "Damage") val = "DPS";
            }
            if (key === "pronouns") {
                val = val.toLowerCase();
            }
            if (val === "true") val = true;
            if (val === "false") val = false;
            player[key] = val;
        });

        return player;
    });
}

export async function partialSet(id, data, options) {
    return set(id, {
        ...(store.get(id) || {}),
        ...data
    }, options);
}

export async function set(id, data, options) {

    if (data?.__tableName) {
        // Airtable bug where long textboxes that are cleared are just "\n" (and is not falsy)
        let m = longTextMap[data?.__tableName];
        if (m?.length) {
            m.forEach(key => {
                if (data[key] === "\n") {
                    delete data[key];
                } else if (data?.[key]?.endsWith("\n")) {
                    data[key] = data[key].slice(0, -1);
                }
            });
        }
    } else {
        console.warn("Data set without a table name", id);
    }
    if (options?.eager) {
        // console.log({
        //     id,
        //     data
        // });
    }

    if (data?.__tableName === "Channels") {
        authMap.set(`channel_${id}`, data);
        return; // not setting it on global requestable store
    }

    if (data?.__tableName === "Discord Bots") {
        authMap.set(`bot_${cleanID(id)}`, data);

        return; // not setting it on global requestable store
    }

    if (data?.__tableName === "Events") {
        // update antileak
        if (!data.antileak?.length) {
            hiddenEvents.set(id, null);
        } else {
            let hiddenIDs = [];

            if (["all", "teams"].some(t => data.antileak.includes(`Hide ${t}`))) {
                hiddenIDs = hiddenIDs.concat([...(data.teams || [])]);
            }
            if (["all", "matches"].some(t => data.antileak.includes(`Hide ${t}`))) {
                hiddenIDs = hiddenIDs.concat([...(data.matches || [])]);
            }
            if (["all", "brackets"].some(t => data.antileak.includes(`Hide ${t}`))) {
                hiddenIDs = hiddenIDs.concat([...(data.brackets || [])]);
            }
            if (["all", "articles"].some(t => data.antileak.includes(`Hide ${t}`))) {
                hiddenIDs = hiddenIDs.concat([...(data.news_items || [])]);
            }
            if (["all"].some(t => data.antileak.includes(`Hide ${t}`))) {
                hiddenIDs = hiddenIDs.concat([
                    id,
                    ...(data.accolades || []),
                ]);
            }

            hiddenEvents.set(id, hiddenIDs.map(id => cleanID(id)));
        }

        // will automatically update first level attributes, no more
        // other attributes will need to be fully refreshed (probably)
        data = await removeAntiLeak(id, data);
    }

    if (data?.__tableName === "Players") {
        if (data.discord_id) players.set(data.discord_id, data);
    }
    if (data?.__tableName === "Teams") {
        // Limited Players
        if (typeof data.limited_players === "string") {
            data.limited_players = generateLimitedPlayers(data.limited_players);
        }
    }

    data = await removeAttachmentTimestamps(data);

    // Check antileak to see if this should be hidden or redacted
    // data = await removeAntiLeak(id, data);

    let oldData = store.get(id);
    if (oldData && (data.modified !== oldData.modified)) {
        let [oldDate, newDate] = [oldData.modified, data.modified].map(x => new Date(x));
        if (newDate.getTime() < oldDate.getTime()) {
            if (oldDate.getTime() - newDate.getTime() > 3000) {
                // only send a log if it's over 3 seconds
                console.log(`[old data newer]\n      id=${id} \n     old=${oldDate.toLocaleString()} \n     new=${newDate.toLocaleString()}`);
            }
            return;
        }
    }

    await dataUpdate(id, data, options);
    store.set(id, data);
}

export async function get(id) {
    id = cleanID(id);
    let data = store.get(id);
    if (data) data = await removeAntiLeak(id, data);
    return {
        ...data,
        __id: id
    };
}

async function createToken() {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(32, (err, buffer) => {
            if (err) reject(err);
            const token = buffer.toString("hex");
            resolve(token);
        });
    });
}
async function getOrCreateToken() {
    // TODO: lookup existing tokens
    return createToken();
}

async function authStart(storedData) {
    const token = await createToken();
    // console.log(token, storedData);
    authMap.set(token, storedData);
    return token;
}

/**
 * @param token
 * @returns {AuthUserData}
 */
async function getAuthenticatedData(token) {
    let data = authMap.get(token);

    // update airtable data
    if (data?.airtableID) {
        data.user.airtable = await get(data.airtableID);
    }

    return data;
}

async function getPlayer(discordID) {
    return players.get(discordID);
}

async function getChannel(airtableID) {
    return authMap.get(`channel_${cleanID(airtableID)}`);
}
async function getBot(airtableID) {
    return authMap.get(`bot_${cleanID(airtableID)}`);
}
async function getChannelByID(channelID) {
    return (await getChannels()).find(channel => channel.channel_id === channelID);
}
async function getChannels() {
    return await Promise.all(((await get("Channels"))?.ids || []).map(id => getChannel(id)));
}
async function getBots() {
    return await Promise.all(((await get("Discord Bots"))?.ids || []).map(id => getBot(id)));
}

async function getTwitchAccessToken(channel) {
    // get stored access token, check if it's valid
    // otherwise / or if no token, get from refresh token
    if (!channel) return null;
    // TODO: put this in a different map to help with typing
    let storedToken = authMap.get(`twitch_access_token_${channel.channel_id}`);

    if (!storedToken || accessTokenIsExpired(storedToken)) {
        // refresh token
        let token = await refreshUserToken(process.env.TWITCH_CLIENT_ID, process.env.TWITCH_CLIENT_SECRET, channel.twitch_refresh_token);
        authMap.set(`twitch_access_token_${channel.channel_id}`, token);
        return token;

    }
    return storedToken;
}

async function startRawDiscordAuth(discordUser) {
    /*
    - get or create a token using the discord ID (trusted)
    - get player/user objects that will work directly with the auth system
     */
    const player = await getPlayer(discordUser.id);
    if (!player) {
        console.error(`No player for ID ${discordUser.id}`);
        return {};
    }
    console.log(`Discord auth -> mapped ${discordUser?.id} to player ${player?.name} ${player?.id}`);
    const userData = {
        discordID: discordUser.id,
        airtableID: player.id,
        user: {
            discord: discordUser,
            airtable: player
        }
    };
    const token = await authStart(userData);

    return {
        token, player, user: userData
    };
}

export const auth = {
    start: authStart,
    /** @returns {AuthUserData} */
    getData: getAuthenticatedData,
    startRawDiscordAuth,
    getPlayer, getChannel, getChannelByID,
    getTwitchAccessToken, getBots
};
export function getAttachment(id) {
    return attachments.get(id);
}

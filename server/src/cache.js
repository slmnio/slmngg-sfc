const crypto = require("crypto");
const { accessTokenIsExpired,
    refreshUserToken
} = require("@twurple/auth");
/*
    - Get and set data
    - Store data
    - Check for changes and export that
 */

const store = new Map();
const hiddenEvents = new Map();
const auth = new Map();
const players = new Map();
const attachments = new Map();

function getAntiLeakIDs() {
    if (process.env.DISABLE_ANTILEAK === "true") return []; // don't hide anything on local
    let ids = [];
    hiddenEvents.forEach((val, key) => {
        if (val?.length) val.forEach(id => ids.push(id));
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

function setup(_io) {
    io = _io;
    return this;
}

async function broadcast(room, command, ...data) {
    // TODO: get the socket.io server here
    // socket to (room).emit(command, ...data)
    io.to(room).emit(command, ...data);
}

let updateFunctions = [];
function onUpdate(fn) {
    updateFunctions.push(fn);
}

const updateFunction = function(id, data) {
    updateFunctions.forEach(fn => fn(id, data));
};

async function removeAntiLeak(id, data) {
    let antiLeakIDs = getAntiLeakIDs();
    if (antiLeakIDs.includes(id)) {
        // console.log("antileak", antiLeakIDs, id);
        return null;
    }

    Object.entries(data).forEach(([key, val]) => {
        if (typeof val === "object" && val?.length) {
            data[key] = val.filter(id => !antiLeakIDs.includes(cleanID(id)));
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
    if (JSON.stringify(store.get(id)) !== JSON.stringify(data)) {
        // console.log(`Data update on [${id}]`);
        recents.sent++;
        if (data) data = await removeAntiLeak(id, data);
        // if (options?.eager) console.log("Sending");
        await broadcast(id, "data_update", id, data);
        if (!(options && options.custom)) updateFunction(id, { oldData: store.get(id), newData: data });
    }
}

const longTextMap = {
    "Events": ["about"],
    "News": ["content"]
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
    "Heroes": ["main_image", "recolor_base", "recolor_layers"],
    "Ad Reads": ["audio", "image"],
    "Tracks": ["file"],
    "Teams": ["icon"],
    "GFX": ["image"]
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
    return longText.split("\n").filter(e => e).map(line => {
        let player = {
            limited: true
        };

        let parts = line.split("|");
        parts.forEach(part => {
            let split = part.indexOf("=");
            let key = keyDeAirtable(part.slice(0, split));
            let val = part.slice(split + 1);

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

async function set(id, data, options) {

    if (data?.__tableName) {
        // Airtable bug where long textboxes that are cleared are just "\n" (and is not falsy)
        let m = longTextMap[data?.__tableName];
        if (m?.length) {
            m.forEach(key => {
                if (data[key] === "\n") delete data[key];
            });
        }
    }
    if (options?.eager) {
        // console.log({
        //     id,
        //     data
        // });
    }

    if (data?.__tableName === "Channels") {
        auth.set(`channel_${id}`, data);
        return; // not setting it on global requestable store
    }

    if (data?.__tableName === "Discord Bots") {
        auth.set(`bot_${cleanID(id)}`, data);

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
        if (data.limited_players) {
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
                console.log(`[old] id=${id} \n     old=${oldDate.toLocaleString()} \n     new=${newDate.toLocaleString()}`);
                console.warn("     old data is newer, keeping it!");
            }
            // console.log("old data:");
            // console.log(oldData);
            // console.log("new data:");
            // console.log(data);
            return;
        }
    }

    await dataUpdate(id, data, options);
    store.set(id, data);

}
function cleanID(id) {
    if (!id) return null;
    if (typeof id !== "string") return id.id || null; // no real id oops
    if (id.startsWith("rec") && id.length === 17) id = id.slice(3);
    return id;
}
async function get(id) {
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
    return createToken();
}

async function authStart(storedData) {
    const token = await createToken();
    // console.log(token, storedData);
    auth.set(token, storedData);
    return token;
}

/**
 *
 * @param token
 * @returns {Promise<UserData | null>}
 */
async function getAuthenticatedData(token) {
    let data = auth.get(token);

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
    return auth.get(`channel_${cleanID(airtableID)}`);
}
async function getBot(airtableID) {
    return auth.get(`bot_${cleanID(airtableID)}`);
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
    let storedToken = auth.get(`twitch_access_token_${channel.channel_id}`);

    if (!storedToken || accessTokenIsExpired(storedToken)) {
        // refresh token
        let token = await refreshUserToken(process.env.TWITCH_CLIENT_ID, process.env.TWITCH_CLIENT_SECRET, channel.twitch_refresh_token);
        auth.set(`twitch_access_token_${channel.channel_id}`, token);
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

module.exports = {
    set, get, setup, onUpdate,
    auth: {
        start: authStart,
        getData: getAuthenticatedData,
        startRawDiscordAuth,
        getPlayer,
        getChannel,
        getChannelByID,
        getTwitchAccessToken,
        getBots
    },
    getAttachment: (id) => attachments.get(id)
};

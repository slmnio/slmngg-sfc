const crypto = require("crypto");

/*
    - Get and set data
    - Store data
    - Check for changes and export that
 */

const store = new Map();
const hiddenEvents = new Map();
const auth = new Map();
const players = new Map();

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
        if (typeof val === "object" && val.length) {
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
    let seconds = 15;
    setInterval(() => {
        console.log(`[Cache log] secs=${seconds} triggered=${recents.triggered} sent=${recents.sent}`);
        recents.triggered = 0;
        recents.sent = 0;
    }, seconds * 1000);
})();

async function dataUpdate(id, data, options) {
    // broadcast something here
    recents.triggered++;
    if (JSON.stringify(store.get(id)) !== JSON.stringify(data)) {
        // console.log(`Data update on [${id}]`);
        recents.sent++;
        if (!(options && options.custom)) updateFunction(id, { oldData: store.get(id), newData: data });
        if (data) data = await removeAntiLeak(id, data);
        await broadcast(id, "data_update", id, data);
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
    "Map Data": ["map_image", "map_big_image", "map_video", "map_audio"],
    "Maps": ["image", "big_image"],
    "Log Files": ["log_file"],
    "Heroes": ["main_image"],
    "Ad Reads": ["audio", "image"],
    "Tracks": ["file"],
    "Teams": ["icon"]
};

function stripValidation(str) {
    let idx = str.indexOf("ts=");
    if (idx !== -1) return str.slice(0, idx -1);
    return str;
}

async function removeAttachmentTimestamps(data) {
    if (!data?.__tableName) return data;

    let tableData = slmnggAttachments[data.__tableName];
    if (tableData) {
        tableData.forEach(key => {
            if (data[key]) {
                data[key].forEach(attachment => {
                    attachment.url = stripValidation(attachment.url);
                    for (let size in attachment.thumbnails) {
                        size = attachment.thumbnails[size];
                        size.url = stripValidation(size.url);
                    }
                });
            }
        });
    }

    return data;
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
        console.log({
            id,
            data
        });
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

    data = await removeAttachmentTimestamps(data);

    // Check antileak to see if this should be hidden or redacted
    // data = await removeAntiLeak(id, data);

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

async function authStart(storedData) {
    const token = await createToken();
    // console.log(token, storedData);
    auth.set(token, storedData);
    return token;
}

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


module.exports = {
    set, get, setup, onUpdate,
    auth: {
        start: authStart,
        getData: getAuthenticatedData,
        getPlayer
    }
};


/*
    - Get and set data
    - Store data
    - Check for changes and export that
 */

const store = new Map();
const hiddenEvents = new Map();

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

async function dataUpdate(id, data, options) {
    // broadcast something here
    if (JSON.stringify(store.get(id)) !== JSON.stringify(data)) {
        // console.log(`Data update on [${id}]`);
        if (!(options && options.custom)) updateFunction(id, { oldData: store.get(id), newData: data });
        if (data) data = await removeAntiLeak(id, data);
        await broadcast(id, "data_update", id, data);
    }
}

async function set(id, data, options) {
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


module.exports = {
    set, get, setup, onUpdate
};

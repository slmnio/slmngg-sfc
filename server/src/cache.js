
/*
    - Get and set data
    - Store data
    - Check for changes and export that
 */

const store = new Map();

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

async function dataUpdate(id, data, options) {
    // broadcast something here
    if (JSON.stringify(store.get(id)) !== JSON.stringify(data)) {
        // console.log(`Data update on [${id}]`);
        if (!(options && options.custom)) updateFunction(id, { oldData: store.get(id), newData: data });
        await broadcast(id, "data_update", id, data);
    }
}

async function set(id, data, options) {
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
    return {
        ...store.get(id),
        __id: id
    };
}


module.exports = {
    set, get, setup, onUpdate
};

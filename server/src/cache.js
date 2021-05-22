
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

async function dataUpdate(id, data) {
    // broadcast something here
    if (JSON.stringify(store.get(id)) !== JSON.stringify(data)) {
        // console.log(`Data update on [${id}]`);
        await broadcast(id, "data_update", id, data);
    }
}

async function set(id, data) {
    await dataUpdate(id, data);
    store.set(id, data);
}

async function get(id) {
    return {
        ...store.get(id),
        __id: id
    };
}


module.exports = {
    set, get, setup
};

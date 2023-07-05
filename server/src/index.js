require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = 8901;
const http = require("http").Server(app);
const cors = require("cors");
const meta = require("./meta.js");
const routes = require("./routes.js");
const images = require("./images.js");
const discordAuth = require("./discord/auth.js");
const webAuction = require("./web_auction");

/* The staff module should only run on the server, probably not your local machine. */
let staffKeysRequired = ["DISCORD_TOKEN", "STAFFAPPS_GUILD_ID", "STAFFAPPS_CATEGORY_ID", "STAFFAPPS_APPLICATION_CHANNEL_ID", "IS_SLMNGG_MAIN_SERVER"];
if (staffKeysRequired.every(key => process.env[key])) {
    require("./discord/staff.js");
}

let domains = (process.env.CORS_VALID_DOMAINS || "slmn.gg,localhost").split(/, */g).map(d => new RegExp(`(?:^|.*\\.)${d.replace(".", "\\.")}(?:$|\\n)`));

function corsHandle(origin, callback) {
    if (!origin) return callback(null);

    try {
        let url = new URL(origin);

        if (domains.some(r => {
            return r.test(url.hostname);
        })) {
            return callback(null, url.origin);
        }

        return callback(true);
    } catch (e) {
        console.error(e);
        return callback(null);
    }
}

const localCors =  () => cors({ origin: corsHandle });

const io = require("socket.io")(http, {cors: { origin: corsHandle,  credentials: true}, allowEIO3: true});

// const auction = require("./discord/new_auction.js")({
//     to: (...a) => io.to(...a),
//     emit: (...a) => io.emit(...a),
//     on: (...a) => io.on(...a),
//     test: ["hi"]
// });

const test = require("./discord/slash-commands.js");


const Cache = (require("./cache.js")).setup(io);
(require("./airtable-v2.js")).setup({ web: app, io });
(require("./discord/bot-controller.js")).setup(io);

const actions = require("./action-utils/action-manager.js");
actions.load(app, localCors, Cache, io);

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
    res.send("[slmngg-server] pee pee poo poo");
});


app.get("/thing/:id", cors({ origin: corsHandle}), async (req, res) => {
    let id = req.params.id;
    let data = await Cache.get(id);
    if (!data) return res.status(404).send({ error: true, message: "Unknown ID"});
    console.log("[thing request]", id);
    res.end(JSON.stringify(data));
});
app.get("/things/:ids", cors({ origin: corsHandle}), async (req, res) => {
    let ids = req.params.ids.split(",");
    let promises = ids.map(async id => await Cache.get(id));
    let data = await Promise.all(promises);

    let themeRequests = [];
    data.forEach(item => {
        if (item.theme && item.theme.length === 1 && item.theme[0]) {
            themeRequests.push(cleanID(item.theme[0]));
        }
    });
    let themes = await Promise.all(themeRequests.map(async id => await Cache.get(id)));

    data = [...data, ...themes].filter(d => d != null);
    // if (!data) return res.status(404).send({ error: true, message: "Unknown ID"});
    res.end(JSON.stringify(data));
});

routes({ app, cors, Cache, io });

discordAuth({ app, router: express.Router(), cors, Cache, io });

meta({ app, cors, Cache });
images({ app, cors, Cache, corsHandle });

webAuction({ app, io });

function cleanID(id) {
    if (!id) return null;
    if (typeof id !== "string") return id.id || null; // no real id oops
    if (id.startsWith("rec") && id.length === 17) id = id.slice(3);
    return id;
}

let connected = 0;

// eslint-disable-next-line no-unused-vars
io.on("connection", (socket) => {
    console.log(`[socket] on site: ${++connected}`);

    socket.on("subscribe", (id) => {
        id = cleanID(id);
        // console.log("joined", id);
        socket.join(id);
    });
    socket.on("unsubscribe", (id) => {
        id = cleanID(id);
        socket.leave(id);
    });
    socket.on("subscribe-multiple", (ids) => {
        console.log(`[multiple] client rejoining ${ids.length} rooms`);
        ids.map(id => cleanID(id)).forEach(id => {
            socket.join(id);
        });
    });
    socket.on("disconnect", () => {
        if (socket._clientName)
            io.sockets.to(`prod:client-${socket._clientName}-overview`).emit("prod_disconnect", socket.id);
        connected--;
    });

    socket.on("get_and_subscribe", async (id) => {
        // console.log("get and subscribe in:", id);
        id = cleanID(id);
        socket.join(id);
        socket.emit("data_update", id, await Cache.get(id));
        // console.log("get and subscribe out:", id);
    });
    socket.on("prod-join", (clientName) => {
        console.log("[prod:client] join", `prod:client-${clientName}`);
        socket._clientName = clientName;
        socket.join(`prod:client-${clientName}`);
    });

    socket.on("prod-overview-join", (clientName) => {
        console.log("[prod-overview] join ", clientName);
        socket._clientName = clientName;
        socket.join(`prod:client-${clientName}-overview`);
        io.sockets.to(`prod:client-${clientName}`).emit("send_prod_update");
    });

    socket.on("prod-broadcast-join", (broadcastKey) => {
        if (socket._broadcastKey) {
            // console.log("[prod:broadcast] leaving", `prod:broadcast-${socket._broadcastKey}`);
            socket.leave(`prod:broadcast-${socket._broadcastKey}`);
        }
        socket._broadcastKey = broadcastKey;
        socket.join(`prod:broadcast-${socket._broadcastKey}`);
        // console.log("[prod:broadcast] joining", `prod:broadcast-${socket._broadcastKey}`);
    });

    socket.on("prod-send", ({ socketID, event, data }) => {
        let overlaySocket = io.sockets.sockets.get(socketID);
        if (overlaySocket) {
            console.log(socketID, event, data);
            overlaySocket.emit(`prod_button_${event}`, data);
        } else {
            console.warn(`[prod send] error ${socketID} doesn't exist anymore`);
        }
    });

    socket.on("prod-update", (data) => {
        if (data.clientName) {
            socket._clientName = data.clientName;
        }
        if (!socket._clientName) return console.warn("prod update without client name", data);
        data = {
            ...data,
            socket: socket.id
        };
        // console.log("[prod] update", data);
        io.sockets.to(`prod:client-${socket._clientName}-overview`).emit("prod_update", data);
    });

    socket.on("obs_data_change", async ({ clientName, previewScene, programScene }) => {
        let client = await Cache.get(`client-${clientName}`);
        console.log("obs_data_change", { clientName, previewScene, programScene });

        if (clientName && client) {
            io.sockets.to(`prod:client-${clientName}`).emit("prod_preview_program_change", { previewScene, programScene, emitSource: "client", clientSource: clientName });
        }
        let broadcast = await Cache.get(client.broadcast?.[0]);
        if (broadcast && broadcast.key) {
            io.sockets.to(`prod:broadcast-${broadcast.key}`).emit("prod_preview_program_change", { previewScene, programScene, emitSource: "broadcast", clientSource: clientName, broadcastKey: broadcast.key });
        }
    });

    socket.on("tally_change", ({ clientName, state, number, data }) => {
        console.log("[tally]", clientName, state, number, data);
        socket.to(`prod:client-${clientName}`).emit("tally_change", { state, number });
    });

    socket.on("media_update", (status, value) => {
        if (!socket._clientName) return;
        socket.to(`prod:client-${socket._clientName}`).emit(`media_update_${status}`, value);
    });
    socket.on("prod_trigger", (event, ...args) => {
        if (!socket._clientName) return console.warn(`Socket connection tried to ${event} without client`);
        console.log("[Prod Trigger]", socket._clientName, event);
        io.to(`prod:client-${socket._clientName}`).emit(event, args);
    });
});

http.listen(port, () => {
    console.log(`[slmngg-server] live on port ${port}`);
});


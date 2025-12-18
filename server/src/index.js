import "dotenv/config";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";
import meta from "./meta.js";
import routes from "./routes.js";
import images from "./images.js";
import discordAuth from "./discord/auth.js";
import "./discord/discord-data.js";
import webAuction from "./web_auction.js";
import matchRooms from "./match-rooms.js";
import airtableWebhooks from "./webhooks.js";
// import * as draftRoom from "./draft-room.ts";
import * as actions from "./action-utils/action-manager.js";
import { cleanID, dirtyID } from "shared";

const app = express();
const port = 8901;
const http = createServer(app);

/* The staff module should only run on the server, probably not your local machine. */
let staffKeysRequired = ["DISCORD_TOKEN", "STAFFAPPS_GUILD_ID", "STAFFAPPS_CATEGORY_ID", "STAFFAPPS_APPLICATION_CHANNEL_ID", "IS_SLMNGG_MAIN_SERVER"];
if (staffKeysRequired.every(key => process.env[key])) {
    await import("./discord/staff.js");
} else {
    console.warn("Staff application system won't be set up. Set the required STAFFAPPS keys in server/.env");
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

const io = new Server(http, {cors: { origin: corsHandle,  credentials: true}, allowEIO3: true});

// const auction = require("./discord/new_auction.js")({
//     to: (...a) => io.to(...a),
//     emit: (...a) => io.emit(...a),
//     on: (...a) => io.on(...a),
//     test: ["hi"]
// });

const Cache = (await import("./cache.js")).setup(io);
(await import("./airtable-v2.js")).setup({ web: app, io });
(await import("./discord/bot-controller.js")).setup(io);
actions.load(app, localCors, Cache, io);
if (process.env.AIRTABLE_WEBHOOK_DELIVERY_URL) {
    airtableWebhooks({ app });
} else {
    console.warn("Not using Airtable webhooks - set AIRTABLE_WEBHOOK_DELIVERY_URL to enable.");
}


await import("./discord/slash-commands.js");
await import("./discord/interactions.js");
await import("./discord/streaming.js");
await import("./automation-manager.js");

app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.options("/*", cors());

app.get("/", async (req, res) => {
    res.send("[slmngg-server] pee pee poo poo");
});


app.get("/thing/:id", cors({ origin: corsHandle }), async (req, res) => {
    let id = req.params.id;
    let data = await Cache.get(id);
    if (!data) return res.status(404).send({ error: true, message: "Unknown ID"});
    res.end(JSON.stringify(data));
});
app.get("/things/:ids", cors({ origin: corsHandle }), async (req, res) => {
    let ids = req.params.ids.split(",");
    return handleThingsRequest(ids, req, res);
});

app.post("/things", express.json(), cors({ origin: corsHandle }), async (req, res) => {
    const ids = req.body?.ids?.split(",");
    if (!ids?.length) return res.status(400).send({ error: true, message: "No IDs supplied" });
    if (ids?.length > 500) return res.status(400).send({ error: true, message: "Too many IDs supplied" });
    return handleThingsRequest(ids, req, res);
});

async function handleThingsRequest(ids, req, res) {

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
}

routes({ app, cors, Cache, io });

discordAuth({ app, router: express.Router(), cors, Cache, io });

meta({ app, cors, Cache });
images({ app, cors, Cache, corsHandle });

webAuction({ app, io });
matchRooms({ app, io, cors: localCors });

let connected = 0;
const connectedTransmitters = new Map();

setInterval(() => {
    Cache.set("special:streams", {
        __tableName: "Special",
        streams: [...connectedTransmitters.values()]
    });
}, 1000);


io.on("connection", (socket) => {
    console.log(`[socket] on site: ${++connected}`);

    socket.on("subscribe", (id) => {
        id = cleanID(id);
        socket.join(id);
    });
    socket.on("associate_token", (token) => {
        socket._token = token;
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
        if (socket._clientName) {
            io.sockets.to(`prod:client-${socket._clientName?.toLowerCase()}-overview`).emit("prod_disconnect", socket.id);
        }
        if (connectedTransmitters.has(socket.id)) {
            connectedTransmitters.delete(socket.id);
        }
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
        if (!clientName) return;
        clientName = clientName.toLowerCase();
        console.log("[prod:client] join", `prod:client-${clientName}`);
        socket._clientName = clientName;
        socket.join(`prod:client-${clientName}`);
    });

    socket.on("prod-overview-join", (clientName) => {
        if (!clientName) return;
        clientName = clientName.toLowerCase();
        console.log("[prod-overview] join ", clientName);
        socket._clientName = clientName;
        socket.join(`prod:client-${clientName}-overview`);
        io.sockets.to(`prod:client-${clientName}`).emit("send_prod_update");
    });

    socket.on("prod-broadcast-join", (broadcastKey) => {
        if (!broadcastKey) return;
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
            socket._clientName = data.clientName.toLowerCase();
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
        if (!clientName) return;
        let client = await Cache.get(`client-${clientName}`);

        const player = await Cache.get(client?.staff?.[0]);
        const broadcast = await Cache.get(client?.broadcast?.[0]);
        const match = await Cache.get(broadcast?.live_match?.[0]);
        const relationships = await Promise.all((match.player_relationships || []).map(id => Cache.get(id)));

        const clientPositions = relationships.filter(rel => dirtyID(player?.id) === dirtyID(rel.player?.[0])).map(rel => rel.singular_name);
        console.log("obs_data_change", { clientName, previewScene, programScene }, { clientPositions });

        if (clientName && client) {
            io.sockets.to(`prod:client-${clientName}`).emit("prod_preview_program_change", { previewScene, programScene, emitSource: "client", clientSource: clientName, clientPlayerName: player.name, clientPositions });
        }
        if (broadcast && broadcast.key) {
            io.sockets.to(`prod:broadcast-${broadcast.key}`).emit("prod_preview_program_change", { previewScene, programScene, emitSource: "broadcast", clientSource: clientName, clientPlayerName: player.name, broadcastKey: broadcast.key, clientPositions });
        }
    });
    socket.on("pip_announce", async ({ clientName, active, number }) => {
        if (!clientName) return;
        active = active === "true" ? true : (active === "false" ? false : active);
        number = parseInt(number);

        console.log(`[pip] ${clientName} ${number} ${active ? "active" : "inactive"}`);
        let client = await Cache.get(`client-${clientName}`);
        const broadcast = await Cache.get(client?.broadcast?.[0]);

        if (clientName && client) {
            io.sockets.to(`prod:client-${clientName}`).emit("pip_announce", { clientName, active, number });
        }
        if (broadcast && broadcast.key) {
            io.sockets.to(`prod:broadcast-${broadcast.key}`).emit("pip_announce", { clientName, active, number });
        }
    });
    socket.on("obs_disconnect", async (data) => {
        connectedTransmitters.delete(socket.id);
    });
    socket.on("obs_stream_status", async (data) => {
        if (!data.clientName) return;
        socket._clientName = data.clientName.toLowerCase();
        connectedTransmitters.set(socket.id, { ...data, socket: socket.id });

        // console.log("OBS stream status", data);
    });

    socket.on("tally_change", ({ clientName, state, data }) => {
        clientName = clientName.toLowerCase();
        console.log("[tally]", clientName, state, data);
        socket.to(`prod:client-${clientName}`).emit("tally_change", { state });
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

    // draftRoom.socketConnection(socket, io);
});

http.listen(port, () => {
    console.log(`[slmngg-server] live on port ${port}`);
});


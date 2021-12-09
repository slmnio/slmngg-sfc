require("dotenv").config();
const app = require("express")();
const bodyParser = require("body-parser");
const port = 8901;
const http = require("http").Server(app);
const cors = require("cors");
const meta = require("./meta.js");
const routes = require("./routes.js");
const staff = require("./discord/staff.js");
// const api = require("./api/level_1.js");
// const autodis = require("./discord/autodis.js");
// const bpl3 = require("./bpl3.js");

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

const io = require("socket.io")(http, {cors: { origin: corsHandle,  credentials: true}, allowEIO3: true});

// const auction = require("./discord/new_auction.js")({
//     to: (...a) => io.to(...a),
//     emit: (...a) => io.emit(...a),
//     on: (...a) => io.on(...a),
//     test: ["hi"]
// });


const Cache = (require("./cache.js")).setup(io);
(require("./airtable-interface.js")).setup(io);

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

routes({ app, cors, Cache });
meta({ app, cors, Cache });

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
        // console.log(`[multiple] client rejoining ${ids.length} rooms`);
        ids.map(id => cleanID(id)).forEach(id => {
            socket.join(id);
        });
    });
    socket.on("disconnect", () => {
        connected--;
    });
});

http.listen(port, () => {
    console.log(`[slmngg-server] live on port ${port}`);
});


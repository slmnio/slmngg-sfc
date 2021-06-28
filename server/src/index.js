require("dotenv").config();
const app = require("express")();
const bodyParser = require("body-parser");
const port = 8901;
const http = require("http").Server(app);
const cors = require("cors");
let corsOrigins = ["http://localhost","http://localhost:8080", "http://dev.slmn.gg", "https://dev.slmn.gg"];
const io = require("socket.io")(http, {cors: { origin: corsOrigins, methods: ["GET", "POST"], credentials: true}, allowEIO3: true});

const Cache = (require("./cache.js")).setup(io);
require("./airtable-interface.js");

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
    res.send("[slmngg-server] pee pee poo poo");
});


app.get("/thing/:id", cors({ origin: corsOrigins}), async (req, res) => {
    let id = req.params.id;
    let data = await Cache.get(id);
    if (!data) return res.status(404).send({ error: true, message: "Unknown ID"});
    console.log("[thing request]", id);
    res.end(JSON.stringify(data));
});
app.get("/things/:ids", cors({ origin: corsOrigins}), async (req, res) => {
    let ids = req.params.ids.split(",");
    let promises = ids.map(async id => await Cache.get(id));
    let data = await Promise.all(promises);

    data = data.filter(d => d != null);
    // if (!data) return res.status(404).send({ error: true, message: "Unknown ID"});
    res.end(JSON.stringify(data));
});

function cleanID(id) {
    if (!id) return null;
    if (typeof id !== "string") return id.id || null; // no real id oops
    if (id.startsWith("rec") && id.length === 17) id = id.slice(3);
    return id;
}

// eslint-disable-next-line no-unused-vars
io.on("connection", (socket) => {
    console.log("[socket] New connection");

    socket.on("subscribe", (id) => {
        id = cleanID(id);
        console.log("joined", id);
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
});

http.listen(port, () => {
    console.log(`[slmngg-server] live on port ${port}`);
});



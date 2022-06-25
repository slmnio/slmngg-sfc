const bodyParser = require("body-parser");
let defaults = { dashboardApp: null, cors: null, Cache: null };

const Airtable = require("airtable");
const Cache = require("./cache");
const airtable = new Airtable({ apiKey: process.env.AIRTABLE_KEY });
const slmngg = airtable.base(process.env.AIRTABLE_APP);

module.exports = ({ app, router, cors, Cache, io }) => {

    const dashboardApp = router;
    defaults.dashboardApp = dashboardApp;
    defaults.cors = cors;
    defaults.Cache = Cache;

    dashboardApp.use(bodyParser.json());
    dashboardApp.options("/*", cors());


    dashboardRoute({
        url: "/set-active-broadcast",
        required: ["client", "broadcast"],
        auth: true,
        handler: async (req, res, { client: clientID, broadcast: broadcastID }, token) => {
            if (clientID !== "self") return res.status(501).send({ error: true, message: "Only allowing self-token edits" });

            broadcastID = dirtyID(broadcastID);

            let clientData = await getClient(clientID, token);
            if (!clientData?.id) return res.status(403).send({ error: true, message: "No client data set on that token"});
            console.log("client", clientData);

            // broadcast = array of broadcasts, should only really be one so set [0] to make it active
            let broadcasts = clientData.broadcast.sort((a,b) => {
                if (a === broadcastID) return -1;
                if (b === broadcastID) return 1;
                return 0;
            });

            let recordResponse = await updateRecord("Clients", clientData, {
                "Broadcast": broadcasts
            });

            if (recordResponse?.error) {
                return res.status(500).send({ error: true, message: "Airtable error" });
            } else {
                return res.send({ error: false });
            }

        }
    });

    dashboardRoute({
        url: "/update-profile-data",
        auth: true,
        required: ["profileData"],
        handler: async (req, res, { profileData: profileData }, token) => {
            let userData = await Cache.auth.getData(token);
            if (!userData?.user?.airtable.id) return res.status(401).send({ error: true, message: "Not authenticated - try logging in again." });
            if (userData.user.airtable?.website_settings?.includes("No profile editing")) return res.status(403).send({ error: true, message: "You are restricted from editing your profile."});
            let validatedData = {};

            if (profileData.pronouns) {
                let valid = ["he/him", "she/her", "they/them", "he/they", "she/they", "any"];
                if (valid.includes(profileData.pronouns)) validatedData["Pronouns"] = profileData.pronouns;
            }

            if (profileData.role) {
                let valid = ["DPS", "Support", "Tank", "Flex"];
                if (valid.includes(profileData.role)) validatedData["Role"] = profileData.role;
            }

            if (profileData.pronunciation) {
                if (profileData.pronunciation.length > 100) return res.status(400).send({ error: true, message: "Pronunciation is too long. Please keep it under 100 characters." });
                validatedData["Pronunciation"] = profileData.pronunciation;
            }

            if (profileData.favourite_hero) {
                let validHeroes = await getValidHeroes();
                if (validHeroes.find(hero => hero.id === profileData.favourite_hero)) {
                    validatedData["Favourite Hero"] = [profileData.favourite_hero]; // Needs to be in an array since it's a linked record
                }
            }


            console.log("[profile]", userData.user.airtable.name, userData.user.airtable.id, "is setting", validatedData);
            let recordResponse = await updateRecord("Players", userData.user.airtable, {
                ...validatedData
            });

            if (recordResponse?.error) {
                return res.status(500).send({ error: true, message: "Airtable error" });
            } else {
                return res.send({ error: false });
            }
        }
    });

    app.use("/dashboard", dashboardApp);
};

async function getValidHeroes() {
    // Get Heroes table
    // Get any OW hero only
    let heroIDs = (await Cache.get("Heroes"))?.ids;
    if (!heroIDs?.length) return [];
    let heroes = await Promise.all(heroIDs.map(async id => await Cache.get(id)));
    return heroes.filter(h => h.game === "Overwatch");
}


function dashboardRoute({ url, required, auth, handler }) {
    defaults.dashboardApp.post(url, defaults.cors(), async (req, res) => {
        let token;
        if (auth) {
            // auth should be in header or in body? maybe just header
            let header = req.headers.authentication;
            if (!header || !header.startsWith("Bearer ")) return res.status(401).send({ error: true, errorMessage: "Unauthorized" });
            token = header.slice(("Bearer ").length);
            if (!token || token === "") return res.status(401).send({ error: true, errorMessage: "Unauthorized" });
        }
        if (required && !required.every(key => req.body[key])) {
            return res.status(400).send({ error: true, errorMessage: "Missing required body parameter" });
        }
        let params = {};
        (required || []).forEach(key => {
            params[key] = req.body[key];
        });

        return await handler(req, res, params, token);
    });
}

async function getClient(client, token) {
    if (client === "self") {
        // get client based on token
        // token -> user -> client
        let userData = await defaults.Cache.auth.getData(token);
        if (!userData) return null;
        let clientID = userData?.user?.airtable?.clients?.[0];
        let clientData = await defaults.Cache.get(clientID);

        return clientData;
    }
    let data = await defaults.Cache.get(client);
    return data;
}

function deAirtable(obj) {
    const data = {};
    Object.entries(obj).forEach(([key, val]) => {
        data[key.replace(/ +/g, "_").replace(/[:()]/g, "_").replace(/_+/g,"_").toLowerCase()] = val;
    });
    data.id = obj.id;
    return data;
}

async function updateRecord(tableName, item, data) {
    // TODO: eager update by setting in cache

    // TODO: need to also do aliases eg: client-slmn
    // see: airtable-interface.js customUpdater

    let slmnggData = deAirtable({ ...item, ...data });
    // Eager update
    defaults.Cache.set(cleanID(item.id), slmnggData, { eager: true });

    if (tableName === "Broadcasts" && item.key) defaults.Cache.set(`broadcast-${item.key}`, slmnggData, { eager: true });
    if (tableName === "Clients" && item.key) defaults.Cache.set(`client-${item.key}`, slmnggData, { eager: true });
    if (tableName === "Events" && item.subdomain) defaults.Cache.set(`subdomain-${item.subdomain}`, slmnggData, { eager: true });
    if (tableName === "News" && item.slug) defaults.Cache.set(`news-${item.slug}`, slmnggData, { eager: true });

    try {
        await slmngg(tableName).update(item.id, data);
    } catch (e) {
        console.error("Airtable update failed", e);
        return { error: true};
    }
}

function cleanID(id) {
    if (!id) return null;
    if (typeof id !== "string") return null;
    if (id.startsWith("rec") && id.length === 17) id = id.slice(3);
    return id;
}
function dirtyID(id) {
    // add rec
    if (!id) return id;
    if (id.length === 14) return "rec" + id;
    return id;
}

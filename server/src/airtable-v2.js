const Airtable = require("airtable");
const airtable = new Airtable({ apiKey: process.env.AIRTABLE_KEY });
const Cache = require("./cache.js");
const slmngg = airtable.base(process.env.AIRTABLE_APP);


function sortKeys([aKey], [bKey]) {
    if (aKey > bKey) return 1;
    if (aKey < bKey) return -1;
    return 0;
}

async function wait(ms){
    return new Promise(r => setTimeout(r, ms));
}

/**
 *
 * @param obj
 * @returns {{id: string, any}}
 */
function deAirtable(obj) {
    const data = {};
    if (!obj.fields) {
        console.error(obj);
    }
    Object.entries(obj.fields).sort(sortKeys).forEach(([key, val]) => {
        data[key.replace(/ +/g, "_").replace(/[:()]/g, "_").replace(/_+/g, "_").toLowerCase()] = val;
    });
    data.id = obj.id;
    return data;
}

function sluggify(text) {
    return (((text || "").replace(/[^A-Za-z0-9-]+/g, "-")).trim()).toLowerCase().replace(/-+/g, "-").replace(/-+$/g, "");
}

async function checkExtraRecord(tableName, item) {
    if (tableName === "Broadcasts" && item.key) return Cache.set(`broadcast-${item.key}`, item);
    if (tableName === "Clients" && item.key) return Cache.set(`client-${item.key}`, item);
    if (tableName === "Events" && item.subdomain) return Cache.set(`subdomain-${item.subdomain}`, item);
    if (tableName === "News" && item.slug) return Cache.set(`news-${item.slug}`, item);
}

const customTableUpdate = require("./custom-datasets");

class TableManager {
    constructor(tableName) {
        this.tableName = tableName;
        this.timerStart = null;
        this.request = null;
        this.airtableRequestCount = 0;
    }

    async fullTableLoad() {
        this.request = {
            type: "all",
            status: "active",
            start: this.startTimer(),
        };
        this.lastRequest = this.request.start;
        const data = await slmngg(this.tableName).select().all();
        this.request.status = "finished";
        this.request.duration = this.endTimer();
        this.request.itemCount = data.length;

        await this.processData(data);

        await Cache.set(this.tableName, {
            id: this.tableName,
            ids: data.map(d => d.id)
        });
        customTableUpdate(this.tableName, Cache);
    }

    async getTableUpdates() {
        this.request = {
            type: "changes",
            status: "active",
            start: this.startTimer(),
        };
        const data = await slmngg(this.tableName).select({
            filterByFormula: `{Modified} > "${this.lastRequest.toISOString().slice(0, 19)}"`
        }).all();

        this.lastRequest = this.request.start;

        this.request.status = "finished";
        this.request.duration = this.endTimer();
        this.request.itemCount = data.length;

        return this.processData(data);
    }

    async processData(data) {
        this.airtableRequestCount += (Math.floor(data.length / 100) + 1);
        for (const item of data.map(deAirtable)) {
            item.__tableName = this.tableName;
            if (this.tableName === "News") item.slug = sluggify(item.name);
            await Cache.set(item.id.slice(3), item);
            await checkExtraRecord(this.tableName, item);
        }
    }

    startTimer() {
        const now = new Date();
        this.timerStart = now;
        return now;
    }

    endTimer() {
        return (new Date()) - this.timerStart;
    }
}

class AirtableManager {
    constructor() {
        this.tableNames = ["Redirects", "Broadcasts", "Clients", "Channels", "Discord Bots", "Players", "Live Guests", "Events", "GFX", "Event Series", "Teams", "Ad Reads", "Ad Read Groups", "News", "Matches",  "Themes",  "Socials", "Accolades", "Player Relationships", "Brackets", "Headlines", "Maps", "Map Data", "Heroes", "Log Files", "Tracks", "Track Groups", "Track Group Roles"];
        // this.tableNames = ["Redirects", "Broadcasts", "Clients", "Channels", "Discord Bots", "Players", "Live Guests"];
        this.tables = this.tableNames.map(tableName => new TableManager(tableName));
        this.availableRequests = 5;
        this.websiteFlags = ["server_rebuilding"];
        this.lastRequestRate = 0;
        this.requestRatePeriod = 60;
    }

    async main(io) {
        setInterval(() => this.logRequestRate(), this.requestRatePeriod * 1000);
        this.ioServer = io;

        this.ioServer.on("connect", (socket) => {
            socket.emit("website_flags", this.websiteFlags);
        });
        // Startup sequence
        //   Get everything
        // Set up loops to get everything since last requests

        const fullLoadStart = new Date();

        const iterator = this.tables.values();
        await Promise.allSettled(Array(this.availableRequests).fill(iterator).map(async iterator => {
            for (const table of iterator) {
                console.log(`[Load] Full load [${table.tableName}] started`);
                await table.fullTableLoad();
                console.log(`[Load] Full load [${table.tableName}] finished (${(table.request.duration / 1000).toFixed(1)}s, ${table.request.itemCount} items)`);
            }
        }));

        this.removeWebsiteFlag("server_rebuilding");
        console.log(`[Load] -> Full load finished in ${Math.floor((new Date() - new Date(fullLoadStart)) / 1000)}s`);

        for (let i = 0; i < this.availableRequests; i++) {
            this.startNextOldestTable();
        }
    }

    logRequestRate() {
        const allRequests = this.tables.map(table => table.airtableRequestCount).reduce((a, c) => a + c, 0);
        const diff = allRequests - this.lastRequestRate;
        console.log(`[Load] Request count in last ${this.requestRatePeriod}s = ${diff} (${(diff / this.requestRatePeriod).toFixed(1)} req/s)`);
        this.lastRequestRate = allRequests;
    }

    addWebsiteFlag(flag) {
        if (this.websiteFlags.indexOf(flag) !== -1) return;
        this.websiteFlags.push(flag);
        this.updateFlags();
    }
    removeWebsiteFlag(flag) {
        if (this.websiteFlags.indexOf(flag) === -1) return;
        this.websiteFlags.splice(this.websiteFlags.indexOf(flag), 1);
        this.updateFlags();
    }

    updateFlags() {
        this.ioServer.emit("website_flags", this.websiteFlags);
    }

    startNextOldestTable() {
        let table = this.getOldestTable();
        if (!table) return wait(2000).then(() => this.startNextOldestTable());
        // const diff = new Date() - table.lastRequest;
        // console.log(`[Load] Starting update of old table [${table.tableName}] (${Math.floor(diff / 1000)}s old)`);
        table.getTableUpdates().then(() => this.startNextOldestTable());
    }

    getOldestTable() {
        return this.tables.filter(table => {
            if (table.request?.status === "active") return false;
            const latestRequestDiff = new Date() - table.lastRequest;
            return latestRequestDiff >= 5000; // only show tables over Xs old
        }).sort((a, b) => {
            const [aDate, bDate] = [a,b].map(x => x.lastRequest);
            if (aDate > bDate) return 1;
            if (aDate < bDate) return -1;
        })?.[0];
    }

    getStatusData() {
        return this.tables.map(table => ({
            tableName: table.tableName,
            lastRequest: table.lastRequest,
            request: table.request,
            airtableRequestCount: table.airtableRequestCount
        }));
    }
}

module.exports = {
    /**
     * @param {Express} web
     * @param {import("socket.io").Server} io
     */
    setup: ({
        web,
        io
    }) => {
        const manager = new AirtableManager();

        web.get("/api/requests", async (req, res) => {
            res.json(manager.getStatusData());
        });
        web.get("/requests", async (req, res) => {
            res.sendFile(__dirname + "/request.html");
        });

        return manager.main(io);
    },
    async update(table, id, data) {
        return await slmngg(table).update(id, data);
    },
    async select(table, filter) {
        return await slmngg(table).select(filter).all();
    },
};

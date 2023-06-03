const Airtable = require("airtable");
const airtable = new Airtable({ apiKey: process.env.AIRTABLE_KEY });
const Cache = require("./cache.js");
const slmngg = airtable.base(process.env.AIRTABLE_APP);
const ora = require("ora");
const chalk = require("chalk");

// const st4 = require("./st4")(airtable);

const logUpdates = false;


/***
 * @type {Server}
 */
let io = null;
let _isRebuilding = true;
let _rebuildStart = null;

const reqLog = {
    highErrorRate: false,
    errorRate: 0,
    counts: {
        started: 0,
        succeeded: 0,
        failed: 0,
    },
    period: 60,
    trigger(key) {
        this.counts[key]++;
        setTimeout(() => this.counts[key]--, this.period * 1000);
        if (this.counts.started > 20) this.setHighRate(this.counts.failed / this.counts.started);
    },
    start() {
        this.trigger("started");
    },
    success() {
        this.trigger("succeeded");
    },
    fail() {
        this.trigger("failed");
    },
    output() {
        console.log(`[Request log] last ${this.period}s: ${this.counts.started} started (${(this.counts.started / this.period).toFixed(1)}/s, ${(((this.counts.started / this.period) / 5) * 100).toFixed(1)}% of limit), ${this.counts.succeeded} succeeded (${Math.floor((this.counts.succeeded / this.counts.started) * 100)}% success), ${this.counts.failed} failed (${Math.floor((this.counts.failed / this.counts.started) * 100)}% start-fails)`);
    },
    setHighRate(newRate) {
        if (!this.highErrorRate && newRate >= 0.2) { // not alerted and should be
            console.log("high_error_rate", newRate);
            log(`**High error rate**: ${Math.floor((this.counts.failed / this.counts.started) * 100)}% requests failed in the last ${this.period}s.`);
            io.emit("high_error_rate", true);
            this.highErrorRate = true;

        } else if (this.highErrorRate && newRate <= 0.05) { // alerted and should not be
            io.emit("high_error_rate", false);
            log(`**High error rate** (Resolved): ${Math.floor((this.counts.failed / this.counts.started) * 100)}% requests failed in the last ${this.period}s.`);
            this.highErrorRate = false;
        }
        this.errorRate = newRate;
    }
};
setInterval(() => {
    reqLog.output();
}, reqLog.period * 1000);

function setup(_io) {
    io = _io;

    console.log("[rebuild] rebuilding...");
    _rebuildStart = Date.now();
    io.on("connect", (socket) => {
        socket.emit("server_rebuilding", _isRebuilding);
        socket.emit("high_error_rate", reqLog.highErrorRate);
    });

    return this;
}

function setRebuilding(isRebuilding) {
    _isRebuilding = isRebuilding;
    if (isRebuilding) {
        io.emit("server_rebuilding", true);
    } else {
        io.emit("server_rebuilding", false);
        console.log(`[rebuild] rebuild finished in ${(Date.now() - _rebuildStart)}ms`);
        if (process.env.IS_SLMNGG_MAIN_SERVER) log(`SLMN.GG has restarted and finished rebuilding in ${(Date.now() - _rebuildStart)}ms.`);
    }
}


// Starting with syncing Matches

// const tables = ["Matches", "Teams", "Themes", "Events", "Players", "Player Relationships"];
const tables = ["Broadcasts", "Clients", "Channels", "Discord Bots", "Players", "Events", "GFX", "Event Series", "Teams", "Ad Reads", "Ad Read Groups", "News", "Matches",  "Themes",  "Socials", "Accolades", "Player Relationships", "Brackets", "Live Guests", "Headlines", "Maps", "Map Data", "Heroes", "Log Files", "Tracks", "Track Groups", "Track Group Roles"];
const staticTables = ["Redirects"];

function sortKeys([aKey], [bKey]) {
    if (aKey > bKey) return 1;
    if (aKey < bKey) return -1;
    return 0;
}

function deAirtable(obj) {
    const data = {};
    if (!obj.fields) {
        console.error(obj);
    }
    Object.entries(obj.fields).sort(sortKeys).forEach(([key, val]) => {
        data[key.replace(/ +/g, "_").replace(/[:()]/g, "_").replace(/_+/g,"_").toLowerCase()] = val;
    });
    data.id = obj.id;
    return data;
}

async function getAllTableData(tableName, options = {}) {
    const start = new Date();
    let loading;
    if (logUpdates) loading = ora({
        text: `Loading table ${chalk.bold(tableName)}`,
        prefixText: "Airtable"
    }).start();
    try {
        reqLog.start();
        let data = await slmngg(tableName).select(options).all();
        const end = new Date();
        if (logUpdates) loading.succeed(`Loaded table ${chalk.bold(tableName)} - ${data.length} records loaded in ${((end - start) / 1000).toFixed(2)}s`);
        reqLog.success();
        return data;
    } catch (e) {
        reqLog.fail(e.statusCode || e.code);
        if (e.code === "ETIMEDOUT") {
            console.warn("Airtable request timed out (classic)");
        } else {
            if (e.statusCode === 503) {
                // Airtable down
                return console.error("Airtable 503");
            }
            console.error(`[Airtable error] getting all table data on ${tableName}`, e);
        }
    }
}

function customUpdater(tableName, item) {
    if (tableName === "Broadcasts" && item.key) Cache.set(`broadcast-${item.key}`, item);
    if (tableName === "Clients" && item.key) Cache.set(`client-${item.key}`, item);
    if (tableName === "Events" && item.subdomain) Cache.set(`subdomain-${item.subdomain}`, item);
    if (tableName === "News" && item.slug) Cache.set(`news-${item.slug}`, item);
}

function sluggify(text) {
    return (((text || "").replace(/[^A-Za-z0-9-]+/g, "-")).trim()).toLowerCase().replace(/-+/g,"-").replace(/-+$/g,"");
}

async function processTableData(tableName, data, linkRecords = false) {
    if (!data) return;
    data.map(deAirtable).forEach(data => {
        if (tableName === "News") {
            data.slug = sluggify(data.name);
        }
        data.__tableName = tableName;
        Cache.set(data.id.slice(3), data);
        customUpdater(tableName, data);
    });
    if (linkRecords) {
        await Cache.set(tableName, {id: tableName, items: data.map(deAirtable) });
    } else {
        await Cache.set(tableName, {id: tableName, ids: data.map(d => d.id)});
    }
    customTableUpdate(tableName, Cache);
}

const customTableUpdate = require("./custom-datasets");
const { log } = require("./discord/slmngg-log");

function registerUpdater(tableName, options) {
    let pollRate = 5000;
    setInterval(async function() {
        let date = (new Date(new Date().getTime() - pollRate)).toISOString().slice(0, 19);
        try {
            reqLog.start();
            let data = (await slmngg(tableName).select({
                ...options,
                filterByFormula: `{Modified} > "${date}"`
            }).all()).map(deAirtable);
            reqLog.success();

            data.forEach(data => {
                if (tableName === "News") {
                    data.slug = sluggify(data.name);
                }
                data.__tableName = tableName;
                Cache.set(data.id.slice(3), data);
                customUpdater(tableName, data);
            });

            if (data.length) {
                if (logUpdates) console.log(`Airtable # Updates complete for table ${chalk.bold(tableName)} - ${data.length} records updated.`);
            }

            customTableUpdate(tableName, Cache);
        } catch (e) {
            reqLog.fail(e.statusCode || e.code);
            if (e.code === "ETIMEDOUT") {
                console.warn("Airtable request timed out (classic)");
            } else {
                if (e.statusCode === 503) {
                    // Airtable down
                    return console.error("Airtable 503");
                }
                console.error(`[Airtable error] getting updates from ${tableName}`, e);
            }
        }
    }, pollRate);

    setInterval(async function() {

    }, pollRate * 10);
}

function t(ms) {
    return new Promise((res) => {
        setTimeout(res, ms);
    });
}

let firstRun = true;

async function sync() {
    for (let table of staticTables) {
        await processTableData(table, await getAllTableData(table), true);
        setInterval(async () => processTableData(table, await getAllTableData(table), true), 8 * 1000);
        if (firstRun) console.log(`[rebuild] static table ${table} complete`);
    }
    for (let table of tables) {
        // await t(1000);
        let t = new Date();
        if (firstRun) console.log(`[rebuild] starting: dynamic table ${table}`);
        await processTableData(table, await getAllTableData(table));
        setInterval(async () => processTableData(table, await getAllTableData(table)), 30 * 1000);
        registerUpdater(table);
        if (firstRun) console.log(`[rebuild] complete: dynamic table ${table} (in ${((new Date().getTime() - t.getTime()) / 1000).toFixed(2)}s)`);
    }
    if (firstRun) setRebuilding(false);
    firstRun = false;
}

sync();
// setInterval(sync, 5 * 1000);

module.exports = {
    async update(table, id, data) {
        return await slmngg(table).update(id, data);
    },
    async select(table, filter) {
        return await slmngg(table).select(filter).all();
    },
    setup
};

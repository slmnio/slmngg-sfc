const Airtable = require("airtable");
const airtable = new Airtable({ apiKey: process.env.AIRTABLE_KEY });
const Cache = require("./cache.js");
const slmngg = airtable.base(process.env.AIRTABLE_APP);
const ora = require("ora");
const chalk = require("chalk");

// const st4 = require("./st4")(airtable);

const logUpdates = false;

// Starting with syncing Matches

// const tables = ["Matches", "Teams", "Themes", "Events", "Players", "Player Relationships"];
const tables = ["Event Series", "News", "Matches", "Teams", "Themes", "Events", "Players", "Socials", "Accolades", "Player Relationships", "Broadcasts", "Brackets", "Live Guests", "Headlines", "Clients", "Maps", "Map Data"];

function deAirtable(obj) {
    const data = {};
    if (!obj.fields) {
        console.error(obj);
    }
    Object.entries(obj.fields).forEach(([key, val]) => {
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
        let data = await slmngg(tableName).select(options).all();
        const end = new Date();
        if (logUpdates) loading.succeed(`Loaded table ${chalk.bold(tableName)} - ${data.length} records loaded in ${((end - start) / 1000).toFixed(2)}s`);
        return data;
    } catch (e) { console.error("Airtable error", e); }
}

function customUpdater(tableName, item) {
    if (tableName === "Broadcasts" && item.key && item.active) Cache.set(`broadcast-${item.key}`, item);
    if (tableName === "Clients" && item.key) Cache.set(`client-${item.key}`, item);
    if (tableName === "Events" && item.subdomain) Cache.set(`subdomain-${item.subdomain}`, item);
    if (tableName === "News" && item.slug) Cache.set(`news-${item.slug}`, item);
}

function sluggify(text) {
    return ((text.replace(/[^A-Za-z0-9-]+/g, "-")).trim()).toLowerCase().replace(/-+/g,"-").replace(/-+$/g,"");
}

async function processTableData(tableName, data) {
    data.map(deAirtable).forEach(data => {
        if (tableName === "News") {
            data.slug = sluggify(data.name);
        }
        Cache.set(data.id.slice(3), data);
        customUpdater(tableName, data);
    });
    await Cache.set(tableName, {id: tableName, ids: data.map(d => d.id)});
    customTableUpdate(tableName, Cache);
}

const customTableUpdate = require("./custom-datasets");

function registerUpdater(tableName, options) {
    let pollRate = 3000;
    setInterval(async function() {
        let date = (new Date(new Date().getTime() - pollRate)).toISOString().slice(0, 19);
        try {
            let data = (await slmngg(tableName).select({
                ...options,
                filterByFormula: `{Modified} > "${date}"`
            }).all()).map(deAirtable);

            data.forEach(data => {
                if (tableName === "News") {
                    data.slug = sluggify(data.name);
                }
                Cache.set(data.id.slice(3), data);
                customUpdater(tableName, data);
            });

            if (data.length) {
                if (logUpdates) console.log(`Airtable # Updates complete for table ${chalk.bold(tableName)} - ${data.length} records updated.`);
            }

            customTableUpdate(tableName, Cache);
        } catch (e) { console.error("Airtable error", e); }
    }, pollRate);

    setInterval(async function() {

    }, pollRate * 10);
}

function t(ms) {
    return new Promise((res) => {
        setTimeout(res, ms);
    });
}

async function sync() {
    for (let table of tables) {
        // await t(1000);
        await processTableData(table, await getAllTableData(table));
        setInterval(async () => processTableData(table, await getAllTableData(table)), 30 * 1000);
        registerUpdater(table);
    }
}

sync();
// setInterval(sync, 5 * 1000);

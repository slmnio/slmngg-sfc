const algoliasearch = require("algoliasearch");
require("dotenv").config();
const client = algoliasearch(process.env.ALGOLIA_APPLICATION_ID, process.env.ALGOLIA_ADMIN_KEY);

function addToQueue(id, data) {
    if (!Object.keys(dataToKeep).includes(data.__tableName)) return;

    queues[data.__tableName].set(id, data);
}

const dataToKeep = {
    "Players": ["name", "battletag", "discord_tag", "verified", "overwatch_icon", "pronunciation", "twitter_handle"],
    "Teams": ["name", "code", "event", "captains", "players", "game", "icon", "theme_color"]
};

const queues = [];

Object.keys(dataToKeep).forEach(tableName => queues[tableName] = new Map());


function transformData(airtableData) {

    let headersToKeep = dataToKeep[airtableData.__tableName];
    let slimData = {};
    headersToKeep.forEach(header => {
        slimData[header] = airtableData[header];
    });
    slimData.id = airtableData.id;

    return {
        ...slimData,
        objectID: slimData.id
    };
}

async function uploadBatch() {
    for (const tableName of Object.keys(dataToKeep)) {
        let queue = queues[tableName];
        if (queue.size === 0) continue;

        console.log(`[Algolia] Uploading ${queue.size} ${tableName} records`);
        const index = client.initIndex(tableName);

        let data = [...queue.values()].map(transformData);
        queues[tableName] = new Map();

        await index.saveObjects(data).wait().then(res => {
            console.log(`[Algolia] Result for ${tableName}`, res);
        });
    }
}

setInterval(() => uploadBatch(), 15*1000);

module.exports = {
    addToQueue
};

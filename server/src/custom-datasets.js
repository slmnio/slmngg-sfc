/*
* Functions to create custom datasets as we load data
* */

function tableUpdated(tableName, Cache) {
    if (tableName === "Matches") matchUpdate(Cache);
}
module.exports = tableUpdated;

async function matchUpdate(Cache) {
    let allMatches = await Cache.get("Matches");
    if (!allMatches.ids) return;
    let liveMatches = (await Promise.all(allMatches.ids.map(id => (Cache.get(id.slice(3)))))).filter(match => match.live);
    Cache.set("special:live-matches", { matches: liveMatches.map(m => m.id) });
}

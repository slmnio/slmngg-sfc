/*
* Functions to create custom datasets as we load data
* */

function tableUpdated(tableName, Cache) {
    if (tableName === "Matches") matchUpdate(Cache);
    if (tableName === "Players") playerList(Cache);
}
module.exports = tableUpdated;

async function matchUpdate(Cache) {
    let allMatches = await Cache.get("Matches");
    if (!allMatches.ids) return;
    let liveMatches = (await Promise.all(allMatches.ids.map(id => (Cache.get(id.slice(3)))))).filter(match => match.live);
    Cache.set("special:live-matches", { matches: liveMatches.map(m => m.id) });
}

async function playerList(Cache) {
    // TODO: one problem: cache won't show removals - this is a site-wide issue
    let allPlayers = await Cache.get("Players");
    if (!allPlayers.ids) return;
    let players = (await Promise.all(allPlayers.ids.map(id => (Cache.get(id.slice(3))))));


    players = players.map(p => ({
        id: p.id,
        name: p.name,
        verified: !!p.verified
    })).filter(p => p.name);

    Cache.set("special:players", { players });
}

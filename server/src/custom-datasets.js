/*
* Functions to create custom datasets as we load data
* */

function tableUpdated(tableName, Cache) {
    if (tableName === "Matches") matchUpdate(Cache);
    if (tableName === "Broadcasts") broadcastUpdate(Cache);
    if (tableName === "Players") playerList(Cache);
}
module.exports = tableUpdated;

async function matchUpdate(Cache) {
    let allMatches = await Cache.get("Matches");
    if (!allMatches.ids) return;
    let liveMatches = (await Promise.all(allMatches.ids.map(id => (Cache.get(id.slice(3)))))).filter(match => match.live);
    Cache.set("internal:live-matches", { matches: liveMatches.map(m => m.id) });
}

async function broadcastUpdate(Cache) {
    // all broadcasts
    let allBroadcasts = await Cache.get("Broadcasts");
    if (!allBroadcasts.ids) return;
    let broadcasts = (await Promise.all(allBroadcasts.ids.map(id => Cache.get(id.slice(3)))));
    let matchIDs = broadcasts.filter(b => b.advertise && b.live_match).map(b => b.live_match[0]);

    // also find matches
    let liveMatches = await Cache.get("internal:live-matches");
    if (liveMatches?.matches?.length) {
        matchIDs = [
            ...matchIDs,
            ...liveMatches.matches
        ].filter((i, p, a) => a.indexOf(i) === p);
    }

    Cache.set("special:live-matches", { matches: matchIDs });
}

async function playerList(Cache) {
    // TODO: one problem: cache won't show removals - this is a site-wide issue
    let allPlayers = await Cache.get("Players");
    if (!allPlayers.ids) return;
    let players = (await Promise.all(allPlayers.ids.map(id => (Cache.get(id.slice(3))))));


    players = players.map(p => ({
        id: p.id,
        name: p.name,
        verified: !!p.verified,
        pro: p.pro
    })); //.filter(p => p.name);

    const publicPlayers = [];
    const proPlayers = [];

    players.forEach(player => {
        if (!player.name) return;
        if (player.pro) return proPlayers.push(player);
        publicPlayers.push(player);
    });

    Cache.set("special:players", { players: publicPlayers });
    Cache.set("special:pro-players", { players: proPlayers });
}

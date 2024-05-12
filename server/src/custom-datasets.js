/*
* Functions to create custom datasets as we load data
* */

export default function tableUpdated(tableName, Cache) {
    if (tableName === "Matches") matchUpdate(Cache);
    if (tableName === "Broadcasts") broadcastUpdate(Cache);
    if (tableName === "Players") playerList(Cache);
    if (["Teams", "Events"].includes(tableName)) teamList(Cache);
    if (tableName === "Events") publicEvents(Cache);
    // TODO: maybe add discord bots here?
}

async function publicEvents(Cache) {
    let allEvents = await Cache.get("Events");
    if (!allEvents?.ids) return;

    let allEventData = (await Promise.all(allEvents.ids.map(id => (Cache.get(id.slice(3))))));
    let liveEvents = allEventData.filter(event => event.show_in_events && event.teams && event.teams.length !== 0)
        .sort(function (a, b) {
            if (!a || !b) return 0;
            if (!a) return 1;
            if (!b) return -1;

            if (a.start_date && b.start_date) {
                return (new Date(a.start_date) - new Date(b.start_date));
            }
            if (a.start_date) return -1;
            if (b.start_date) return 1;
        });

    Cache.set("special:public-events", { events: liveEvents.map(m => m.id), __tableName: "Special Collection" });
}

async function matchUpdate(Cache) {
    let allMatches = await Cache.get("Matches");
    if (!allMatches.ids) return;

    let allMatchData = (await Promise.all(allMatches.ids.map(id => (Cache.get(id.slice(3))))));
    let liveMatches = allMatchData.filter(match => match.live);
    Cache.set("internal:live-matches", { matches: liveMatches.map(m => m.id), __tableName: "Internal Collection" });

    let allLiveMatchIDs = (await Cache.get("special:live-matches")).matches;

    const eventCache = {};

    await Promise.all(allMatchData.map(async(match) => {
        if (!match.event) return;
        let eventID = match.event?.[0];
        if (eventCache[eventID]) return;

        eventCache[eventID] = await Cache.get(eventID);
    }));

    let upcomingMatches = allMatchData.filter(match => {
        // need matches that are:
        // - live right now (.live)
        // - scheduled to be live soon
        // - scheduled to be live recently but it should in its duration (ie it's 5:30pm on a 5:00pm match with 60m duration)

        if (match.first_to && (match.score_1 === match.first_to || match.score_2 === match.first_to)) return false; // remove completed matches

        if (!match.start) return false;

        if (!match.event?.[0]) return false;
        if (!eventCache[match.event[0]]?.show_in_events) return false;

        if (allLiveMatchIDs.includes(match.id)) return true;

        let start = new Date(match.start).getTime();
        let diff = new Date() - start;

        // between now and 8 days from now
        if (diff < 0 && Math.abs(diff) > (8 * 24 * 60 * 60 * 1000)) return true;


        let scheduledInProgress = diff <= (match.duration || 60) * 60 * 1000;
        if (scheduledInProgress) return true;


        return false;
    }).sort((a,b) => new Date(a.start) - new Date(b.start));

    Cache.set("special:upcoming-matches", { matches: upcomingMatches.map(m => m.id), __tableName: "Special Collection" });
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

    Cache.set("special:live-matches", { matches: matchIDs, __tableName: "Special Collection" });
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

    Cache.set("special:players", { players: publicPlayers, __tableName: "Special Collection" });
    Cache.set("special:pro-players", { players: proPlayers, __tableName: "Special Collection" });
}

async function teamList(Cache) {
    const allTeams = await Cache.get("Teams");
    if (!allTeams.ids) return;
    let teams = (await Promise.all(allTeams.ids.map(id => Cache.get(id.slice(3)))));
    const allEvents = await Cache.get("Events");
    if (!allEvents.ids) return;
    let events = (await Promise.all(allEvents.ids.map(id => Cache.get(id.slice(3)))));

    const publicTeams = [];
    teams.forEach(team => {
        // if (!team.event.show_in_events) return false;
        const eventID = team.event?.[0];
        if (!eventID) return;
        const event = events.find(e => e.id === eventID);
        if (!event) return;
        if (!event.show_in_events) return;
        publicTeams.push({
            id: team.id,
            name: team.name,
            code: team.code,
            theme: team.theme?.[0],
            event: eventID,
            eventStart: event.start_date
        });
    });
    Cache.set("special:teams", { teams: publicTeams, __tableName: "Special Collection" });
}

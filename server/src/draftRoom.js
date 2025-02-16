import * as Cache from "./cache.js";
import { createRecord, dirtyID, getMaps, updateRecord } from "./action-utils/action-utils";

export default async (event, matchID, ...args) => {
    if (["team_hover", "join"].includes(event)) return;
    const match = await Cache.get(matchID);
    const maps = (await getMaps(match)).map((map, i) => ({ ...map, number: map.number || i + 1 })).filter((map) => !map.banner);
    let currentMap = maps.find((m) => !(m.draw || m.winner));
    if (!currentMap) {
        const res = (await createRecord(Cache, "Maps", [{
            "Match": [dirtyID(matchID)],
            "Map": ["recqo2tU65J4tCCCf"],
        }]));
        if (res.error) {
            throw "Airtable Error";
        }
        currentMap = res[0];
    }

    const updates = {};
    if (event === "swap_sides") {
        updates["Flip Pick Ban Order"] = !(currentMap.flip_pick_ban_order || false);
    } else if (event === "draft_start") {
        console.log("[match draft]", `${matchID} starting draft on ${currentMap.id}`);
    } else if (event === "team_lock") {
        const [{ team, pickBan, hero }] = args;
        const teamIdx = match.teams.indexOf(dirtyID(team)) + 1;
        const pb = pickBan.type === "pick" ? "Picks" : "Bans";
        const key = `Team ${teamIdx} ${pb}`;
        const cKey = `team_${teamIdx}_${pb.toLowerCase()}`;
        const existing = currentMap[cKey] || [];
        updates[key] = [...existing, dirtyID(hero.id)];
    };

    await updateRecord(Cache, "Maps", currentMap, updates);
};
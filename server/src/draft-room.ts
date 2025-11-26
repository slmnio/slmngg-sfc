import * as Cache from "./cache.js";
import { createRecord, updateRecord } from "./action-utils/action-utils";
import { dirtyID } from "shared";
import { get } from "./action-utils/action-cache.js";
import { MatchResolvableID } from "./types.js";
import { Server, Socket } from "socket.io";

type DraftRoomEvent = "team_ready" | "swap_sides" | "draft_start" | "team_hover" | "team_lock" | "join";

export function socketConnection(socket: (Socket & { _draftRoom?: MatchResolvableID }), io: Server) {
    socket.on("match_draft", async (event: DraftRoomEvent, matchId: MatchResolvableID, ...args) => {
        if (event === "join") {
            if (socket._draftRoom) {
                socket.leave(`match:draft-${socket._draftRoom}`);
            }
            socket._draftRoom = matchId;
            socket.join(`match:draft-${matchId}`);
            return;
        }
        await handleEvent(event, matchId, ...args);

        // TODO: these events need to be emitted inside the event handler
        io.to(`match:draft-${matchId}`).emit(event, ...args);
    });
}

export async function handleEvent(event: Omit<DraftRoomEvent, "join">, matchID: MatchResolvableID, ...args: any[]) {
    if (event === "team_hover") return;
    const match = await get(matchID);
    const matchEvent = match?.event?.[0] ? await get(match?.event?.[0]) : null;

    if ((match.teams || []).length !== 2) throw "Match does not have 2 teams for draft room";

    const maps = (await Promise.all((match.maps || []).map(id => get(id)))).filter((map) => !map.banner);

    let currentMap = maps.find((m) => !(m.draw || m.winner));
    if (!currentMap) {

        const defaultMaps = {
            "Deadlock": "recqo2tU65J4tCCCf",
            "League of Legends": "recUsjzMTPne2UoRx"
        };
        let defaultMap;

        // because of superset reasons TS struggles with narrowing keys here
        // const defaultGames = Object.keys(defaultMaps) as (keyof typeof defaultMaps)[];

        if (matchEvent?.game && matchEvent?.game === "Deadlock" || matchEvent?.game === "League of Legends") {
            defaultMap = defaultMaps[matchEvent?.game] || null;
        }

        const res = (await createRecord(Cache, "Maps", [{
            "Match": [dirtyID(matchID)],
            ...(defaultMap ? {"Map": [defaultMap]} : {})
        }]));
        if ("error" in res) {
            throw "Airtable Error";
        }
        // @ts-expect-error not using this file
        currentMap = res[0];
    }

    if (!currentMap) return console.warn("[draft] No currentMap even after creation attempt");

    const updates: { [key: string]: any } = {};
    if (event === "swap_sides") {
        updates["Flip Pick Ban Order"] = !(currentMap.flip_pick_ban_order || false);
    } else if (event === "draft_start") {
        console.log("[match draft]", `${matchID} starting draft on ${currentMap.id}`);
    } else if (event === "team_lock") {
        const [{ team, pickBan, hero }] = args;
        const teamIdx = ((match.teams || []).indexOf(dirtyID(team)) + 1) as 1 | 2;

        const pb = pickBan.type === "pick" ? "Picks" : "Bans";
        const pbKey  = pb.toLowerCase() as "picks" | "bans";

        const key: keyof typeof currentMap = `team_${teamIdx}_${pbKey}`;
        const airtableKey = `Team ${teamIdx} ${pb}`;
        const existing = currentMap[key] || [];
        updates[airtableKey] = [...existing, dirtyID(hero.id)];
    }

    if (currentMap && Object.keys(updates).length) {
        // TODO: some sort of auth needed here
        await updateRecord(Cache, "Maps", currentMap, updates);
    } else {
        console.warn("[draft] Can't update map", updates);
    }
}

import { get } from "./action-utils/action-cache";
import { Express } from "express";
import { AnyAirtableID, BroadcastResolvableID } from "./types";


function cleanID(id: any) {
    if (!id) return null;
    if (typeof id !== "string") return id.id || null; // no real id oops
    if (id.startsWith("rec") && id.length === 17) id = id.slice(3);
    return id;
}

function niceJoin(array: string[]) {
    if (array.length > 1) {
        const last = array.pop();
        return array.join(", ") + " and " + last;
    }
    return array[0];
}


async function getBroadcast(streamURL: string) {
    const broadcastIDs = ((await get("Broadcasts"))?.ids as AnyAirtableID[] || []).map(id => cleanID(id)) as BroadcastResolvableID[];
    if (!broadcastIDs) return { "error": true as const, "message": "No broadcast data is available right now. Check https://slmn.gg for information." };
    const broadcasts = await Promise.all(broadcastIDs.map(id => get(id)));

    if (!broadcasts) return { "error": true as const, "message": "No broadcast data is available right now. Check https://slmn.gg for information." };
    const broadcast = broadcasts.find(b => b.active && b.stream_link && b.stream_link.toLowerCase() === streamURL.toLowerCase());
    return { "error": false as const, data: broadcast};
}


async function getLiveMatch(streamURL: string) {
    const broadcastData = await getBroadcast(streamURL);
    if (broadcastData.error) return { "error": true as const, message: broadcastData.message };
    if (!broadcastData || !broadcastData.data) return { "error": true as const, "message": "No broadcast data is available right now. Check https://slmn.gg for information." };
    const broadcast = broadcastData.data;

    if (!broadcast.live_match || broadcast.live_match.length === 0) return { "error": true as const, "message": "No match is live." };

    const live_match = await get(broadcast.live_match[0]);
    if (!live_match) return { "error": true as const, "message": "No match is live." };
    return { "error": false as const, data: live_match};
}


export default ({app}: { app: Express }) => {
    // @ts-expect-error TODO: needs some TS tinkering to have nice Request<> stuff
    app.get("/casters", async (req, res) => {
        try {
            const streamLink = req.query.stream;
            if (!streamLink) return res.send("The 'stream' query is required.");
            if (typeof streamLink !== "string") return res.send("The 'stream' query must be only one stream URL.");

            const matchRequest = await getLiveMatch(streamLink);
            if (matchRequest.error) return res.send(matchRequest.message);
            const liveMatch = matchRequest.data;

            if (!liveMatch.casters || liveMatch.casters.length === 0) return res.send("No casters are linked to this match.");

            const casterText = [];

            for (const casterID of liveMatch.casters) {
                const caster = await get(casterID);
                if (!caster?.name) continue;

                const socials = await Promise.all((caster.socials || []).map(id => get(id)));
                const promotedSocial = socials.find(s => s.type === "Bluesky") || socials.find(s => s.type === "Bluesky");

                if (!promotedSocial?.url) {
                    casterText.push(caster.name);
                } else {
                    casterText.push(`${caster.name}: ${promotedSocial.url.replace("https://", "").toLowerCase()}`);
                }
            }

            return res.send(`Your casters for this match are ${niceJoin(casterText)}`);
        } catch (e) {
            console.error(e);
            return res.send("An error occurred loading data");
        }
    });
};
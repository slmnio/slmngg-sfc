import client from "./client.js";
import { ActivityType } from "discord-api-types/v10";
import { Snowflake } from "discord-api-types/globals";
import { get } from "../action-utils/action-cache.js";
import { EventResolvableID, Match, Player, TeamResolvableID } from "../types.js";
import { MapObject } from "./managers.js";
import { auth, cacheStatusEmitter, set } from "../cache.js";
import { Activity, Presence } from "discord.js";

const playerStreams = new Map<Snowflake, any>();

cacheStatusEmitter.on("flags", (flags) => {
    console.log("#### Flags emitter", flags);
    if (flags.length === 0) {
        processAllCachedPresences();
    }
});

client.on("ready", () => {
    console.log("Ready to calculate streaming");

    console.log(client.users.cache.size);

    [...client.guilds.cache.values()].forEach(guild => console.log(`${guild.id} ${guild.name}`));
});

async function getEventFromGuild(guildID: Snowflake) {
    const eventIDs = ((await get("Events"))?.ids || []) as EventResolvableID[];
    const events = await Promise.all(eventIDs.map(id => get(id)));

    return events.find(event => {
        if (!event.in_progress) return;
        if (!event.discord_control) return;
        const eventDiscord = new MapObject(event.discord_control);
        return eventDiscord.get("guild_id") === guildID;
    });
}

async function getCurrentMatches(teamIDs: TeamResolvableID[]) {
    const teams = await Promise.all(teamIDs.map(get));
    return (await Promise.all(teams.map(async team => (await Promise.all((team.matches || []).map(get))).filter(match => {
        if (!match.start) return false;
        const startDetection = (new Date(match.start)).getTime() - (15 * 60 * 1000); // 15 minutes before
        const duration = match.duration || ((match.first_to || 2) * 30) * 60 * 1000;
        const endDetection = (new Date(match.start)).getTime() + duration + (15 * 60 * 1000); // 15 minutes after
        const now = (new Date()).getTime();

        // console.log(match?.id, match?.name, { startDetection, endDetection, duration, now });

        return now > startDetection && now < endDetection;
    })))).flat();
}

async function detectLiveMatch(matches: Match[], streaming: Activity[]) {
    if (matches.length === 1) {
        // yippee we found a match
        return matches[0];
    } else if (matches.length > 1) {
        // oh they're one of those guys
        const twitchTitle = streaming.find(a => ["Twitch", "YouTube"].includes(a.name) && a.details)?.details;
        if (!twitchTitle) return; // oh jeez idk

        for (const match of matches) {
            const teams = await Promise.all((match.teams || []).map(get));
            if (teams.some(t => t?.name && twitchTitle?.toLowerCase().includes(t.name?.toLowerCase()))) {
                // yippee we found a match
                return match;
            }
        }
        for (const match of matches) {
            const teams = await Promise.all((match.teams || []).map(get));
            if (teams.some(t => t?.code && twitchTitle?.toLowerCase().includes(t.code?.toLowerCase()))) {
                // yippee we found a match
                return match;
            }
        }
    }
}

async function getMatchFromPresence(presence: Presence) {
    const streaming = presence?.activities?.filter(activity => [ActivityType.Streaming, ActivityType.Competing].includes(activity?.type));
    if (!streaming.length) return; // not streaming
    // console.log(presence?.guild?.name, presence?.guild?.id);
    // console.log(presence?.user?.username, presence?.user?.id);


    if (!presence.guild) return;
    const event = await getEventFromGuild(presence.guild.id);
    if (!event) return;

    const player = await auth.getPlayer(presence.userId) as Player | undefined;
    if (!player) return;

    const playerEventTeams = ([
        ...(player.member_of || []),
        ...(player.captain_of || []),
        ...(player.owned_teams || []),
        ...(player.team_staff || []),
    ]).filter((v, i, a) => a.indexOf(v) === i)
        .filter(playerTeamID => (event.teams || []).includes(playerTeamID));

    if (!playerEventTeams?.length) return; // not in teams in this event

    // console.log(streaming);

    // TODO: something to revalidate presences

    const matches = await getCurrentMatches(playerEventTeams);
    const match = await detectLiveMatch(matches, streaming);
    if (!match) return;
    console.log(event?.name, player?.name, match?.name, streaming?.[0]?.state, streaming?.[0]?.details, streaming?.[0]?.url);

    const playerTeamID = match?.teams?.length ? match.teams.find(teamID => playerEventTeams.includes(teamID)) : null;

    return {
        match, player, event, user: presence.user, teamID: playerTeamID, url: streaming?.[0]?.url
    };
}

export async function processAllCachedPresences() {
    console.log("Processing presences");
    client.guilds.cache.each(guild => {
        guild.members.cache.each((member) => {
            const stream = (member.presence?.activities || []).find(a => a.type === ActivityType.Streaming);
            if (member.presence && stream) {
                console.log(`Processing presence ${member?.id} ${member?.user?.username}`, stream?.url, stream?.details, stream?.state);
                return processPresences(null, member.presence);
            }
        });
    });
}

async function processPresences(oldPresence: Presence | null, newPresence: Presence) {
    const oldMatch = oldPresence ? await getMatchFromPresence(oldPresence) : null;
    const newMatch = await getMatchFromPresence(newPresence);


    if (oldMatch?.match?.id !== newMatch?.match?.id) {
        // unset old, set new
        console.log(`setting ${oldMatch?.match?.id} to ${newMatch?.match?.id}`, oldPresence?.userId || newPresence.userId);
        playerStreams.delete(oldPresence?.userId || newPresence.userId);

        await set("special:player-streams", {
            streams: [...playerStreams.values()].map(({ match, player, event, teamID, user, url }) => ({
                match: match?.id,
                event: event?.id,
                player: player?.id,
                team: teamID,
                url
            })),
            __tableName: "Special Collection"
        });
    }

    if (newMatch?.match?.id && newMatch?.user?.id) {
        playerStreams.set(newMatch.user.id, newMatch);
        console.log(playerStreams.size);
        await set("special:player-streams", {
            streams: [...playerStreams.values()].map(({ match, player, event, teamID, user, url }) => ({
                match: match?.id,
                event: event?.id,
                player: player?.id,
                team: teamID,
                url
            })),
            __tableName: "Special Collection"
        });
    }
}

client.on("presenceUpdate", async (oldPresence, newPresence) => {
    return processPresences(oldPresence, newPresence);
});

import spacetime from "spacetime";
import informal from "spacetime-informal";
import { sortEvents, sortTeams } from "@/utils/sorts";

export function getImage (i) {
    // console.log(i);
    if (!i) return null;
    return i[0].url;
}

export function url (page, record, options = {}) {
    if (record && record.id) record.id = cleanID(record.id);

    if (this.$root.minisiteEvent &&
        this.$root.minisiteEvent._original_data_id === record.id &&
        page === "event") {
        return `${(options && options.subPage) ? `/${options.subPage}` : "/"}`;
    }

    let domain = "";

    const subdomain = options.subdomain || options.partial_subdomain;
    if (options.subdomain === options.partial_subdomain) {
        options.partial_subdomain = null;
    }

    if (page === "event" && subdomain) {
        const pageURL = window.location.origin.split("://");
        domain = `${pageURL[0]}://${subdomain}.${pageURL[1]}${(options && options.subPage) ? `/${options.subPage}` : ""}`;
    }

    if (domain) {
        // these are almost always use in vue router-link components and can't have external links
        let url;
        if (options.partial_subdomain) {
            // use /event/x
            url = `${domain}/${page}/${record.id}${(options && options.subPage) ? `/${options.subPage}` : ""}`;
        } else if (options.subdomain && page === "event") {
            // just use /
            url = `${domain}/${(options && options.subPage) || ""}`;
        }
        // return `/redirect?url=${url}`;
        return url;
    }
    return `/${page}/${record.id}${(options && options.subPage) ? `/${options.subPage}` : ""}`;
}

export function image (theme, key) {
    return `url(${getImage(theme[key])})`;
}

function resizedImage(theme, key, minSize = 30) {
    if (!theme || !theme[key] || !theme[key][0]) return "";
    const image = theme[key][0];
    if (!image.thumbnails) return image.url;
    const candidates = Object.values(image.thumbnails)
        .sort((a, b) => a.height - b.height)
        .filter((thumb) => thumb.height >= minSize && thumb.width >= minSize);
    if (candidates.length) return candidates[0].url; // get smallest that fits minSize
    return image.url;
}

export function cleanID (id) {
    if (id?.id) return id.id;
    // console.log(">id", id);
    if (!id) return null;
    if (typeof id !== "string") return null;
    if (id.startsWith("rec") && id.length === 17) id = id.slice(3);
    return id;
}
export function dirtyID(id) {
    // add rec
    if (!id) return id;
    if (id.length === 14) return "rec" + id;
    return id;
}

export function cssImage(cssVar, theme, keys, minSize = 30, useResizer = true) {
    const url = multiImage(theme, keys, minSize, useResizer);
    const css = {};
    if (url) {
        css[cssVar] = `url(${url})`;
    }
    return css;
}

export function multiImage(theme, keys, minSize = 30, useResizer = true) {
    let url;
    if (useResizer) {
        url = keys.map(key => resizedImage(theme, key, minSize)).find(u => !!u);
    } else {
        url = keys.map(key => getImage(theme[key])).find(u => !!u);
    }
    return url || null;
}

export function getMatchContext(match) {
    const text = [];
    let out = "";

    out = (match?.event?.short || match?.event?.name || "");

    // sub_event: round
    // week_text: round
    // week
    //

    text.push(match?.sub_event || "");
    if (!(text.length >= 1 && match.round)) text.push(match?.week_text || "");
    text.push(match?.round || "");
    // text.push(match?.sub_event || ""); // round > sub_event
    text.push((match?.week && (!match?.week_text) && `Week ${match?.week}`) || ""); // basically regular season
    const pieces = text.filter((t, i, a) => !!t && a.indexOf(t) === i);
    return out + (pieces.length > 0 ? ": " : "") + pieces.join(" · ");
}

export function getRoleSVG(name) {
    if (name === "Tank") {
        return `<svg id="role_tank" style="fill:currentColor" viewBox="0 0 64 64" width="100%" height="100%">
<path d="M51.4,24.1c0,3.1,0,6.2,0,9.3a4.7,4.7,0,0,1-.6,2.4A57.2,57.2,0,0,1,33.2,55.5a1.8,1.8,0,0,1-2.4,0A57.4,57.4,0,0,1,13.2,36a5.5,5.5,0,0,1-.7-2.8c0-5.8.1-11.7,0-17.5-.1-4.2,3.2-4.9,6.1-5.6A59.4,59.4,0,0,1,32.9,8C37.5,8,44.5,9.6,47,10.4s4.1,1.4,4.3,3.3.1,3.2.1,4.9,0,3.7,0,5.5Z"/>
</svg>`;
    }
    if (["Damage", "DPS"].includes(name)) {
        return `<svg id="role_offense" style="fill:currentColor" viewBox="0 0 64 64" width="100%" height="100%">
<rect class="cls-1" x="12" y="49.3" width="10.2" height="5.61"/>
<path class="cls-1" d="M22.2,19.1a10.2,10.2,0,0,0,0-1c-.8-6.9-5.1-9-5.1-9s-4.3,2.1-5.1,9c0,.3,0,1,0,1V45.4H22.2Z"/>
<rect class="cls-1" x="26.9" y="49.3" width="10.2" height="5.61"/>
<path class="cls-1" d="M37.1,19.1a10.2,10.2,0,0,0,0-1C36.3,11.2,32,9,32,9s-4.3,2.1-5.1,9c0,.3,0,1,0,1V45.4H37.1Z"/>
<rect class="cls-1" x="41.8" y="49.3" width="10.2" height="5.61"/>
<path class="cls-1" d="M52,19.1s0-.8,0-1c-.8-6.9-5.1-9-5.1-9s-4.3,2.1-5.1,9c0,.3,0,1,0,1V45.4H52Z"/>
</svg>`;
    }
    if (name === "Flex") {
        return `<svg id="role_flex" style="fill:currentColor" viewBox="0 0 64 64" width="100%" height="100%">
<path d="M18.55,32.89h0a13.17,13.17,0,0,1,1.77-5.17c.13-.23.5-.6.11-1a15.68,15.68,0,0,1-2.11-4.19.5.5,0,0,0-.89-.19A18.41,18.41,0,0,0,13,34.17h0a9.9,9.9,0,1,0,5.59-1.28Z"/>
<path d="M27,26.85a9.89,9.89,0,0,0,13.16-3h0A13.17,13.17,0,0,1,43.75,28c.13.23.27.73.81.6a15.68,15.68,0,0,1,4.68.28.5.5,0,0,0,.61-.67,18.41,18.41,0,0,0-8-9.82h0A9.9,9.9,0,1,0,27,26.85Z"/>
<path d="M54.73,37.87a9.89,9.89,0,0,0-17.52,9.18h0a13.17,13.17,0,0,1-5.37,1c-.27,0-.76-.14-.92.4a15.67,15.67,0,0,1-2.6,3.9.5.5,0,0,0,.27.87,18.41,18.41,0,0,0,12.51-2h0A9.9,9.9,0,0,0,54.73,37.87Z"/>
</svg>`;
    }
    if (name === "Support") {
        return `<svg id="role_support" style="fill:currentColor" viewBox="0 0 64 64" width="100%" height="100%">
<path d="M51.9,23.2H40.8V12.1A4.1,4.1,0,0,0,36.7,8H27.3a4.1,4.1,0,0,0-4.1,4.1V23.2H12.1A4.1,4.1,0,0,0,8,27.3v9.4a4.1,4.1,0,0,0,4.1,4.1H23.2V51.9A4.1,4.1,0,0,0,27.3,56h9.4a4.1,4.1,0,0,0,4.1-4.1V40.8H51.9A4.1,4.1,0,0,0,56,36.7V27.3A4.1,4.1,0,0,0,51.9,23.2Z"/>
</svg>`;
    }
    if (name === "Staff") return "<i style'color:currentColor' class=\"fas fa-user-tie fa-fw\"></i>";
    if (name === "Staff") {
        return `<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
 viewBox="0 0 25.916 25.916" style="fill:currentColor;enable-background:new 0 0 25.916 25.916;" xml:space="preserve">
<g>
<g>
<path d="M7.938,8.13c0.09,0.414,0.228,0.682,0.389,0.849c0.383,2.666,2.776,4.938,4.698,4.843
c2.445-0.12,4.178-2.755,4.567-4.843c0.161-0.166,0.316-0.521,0.409-0.938c0.104-0.479,0.216-1.201-0.072-1.583
c-0.017-0.02-0.127-0.121-0.146-0.138c0.275-0.992,0.879-2.762-0.625-4.353c-0.815-0.862-1.947-1.295-2.97-1.637
c-3.02-1.009-5.152,0.406-6.136,2.759C7.981,3.256,7.522,4.313,8.078,6.32C8.024,6.356,7.975,6.402,7.934,6.458
C7.645,6.839,7.833,7.651,7.938,8.13z"/>
<path d="M23.557,22.792c-0.084-1.835-0.188-4.743-1.791-7.122c0,0-0.457-0.623-1.541-1.037
c0,0-2.354-0.717-3.438-1.492l-0.495,0.339l0.055,3.218l-2.972,7.934c-0.065,0.174-0.231,0.289-0.416,0.289
s-0.351-0.115-0.416-0.289l-2.971-7.934c0,0,0.055-3.208,0.054-3.218c0.007,0.027-0.496-0.339-0.496-0.339
c-1.082,0.775-3.437,1.492-3.437,1.492c-1.084,0.414-1.541,1.037-1.541,1.037c-1.602,2.379-1.708,5.287-1.792,7.122
c-0.058,1.268,0.208,1.741,0.542,1.876c4.146,1.664,15.965,1.664,20.112,0C23.35,24.534,23.614,24.06,23.557,22.792z"/>
<path d="M13.065,14.847l-0.134,0.003c-0.432,0-0.868-0.084-1.296-0.232l1.178,1.803l-1.057,1.02
l1.088,6.607c0.009,0.057,0.058,0.098,0.116,0.098c0.057,0,0.106-0.041,0.116-0.098l1.088-6.607l-1.058-1.02l1.161-1.776
C13.888,14.756,13.487,14.83,13.065,14.847z"/>
</g>
</g></svg>`;
    }
    if (name === "Captain") return "<i style'color:currentColor' class=\"fas fa-user-crown fa-fw\"></i>";
    if (name === "Manager") return "<i style'color:currentColor' class=\"fas fa-clipboard-list fa-fw\"></i>";
    if (name === "Coach") return "<i style'color:currentColor' class=\"fas fa-whistle fa-fw\"></i>";

    return "";
}

export function getMapData(match, mapSet, { showBannedMaps = false }) {
    const firstTo = match.first_to;
    let maps = [...(match.maps || [])];
    if (!firstTo) return maps; // can't predict if we don't know first_to
    maps = maps.filter(m => m.map); // hide things without map objects

    if (!showBannedMaps) {
        maps = maps.filter(m => !(m.banner || m.banned));
    }

    const neededMapCount = likelyNeededMaps(match);
    const dummyMapCount = neededMapCount - maps.length;
}

export function money(num) {
    return `$${num || 0}k`;
}

export function getAuctionMax() {
    return 7;
}

export function clarifyTeam(team) {
    if (team.event && team.event.clarify_teams && team.event.short) {
        return `${team.name} (${team.event.short})`;
    }
    return team.name;
}

export function pronounsFilter(pronouns) {
    if (pronouns === "any") return "any pronouns";
    return pronouns;
}

export function textSort(a, b) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
}

export function likelyNeededMaps(match) {
    const scores = [match.score_1, match.score_2].map(s => s || 0);

    // how many maps have a winner marked
    const playedMaps = (match.maps || []).filter(m => m.winner).length;

    // how many maps each team needs to win to complete
    const toWin = scores.map(s => match.first_to - s);

    // how many maps could be played with no draws
    const withoutDraws = (match.first_to * 2) - 1;

    const draws = (match?.maps || []).filter(m => m.draw).length;

    // if match is over (scores.some s == match.first_to)

    // minimum (first to x2) -1

    // currently played + 1 (tiebreakers, draws etc)

    console.log({ playedMaps, toWin, withoutDraws, draws });

    return withoutDraws + draws;
}

export const DefaultMapImages = {
    Assault: "https://cdn.discordapp.com/attachments/855517740914573342/868231135224819743/44684849494984.png",
    Escort: "https://cdn.discordapp.com/attachments/855517740914573342/868231132444000276/484444884949494949494948421651615641.png",
    Hybrid: "https://cdn.discordapp.com/attachments/855517740914573342/868231133765201950/448489494949849494949494949494949.png",
    Control: "https://cdn.discordapp.com/attachments/855517740914573342/868230457622396928/63541654456789487695.png",
    Push: "https://cdn.discordapp.com/attachments/855517740914573342/969692510249177098/puuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuush.png",
    Spike: "https://cdn.discordapp.com/attachments/880305022716481639/883811894463447110/newspikeplant.png",
    SpikeRush: "https://cdn.discordapp.com/attachments/880305022716481639/883809271198924840/spikerush_default.png",
    ValDeathmatch: "https://cdn.discordapp.com/attachments/880305022716481639/883809264261529670/valdeathmatch_default.png",
    Slayer: "https://media.discordapp.net/attachments/855517740914573342/913747752729595904/slayer.png",
    Strongholds: "https://media.discordapp.net/attachments/855517740914573342/913747753086107668/strongholds.png",
    CTF: "https://media.discordapp.net/attachments/855517740914573342/913747753392304158/ctf.png",
    Oddball: "https://media.discordapp.net/attachments/855517740914573342/913747753694269440/oddball.png",
    Flashpoint: "https://cdn.discordapp.com/attachments/855515391225102336/1145463994581254154/flashpoint.png"
};

export const MapTypeIcons = {
    Hybrid: "https://cdn.discordapp.com/attachments/1125871284702679041/1125907303867088896/180.png",
    Escort: "https://cdn.discordapp.com/attachments/1125871284702679041/1125907343893336097/180.png",
    Control: "https://cdn.discordapp.com/attachments/1125871284702679041/1125907374708903946/180.png",
    Push: "https://cdn.discordapp.com/attachments/1125871284702679041/1125908279537717392/Push.png",
    Assault: "https://cdn.discordapp.com/attachments/1125871284702679041/1125908385250934904/assault.png",
    Flashpoint: "https://media.slmn.io/flashpoint-crop.png"
};

export function getTeamsMapStats(teams, requestMatch, requestMap, filters) {
    console.log("get teams map stats", requestMatch, filters);
    if (!teams) return null;
    const stats = teams.map(team => {
        const stat = {
            played: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            unplayed: 0
        };

        const prevMatches = (team.matches || [])
            .filter(m => new Date(m.start) < new Date(requestMatch.start) && m.id !== requestMatch.id)
            .sort((a, b) => new Date(b.start) - new Date(a.start));

        const latestMatch = prevMatches.length ? prevMatches[0] : null;


        (team.matches || []).filter(m => {
            if (filters?.match_group) {
                console.log("match group", filters.match_group, m.match_group, filters.match_group !== m.match_group);
                if (filters.match_group !== m.match_group) return false;
            }
            if (filters?.sub_event) {
                console.log("sub event", filters.sub_event, m.sub_event, filters.sub_event !== m.sub_event);
                if (filters.sub_event !== m.sub_event) return false;
            }
            return true;
        }).forEach(match => {
            (match.maps || []).forEach(matchMap => {
                if (!matchMap.map) return; // no proper map data
                if (requestMap.id !== cleanID(matchMap.map[0])) return; // isn't this map

                if (requestMatch?.maps?.length) {
                    const scheduledMap = requestMatch.maps.find(m => m.name?.length && matchMap.name?.length && (m.name[0] === matchMap.name[0]));
                    console.log(matchMap.name, { scheduledMap, matchMap });
                    if (scheduledMap) stat.scheduled_for_match = true;
                }

                if (!(matchMap.draw || matchMap.winner || matchMap.banner)) {
                    // wasn't played fully
                    if ([match.score_1, match.score_2].includes(match.first_to)) stat.unplayed++;
                    return;
                }

                // woo right map

                stat.played++;
                if (matchMap.draw) {
                    stat.draws++;
                } else {
                    // determine winner
                    if (cleanID(matchMap.winner[0]) === team.id) {
                        stat.wins++;
                    } else {
                        stat.losses++;
                    }
                }


                if (latestMatch?.maps) {
                    // Check to see if the last played match played this map
                    const playedMap = latestMatch.maps.find(m => m.winner?.length && m.name?.length && matchMap.name?.length && (m.name[0] === matchMap.name[0]));
                    if (playedMap) stat.played_recently = true;
                }
            });
        });

        stat.score = stat.wins + (stat.losses * -0.25);
        return { stats: stat, team };
    });

    if (stats?.[0]?.stats?.score > stats?.[1]?.stats?.score) {
        stats[0].stats.score_winner = true;
    } else if (stats?.[0]?.stats?.score < stats?.[1]?.stats?.score) {
        stats[1].stats.score_winner = true;
    }

    console.log(stats);

    return {
        stats,
        meta: {
            eitherTeamPlayed: stats.some(t => t.stats?.played > 0),
            scheduledForMatch: stats.some(t => t.stats?.scheduled_for_match)
        }
    };
}

/**
 * @param {string?} stateTimezone - timezone from state
 * @returns {string} - proper timezone name
 */
export function getTimezone(stateTimezone) {
    return (stateTimezone === "local" || !stateTimezone) ? spacetime.now().timezone().name : stateTimezone;
}


/**
 * @param {string} timezone
 * @param {Spacetime} time
 * @returns {string} abbreviation
 */
export function getAbbrev(timezone, time) {
    timezone = getTimezone(timezone);
    const display = informal.display(timezone);
    return time.isDST() ? display.daylight.abbrev : display.standard.abbrev;
}

function getNoSunAbbreviation(abbrev) {
    const map = {
        PDT: "PT",
        PST: "PT",
        EDT: "ET",
        EST: "ET",
        BST: "UK",
        GMT: "UK"
    };
    return map[abbrev] ?? abbrev;
}


/**
 *
 * @param {ParsableDate | Date | number | Array<number> | string} timeString - spacetime parsable date/time string
 * @param {string?} tz - site timezone from store
 * @param {string?} format - override for format
 * @param {boolean?} use24HourTime - use 24 hour time
 * @returns {string}
 */
export function formatTime(timeString, { tz, use24HourTime = false, format = "{day-short} {date-ordinal} {month-short} {year} {time} {tz}" }) {
    const timezone = getTimezone(tz);
    const time = spacetime(timeString).goto(timezone);
    const abbrev = getAbbrev(timezone, time);
    return time.format(
        format
            .replace("{tz}", abbrev)
            .replace("{tz-no-sun}", getNoSunAbbreviation(abbrev))
            .replace("{time}", use24HourTime ? "{time-24}" : "{time}")
            .replace("{year-short-prev-only}", time.year() === spacetime.now().year() ? "" : "{year-short}")
            .trim()
    );
}


export function getEmbedData(url) {
    const vodURL = new URL(url);

    if (vodURL.host === "www.youtube.com") {
        let ts = 0;
        if (vodURL.searchParams.get("t")) {
            let timestamp = vodURL.searchParams.get("t");
            if (["h", "m", "s"].some(t => timestamp.includes(t))) {
                // has a hms in it
                timestamp = timestamp.match(/\d+[hms]/g);
                timestamp.forEach(t => {
                    const time = t.slice(0, -1);
                    const hms = t.slice(-1);
                    const mult = {
                        s: 1,
                        m: 60,
                        h: 60 * 60
                    };
                    ts += parseInt(time) * mult[hms];
                });
            } else {
                ts = timestamp;
            }
        }

        console.log(ts);

        return { service: "youtube", key: vodURL.searchParams.get("v"), timestamp: ts || null };
    }
    if (vodURL.host === "youtu.be") {
        return { service: "youtube", key: vodURL.pathname.slice(1), timestamp: vodURL.searchParams.get("t") || null };
    }
    if (["www.twitch.tv", "twitch.tv"].includes(vodURL.host)) {
        const embed = {
            service: (vodURL.pathname.split("/").length === 3 ? "twitch" : "twitch-live"),
            key: vodURL.pathname.slice(vodURL.pathname.lastIndexOf("/") + 1)
        };
        if (embed.service === "twitch") {
            embed.timestamp = vodURL.searchParams.get("t") || null;
        }
        return embed;
    }

    if (url.endsWith(".pdf")) {
        return {
            service: "pdf",
            url: url
        };
    }

    if (["mp4", "webm"].some(file => url.endsWith("." + file))) {
        return {
            service: "unknown-video",
            url: url
        };
    }

    return { service: "unknown", url: url };
}


export function unescapeText(text) {
    return text
        .replaceAll("&amp;", "&")
        .replaceAll("&lt;", "<")
        .replaceAll("&gt;", ">")
        .replaceAll("&quot;", "\"")
        .replaceAll("&#039;", "'");
}


export function createGuestObject(str) {
    const guest = {
        manual: true
    };

    str.split(/[,|]/).forEach(part => {
        if (!part) return;
        part = part.trim();

        if (part.startsWith("@")) {
            guest.twitter = part;
        } else if (part.includes("view=")) {
            guest.webcam = part;
        } else if (part.startsWith("http")) {
            guest.avatar = part;
        } else if (part.includes("/")) {
            guest.pronouns = part;
        } else {
            guest.name = part;
        }
    });
    return guest;
}

export function getGuestString(guest) {
    delete guest.manual;
    return Object.values(guest).join("|");
}

export function getAssociatedThemeOptions(player, valueFn) {
    let teams = [
        ...player.member_of || [],
        ...player.captain_of || [],
        ...player.team_staff || [],
        ...player.brands_designed || [],
        ...player.owned_teams || []
    ];
    let events = [
        ...player.event_staff || [],
        ...player.event_brands_designed || [],
        ...player.casted_events || []
    ];

    (player.player_relationships || []).forEach(rel => {
        if (rel.teams) {
            teams = [...teams, ...rel.teams];
        }
        if (rel.events) {
            events = [...events, ...rel.events];
        }
    });

    return [
        { value: null, disabled: true, text: "Choose a theme" },
        { label: "Teams", options: teams.filter((i, p, a) => a.map(x => x.id).indexOf(i.id) === p).sort(sortTeams).map((t) => ({ ...t, text: t.name, value: valueFn ? valueFn(t) : t.id })) },
        { label: "Events", options: events.filter((i, p, a) => a.map(x => x.id).indexOf(i.id) === p).sort(sortEvents).map((e) => ({ ...e, text: e.name, value: valueFn ? valueFn(e) : e.id })) }
    ];
}

export function autoRecord(team, stage) {
    console.log("auto record", team, stage);
    if (!stage) return null;

    const matches = team?.matches?.filter(m => m.match_group === stage);

    console.log(matches);
    if (!matches?.length) return null;

    let [wins, losses] = [0, 0];

    matches.forEach(m => {
        const scores = [m.score_1 || 0, m.score_2 || 0];
        if (!scores.some(s => s === m.first_to)) return; // not finished
        const won = scores[0] === m.first_to ? team.id === m.teams[0].id : team.id === m.teams[1].id;
        if (won) {
            wins++;
        } else {
            losses++;
        }
    });

    return [wins, losses].join(" - ");
}

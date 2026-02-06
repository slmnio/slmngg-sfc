import spacetime from "spacetime";
import informal from "spacetime-informal";
import { sortAlphaRaw, sortEvents, sortTeams } from "@/utils/sorts";
import { cleanID } from "shared";

import { computed } from "vue";

import assault from "@/assets/default-map-images/assault.png";
import escort from "@/assets/default-map-images/escort.png";
import hybrid from "@/assets/default-map-images/hybrid.png";
import control from "@/assets/default-map-images/control.png";
import push from "@/assets/default-map-images/push.png";
import spike from "@/assets/default-map-images/spike.png";
import spikeRush from "@/assets/default-map-images/spike_rush.png";
import valDeathmatch from "@/assets/default-map-images/val_deathmatch.png";
import slayer from "@/assets/default-map-images/slayer.png";
import strongholds from "@/assets/default-map-images/strongholds.png";
import ctf from "@/assets/default-map-images/ctf.png";
import oddball from "@/assets/default-map-images/oddball.png";
import flashpoint from "@/assets/default-map-images/flashpoint.png";
import clash from "@/assets/default-map-images/clash.png";

import hybridIcon from "@/assets/map-type-icons/hybrid.svg";
import escortIcon from "@/assets/map-type-icons/escort.svg";
import controlIcon from "@/assets/map-type-icons/control.svg";
import pushIcon from "@/assets/map-type-icons/push.svg";
import assaultIcon from "@/assets/map-type-icons/assault.svg";
import flashpointIcon from "@/assets/map-type-icons/flashpoint.svg";
import clashIcon from "@/assets/map-type-icons/clash.png";
import { useSettingsStore } from "@/stores/settingsStore";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";

export function getImage(i) {
    // console.log(i);
    if (!i) return null;
    return i[0].url;
}

export function url(page, record, options = {}) {
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

export function image(theme, key) {
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

export function getMatchContext(match, {
    light,
    split
} = {}) {
    let pieces;
    if (light) {
        pieces = [match?.sub_event].filter(Boolean);
    } else {
        pieces = [match?.division, match?.sub_event, match?.round || match?.week_text].filter(Boolean);
    }
    pieces = pieces.filter((v, i, a) => a.indexOf(v) === i);

    const eventPrefix = (match?.event?.short || match?.event?.name || "");
    const matchDetails = pieces.join(" · ");

    if (split) return [eventPrefix, matchDetails];

    return eventPrefix + (pieces.length ? ": " : "") + matchDetails;
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

    // if (name === "Duelist") return "<img class='temp-img-icon icon-marvel icon-duelist' src='https://media.slmn.io/Duelist_Icon.png'>";
    // if (name === "Strategist") return "<img class='temp-img-icon icon-marvel icon-strategist' src='https://media.slmn.io/Strategist_Icon.png'>";
    // if (name === "Vanguard") return "<img class='temp-img-icon icon-marvel icon-vanguard' src='https://media.slmn.io/Vanguard_Icon.png'>";

    if (name === "Duelist")    return "<div class='cut-icon icon-marvel icon-duelist' style='mask-image: url(https://media.slmn.io/Duelist_Icon.png)'></div>";
    if (name === "Strategist") return "<div class='cut-icon icon-marvel icon-strategist' style='mask-image: url(https://media.slmn.io/Strategist_Icon.png)'></div>";
    if (name === "Vanguard")   return "<div class='cut-icon icon-marvel icon-vanguard' style='mask-image: url(https://media.slmn.io/Vanguard_Icon.png)'></div>";

    return "";
}

// export function getMapData(match, mapSet, { showBannedMaps = false }) {
//     const firstTo = match.first_to;
//     let maps = [...(match.maps || [])];
//     if (!firstTo) return maps; // can't predict if we don't know first_to
//     maps = maps.filter(m => m.map); // hide things without map objects
//
//     if (!showBannedMaps) {
//         maps = maps.filter(m => !(m.banner || m.banned));
//     }
//
//     const neededMapCount = likelyNeededMaps(match);
//     const dummyMapCount = neededMapCount - maps.length;
// }

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

    console.log({
        playedMaps,
        toWin,
        withoutDraws,
        draws
    });

    return withoutDraws + draws;
}

export const DefaultMapImages = {
    Assault: assault,
    Escort: escort,
    Hybrid: hybrid,
    Control: control,
    Push: push,
    Spike: spike,
    SpikeRush: spikeRush,
    ValDeathmatch: valDeathmatch,
    Slayer: slayer,
    Strongholds: strongholds,
    CTF: ctf,
    Oddball: oddball,
    Flashpoint: flashpoint,
    Clash: clash
};

export const MapTypeIcons = {
    Hybrid: hybridIcon,
    Escort: escortIcon,
    Control: controlIcon,
    Push: pushIcon,
    Assault: assaultIcon,
    Flashpoint: flashpointIcon,
    Clash: clashIcon
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
                    console.log(matchMap.name, {
                        scheduledMap,
                        matchMap
                    });
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
        return {
            stats: stat,
            team
        };
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
 * @param {string} format - override for format
 * @param {boolean?} use24HourTime - use 24 hour time
 * @returns {string}
 */
export function formatTime(timeString, {
    tz,
    use24HourTime = false,
    format = "{day-short} {date-ordinal} {month-short} {year} {time} {tz}"
} = {}) {
    if (!tz) tz = useSettingsStore().timezone;
    const timezone = getTimezone(tz);
    const time = spacetime((new Date(timeString)).getTime()).goto(timezone);
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
    try {
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

            const code = vodURL.searchParams.get("v") ?? /\/live\/([^?&/]{11})/g.exec(vodURL.href)?.[1];
            // console.log(ts);

            return {
                service: "youtube",
                key: code,
                timestamp: ts || null,
                thumbnail: `http://img.youtube.com/vi/${code}/hqdefault.jpg`,
                display: {
                    text: "YouTube",
                    icon: "fab fa-youtube"
                }
            };
        }
        if (vodURL.host === "youtu.be") {
            return {
                service: "youtube",
                key: vodURL.pathname.slice(1),
                timestamp: vodURL.searchParams.get("t") || null,
                thumbnail: `http://img.youtube.com/vi/${vodURL.pathname.slice(1)}/hqdefault.jpg`,
                display: {
                    text: "YouTube",
                    icon: "fab fa-youtube"
                }
            };
        }
        if (["www.twitch.tv", "twitch.tv"].includes(vodURL.host)) {
            const embed = {
                service: (vodURL.pathname.split("/").length === 3 ? "twitch" : "twitch-live"),
                key: vodURL.pathname.slice(vodURL.pathname.lastIndexOf("/") + 1),
                thumbnail: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${vodURL.pathname.slice(vodURL.pathname.lastIndexOf("/") + 1).toLowerCase()}-1280x720.jpg`,
                display: {
                    text: "Twitch",
                    icon: "fab fa-twitch"
                }
            };
            if (embed.service === "twitch") {
                embed.timestamp = vodURL.searchParams.get("t") || null;
            }
            return embed;
        }

        if (url.endsWith(".pdf")) {
            return {
                service: "pdf",
                url,
                display: {
                    text: "PDF",
                    icon: "fas fa-file-pdf"
                }
            };
        }

        if (["mp4", "webm"].some(file => url.endsWith("." + file))) {
            return {
                service: "unknown-video",
                url,
                display: {
                    text: "Video",
                    icon: "fas fa-file-video"
                }
            };
        }
    } catch (e) {
        console.warn("VOD URL issue", url, e);
    }

    return {
        service: "unknown",
        url,
        display: {
            text: "Unknown",
            icon: "fas fa-file"
        }
    };
}

export function renderEmbed(embed) {
    if (embed.service === "youtube") {
        return `<iframe src="https://youtube.com/embed/${embed.key}?autoplay=true${embed.timestamp ? `&start=${embed.timestamp}` : ""}" allowfullscreen="true"></iframe>`;
    }
    if (embed.service === "twitch") {
        return `<iframe src="https://player.twitch.tv/?video=${embed.key}&parent=${window.location.hostname}${embed.timestamp ? `&t=${embed.timestamp}` : ""}" allowfullscreen="true"></iframe>`;
    }
    if (embed.service === "twitch-live") {
        return `<iframe src="https://player.twitch.tv/?channel=${embed.key}&parent=${window.location.hostname}${embed.timestamp ? `&t=${embed.timestamp}` : ""}" allowfullscreen="true"></iframe>`;
    }
    if (embed.service === "twitch-clip") {
        return `<iframe src="https://clips.twitch.tv/embed?clip=${embed.key}&parent=${window.location.hostname}" allowfullscreen="true"></iframe>`;
    }
    if (embed.service === "unknown-video") {
        return `<video src="${embed.url}" autoplay controls></video>`;
    }
    if (embed.service === "pdf") {
        return `<iframe src="https://docs.google.com/gview?embedded=true&url=${embed.url}" class="embed-pdf"></iframe>`;
    }
    if (embed.service === "unknown") {
        return `<iframe src="${embed.url}" class="embed-iframe"></iframe>`;
    }
}


export function unescapeText(text) {
    if (!text) return "";

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
        {
            value: null,
            disabled: true,
            text: "Choose a theme"
        },
        {
            label: "Teams",
            options: teams.filter((i, p, a) => a.map(x => x.id).indexOf(i.id) === p).sort(sortTeams).map((t) => ({
                ...t,
                text: t.name,
                value: valueFn ? valueFn(t) : t.id
            }))
        },
        {
            label: "Events",
            options: events.filter((i, p, a) => a.map(x => x.id).indexOf(i.id) === p).sort(sortEvents).map((e) => ({
                ...e,
                text: e.name,
                value: valueFn ? valueFn(e) : e.id
            }))
        }
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

export function getFormatOptions(event, match) {
    return {
        event: event?.name,
        event_name: event?.name,
        event_long: event?.name,
        event_short: event?.short,

        team_1_code: match?.teams?.[0]?.code,
        team_1_name: match?.teams?.[0]?.name,
        team_2_code: match?.teams?.[1]?.code,
        team_2_name: match?.teams?.[1]?.name,

        match_custom_name: match?.custom_name,
        match_sub_event: match?.sub_event,
        match_group: match?.match_group,
        match_round: match?.round,
        match_number: match?.match_number,
        match_division: match?.division,
        match_week_text: match?.week_text,
        match_week_number: match?.week,
        match_day: match?.day,
        match_first_to: match?.first_to,
        match_first_to_short: match.first_to ? `FT${match.first_to}` : null,
        match_first_to_long: match.first_to ? `First to ${match.first_to}` : null,
        match_best_of_short: match.first_to ? `BO${(match.first_to * 2) - 1}` : null,
        match_best_of_long: match.first_to ? `Best of ${(match.first_to * 2) - 1}` : null
    };
}

export function formatText(format, event, match) {
    if (!format) return "";
    const formatOptions = getFormatOptions(event, match);
    Object.entries(formatOptions).forEach(([key, val]) => {
        format = format.replace(`{${key}}`, val || "");
    });
    return format.trim();
}


export function decoratePlayerWithDraftData(player, eventID) {
    if (!player) return {};
    const thisSignupData = (player.signup_data || []).find(data => cleanID(data?.event?.[0]) === cleanID(eventID));
    const _draftData = thisSignupData ? {
        // signup data
        role: thisSignupData.main_role,
        sr: thisSignupData.sr,
        tank_sr: thisSignupData.tank_sr,
        dps_sr: thisSignupData.dps_sr,
        support_sr: thisSignupData.support_sr,
        info_for_captains: thisSignupData.info_for_captains,
        eligible_roles: thisSignupData.eligible_roles,
        // auction_price: thisSignupData.auction_price,
    } : {
        // basic
        role: player.role,
        sr: player.manual_sr,
        tank_sr: player.composition_tank_sr,
        dps_sr: player.composition_dps_sr,
        support_sr: player.composition_support_sr,
        info_for_captains: player.draft_data,
        eligible_roles: player.eligible_roles,
        // auction_price: player.auction_price,
    };
    return {
        ...player,
        this_event_signup_data: thisSignupData,
        _draftData
    };
}

/**
 *
 * @param {Object} state - The state object
 * @param {boolean} state.reports_enabled - Indicates if reports are enabled
 * @param {boolean} state.has_existing_report - Indicates if there is an existing report
 * @param {boolean} state.is_on_teams - Indicates if the user is on teams
 * @param {boolean} state.is_opponent - Indicates if the user is an opponent
 * @param {boolean} state.is_submitter - Indicates if the user is a submitter
 * @param {boolean} state.is_staff - Indicates if the user is staff
 * @param {Object} report - The report object
 * @param {Object} eventSettings - The event settings object
 * @returns {{small: string, variant: string, text: string, title: string}|{variant: string, text: string}|null}
 */
export function getScoreReportingBadge({
    state,
    report
}, eventSettings) {
    if (!state.reports_enabled) return null;
    if (report?.approved || state.match_complete) return null;

    if (state.has_existing_report && report.approved) {
        return {
            variant: "success",
            text: "Complete"
        };
    }
    if (state.has_existing_report && report.approved_by_opponent && eventSettings?.reporting?.score?.staffApprove) {
        // Waiting for staff approval
        if (state.is_staff) {
            return {
                variant: "success",
                text: "Needs approval",
                small: "Approve",
                title: "You can approve the score report of this match"
            };
        } else if (state.is_on_teams) {
            return {
                variant: "dark",
                text: "Submitted",
                small: "Waiting",
                title: "Waiting for staff approval"
            };
        }
    }
    if (state.has_existing_report && report.approved_by_team && eventSettings?.reporting?.score?.opponentApprove) {
        // Waiting for opponent approval
        if (state.is_opponent) {
            return {
                variant: "success",
                text: "Needs approval",
                small: "Approve",
                title: "You can approve the score report of this match"
            };
        } else if (state.is_staff) {
            if (eventSettings?.reporting?.score?.staffApprove && !report.approved_by_staff) {
                // waiting for opponent but will need staff
                return {
                    variant: "success",
                    text: "Pre-approve",
                    small: "Pre-approve",
                    title: "Pre-approval ready"
                };
            } else {
                // waiting for opponent but staff not needed
                return {
                    variant: "dark",
                    text: "Needs opponent",
                    small: "Need opp",
                    title: "Waiting for opponent to approve this report"
                };
            }
        } else if (state.is_on_teams) {
            return {
                variant: "dark",
                text: "Submitted",
                small: "Waiting",
                title: "This match is waiting for opponent approval"
            };
        }
    }

    if (!state.has_existing_report && state.is_on_teams) {
        return {
            variant: "primary",
            text: "Available",
            small: "Report",
            title: "You can report the score of this match"
        };
    }

    return null;
}


/**
 *
 * @param {Object} state - The state object
 * @param {boolean} state.reports_enabled - Indicates if reports are enabled
 * @param {boolean} state.has_existing_report - Indicates if there is an existing report
 * @param {boolean} state.is_on_teams - Indicates if the user is on teams
 * @param {boolean} state.is_opponent - Indicates if the user is an opponent
 * @param {boolean} state.is_submitter - Indicates if the user is a submitter
 * @param {boolean} state.is_staff - Indicates if the user is staff
 * @param {boolean} state.reports_loading
 * @param {boolean} state.has_start
 * @param {boolean} state.match_complete
 * @param {Report} report - The report object
 * @param {Object} eventSettings - The event settings object
 * @returns {{small: string, variant: string, text: string, title: string}|{variant: string, text: string}|null}
 */
export function getReschedulingBadge({
    state,
    report
}, eventSettings) {
    console.log("rescheduling", {
        state,
        report
    });
    if (state.reports_loading) return null;
    if (!state.reports_enabled) return null;
    if (!(state.is_on_teams || state.is_staff)) return null;
    if (report?.approved || state.match_complete) return null;

    const reschedule = state.has_start ? "Reschedule" : "Schedule";

    console.log("existing report", state.has_existing_report, "is staff", state.is_staff);
    if (!state.has_existing_report && state.is_on_teams) {
        // no report but could make one
        console.log("could make", JSON.stringify(report), state.has_existing_report);
        return {
            variant: "primary",
            text: "Available",
            small: reschedule,
            title: `You can submit a ${reschedule.toLowerCase()} request for this match`
        };
    }

    if (state.has_existing_report) {
        // some sort of state

        if (report.denied_by_staff) {
            return {
                variant: "danger",
                text: "Denied",
                small: "Denied",
                title: `Staff have denied this ${reschedule.toLowerCase()} request`
            };
        }
        if (report.denied_by_opponent) {
            return {
                variant: "danger",
                text: "Denied",
                small: "Denied",
                title: `${reschedule} request was denied by ${state.is_opponent ? "you" : "opponent"}`
            };
        }

        if (report.approved_by_team) {
            if (eventSettings?.reporting?.rescheduling?.opponentApprove) {
                if (!report.approved_by_opponent) {
                    if (state.is_submitter) {
                        return {
                            variant: "dark",
                            text: "Submitted",
                            small: "Submitted",
                            title: `Waiting for opponent to approve this ${reschedule.toLowerCase()} request`
                        };
                    } else if (state.is_opponent) {
                        return {
                            variant: "success",
                            text: "Needs approval",
                            small: "Needs approval",
                            title: `You can approve this ${reschedule.toLowerCase()} request`
                        };
                    } else if (state.is_staff) {
                        if (eventSettings?.reporting?.rescheduling?.staffApprove) {
                            return {
                                variant: "primary",
                                text: "Pre-approve",
                                small: "Pre-app",
                                title: "Pre-approval ready"
                            };
                        } else {
                            return {
                                variant: "dark",
                                text: "Needs opponent",
                                small: "Need opp",
                                title: `Waiting for opponent to approve this ${reschedule.toLowerCase()} request`
                            };
                        }
                    }
                }
            }

            if (eventSettings?.reporting?.rescheduling?.staffApprove) {
                if (!report.approved_by_staff) {
                    if (state.is_staff) {
                        return {
                            variant: "success",
                            text: "Needs approval",
                            small: "Needs approval",
                            title: `You can approve this ${reschedule.toLowerCase()} request`
                        };
                    } else if (state.is_on_teams) {
                        return {
                            variant: "dark",
                            text: "Submitted",
                            small: "Waiting",
                            title: "Waiting for staff approval"
                        };
                    }
                }
            }
        }
    }
}


/**
 * @param {number} r
 * @param {number} g
 * @param {number} b
 */
function luminance(r, g, b) {
    const RED = 0.2126;
    const GREEN = 0.7152;
    const BLUE = 0.0722;

    const GAMMA = 2.4;

    const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928
            ? v / 12.92
            : Math.pow((v + 0.055) / 1.055, GAMMA);
    });
    return a[0] * RED + a[1] * GREEN + a[2] * BLUE;
}

/**
 * @param {[red: number, blue: number, green: number]} rgb1
 * @param {[red: number, blue: number, green: number]} rgb2
 */
function contrast(rgb1, rgb2) {
    if (!rgb1?.length || !rgb2?.length) return null;
    const lum1 = luminance(...rgb1);
    const lum2 = luminance(...rgb2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * @param {[red: number, blue: number, green: number]} rgb1
 * @param {[red: number, blue: number, green: number]} rgb2
 */
export function calculateContrastRGB(rgb1, rgb2) {
    const diff = contrast(rgb1, rgb2);
    return diff < 1 ? 1 / diff : diff;
}

function deHex(hexString) {
    if (!hexString) return null;
    hexString = hexString.replace("#", "");
    const [r, g, b] = [hexString.slice(0, 2), hexString.slice(2, 4), hexString.slice(4, 6)].map(str => parseInt(str, 16));
    return [r, g, b];
}

/**
 *
 * @param {string} hex1
 * @param {string} hex2
 * @returns {number}
 */
export function calculateContrastHex(hex1, hex2) {
    const diff = contrast(deHex(hex1), deHex(hex2));
    return diff < 1 ? 1 / diff : diff;
}

export function recogniseRemoteServer(serverUrl) {
    if (!serverUrl) return null;

    try {
        const url = new URL(serverUrl);
        const output = {
            recognisedServer: null,
            recognisedID: null,
            recognisedPullLink: null,
            url: serverUrl,
            server: url.hostname.split(":")[0].replace("//", ""),
            streamid: url.searchParams.get("streamid") || url.hash.slice(1).split("&").find((text, i, a) => text.includes("publish"))
        };


        if (output.server.endsWith(".youtube.com")) {
            output.recognisedServer = "YouTube";
        }
        if (["na.borpa.business"].includes(output.server)) {
            output.recognisedServer = "NA SRT";
            output.recognisedID = output.streamid.split(",").find(t => t.split("=")[0] === "r").split("=")?.[1];
            output.recognisedPullLink = output.url.replace("m=publish", "m=request");
        }
        if (["eu.borpa.business"].includes(output.server)) {
            output.recognisedServer = "EU SRT";
            output.recognisedID = output.streamid.replace("publish/", "");
            output.recognisedPullLink = output.url.replace("publish/", "play/");
        }

        return output;
    } catch (e) {
        return { url: serverUrl };
    }
}

export function formatDuration(duration) {
    let parts = [];

    if (duration >= 60 * 60) {
        parts.push(Math.floor(duration / (60 * 60)));
        duration -= (Math.floor(duration / (60 * 60)) * 60 * 60);
    }
    parts.push(Math.floor(duration / 60));
    parts.push(Math.floor(duration % 60));
    return parts.map(e => e.toString().padStart(2, "0")).join(":");
}

export function processPickBanOrder(order, flip) {
    if (!order) return null;
    let counts = {};
    return order.split(",").map((text, i) => {
        const item = {
            type: (text.startsWith("pick") ? "pick" : (text.startsWith("ban") ? "ban" : (text.startsWith("protect") ? "protect" : null))),
            team: (text.endsWith("1") ? (flip ? 2 : 1) : (text.endsWith("2") ? (flip ? 1 : 2) : null)),
            num: i + 1
        };

        if (item.type && item.team) {
            if (!counts?.[item.type]) {
                counts[item.type] = {};
            }
            if (!counts?.[item.type]?.[item.team]) {
                counts[item.type][item.team] = 0;
            }
            counts[item.type][item.team]++;
            item.countOfTeamType = counts[item.type][item.team];
            item.countOfType = Object.values(counts[item.type]).reduce((a, b) => a + b, 0);
        }
        return item;
    });

}

export function getPickBanItem(order, type, team, index) {
    return order.find(o => o.team === team && o.type === type && o.countOfTeamType === (index + 1));
}


export function countStats(matches) {
    console.log(matches);
    const stats = {
        totalMaps: 0,
        hasPicks: false,
        hasBans: false,
        hasPriority: false,
        usesPriority: false,
        teamMaps: {}
    };

    matches.forEach(match => {

        let prioritySlots = {
            team_1: {
                picks: 1,
                bans: 1,
            },
            team_2: {
                picks: 1,
                bans: 1,
            }
        };

        if (match.pick_ban_order) {
            prioritySlots = {
                team_1: {
                    picks: 0,
                    bans: 0,
                },
                team_2: {
                    picks: 0,
                    bans: 0,
                }
            };

            let completeTokens = [];
            // check if is priority (first picks/bans for each side)
            const order = match.pick_ban_order.split(",");
            for (let i = 0; i < order.length; i++) {
                const action = order[i];
                if (completeTokens.includes(action)) continue;

                const nextAction = order[i + 1];

                if (nextAction && nextAction !== action) {
                    completeTokens.push(action);
                }

                if (action.startsWith("ban")) {
                    if (action.endsWith("1")) {
                        prioritySlots.team_1.bans++;
                    } else if (action.endsWith("2")) {
                        prioritySlots.team_2.bans++;
                    }
                } else if (action.startsWith("pick")) {
                    if (action.endsWith("1")) {
                        prioritySlots.team_1.picks++;
                    } else if (action.endsWith("2")) {
                        prioritySlots.team_2.picks++;
                    }
                }
            }
        }
        // console.log("prioritySlots", prioritySlots);

        (match.maps || []).forEach(map => {
            if (!map.winner) return; // only completed
            const team1Won = map?.winner?.[0] === match?.teams?.[0];
            // console.log(map, map?.winner?.[0], match?.teams?.[0]);

            stats.totalMaps++;
            (match?.teams || []).forEach(teamID => {
                const id = cleanID(teamID);
                if (!stats.teamMaps[id]) stats.teamMaps[id] = 0;
                stats.teamMaps[id]++;
            });

            const baseStats = {
                picks: {
                    total: 0,
                    wins: 0,
                    losses: 0,
                    priority: 0,
                    byTeam: {}
                },
                bans: {
                    total: 0,
                    wins: 0,
                    losses: 0,
                    priority: 0,
                    byTeam: {}
                }
            };

            // console.log(map);

            ["team_1", "team_2"].forEach((k, i) => {
                const team = cleanID(match?.teams?.[i]);

                (map[`${k}_picks`] || []).forEach((hero, pickI) => {
                    if (!stats.hasPicks) stats.hasPicks = true;
                    if (!stats[hero.id]) stats[hero.id] = structuredClone(baseStats);

                    if (!stats[hero.id].picks.byTeam[team]) {
                        stats[hero.id].picks.byTeam[team] = {
                            total: 0,
                            wins: 0,
                            losses: 0,
                            priority: 0
                        };
                    }
                    stats[hero.id].picks.total++;
                    stats[hero.id].picks.byTeam[team].total++;

                    // check priority

                    const prioPicks = prioritySlots[map.flip_pick_ban_order ? (k === "team_1" ? "team_2" : "team_1") : k].picks;
                    if ((pickI + 1) <= prioPicks) {
                        if (!stats.hasPriority) stats.hasPriority = true;
                        stats[hero.id].picks.priority++;
                        stats[hero.id].picks.byTeam[team].priority++;
                    } else {
                        if (stats.hasPriority && !stats.usesPriority) stats.usesPriority = true;
                    }

                    if (i !== +team1Won) {
                        stats[hero.id].picks.wins++;
                        stats[hero.id].picks.byTeam[team].wins++;
                    } else {
                        stats[hero.id].picks.losses++;
                        stats[hero.id].picks.byTeam[team].losses++;
                    }
                });
                (map[`${k}_bans`] || []).forEach((hero, banI) => {
                    if (!stats.hasBans) stats.hasBans = true;
                    if (!stats[hero.id]) stats[hero.id] = structuredClone(baseStats);

                    if (!stats[hero.id].bans.byTeam[team]) {
                        stats[hero.id].bans.byTeam[team] = {
                            total: 0,
                            wins: 0,
                            losses: 0
                        };
                    }
                    stats[hero.id].bans.total++;
                    stats[hero.id].bans.byTeam[team].total++;

                    // check priority
                    const prioBans = prioritySlots[map.flip_pick_ban_order ? (k === "team_1" ? "team_2" : "team_1") : k].bans;
                    if ((banI + 1) <= prioBans) {
                        if (!stats.hasPriority) stats.hasPriority = true;
                        stats[hero.id].bans.priority++;
                        stats[hero.id].bans.byTeam[team].priority++;
                    } else {
                        if (stats.hasPriority && !stats.usesPriority) stats.usesPriority = true;
                    }

                    if (i !== +team1Won) {
                        stats[hero.id].bans.wins++;
                        stats[hero.id].bans.byTeam[team].wins++;
                    } else {
                        stats[hero.id].bans.losses++;
                        stats[hero.id].bans.byTeam[team].losses++;
                    }
                });
            });
        });
    });

    return stats;
}

export function hydratedCommunityStreams() {
    return computed(() => {
        return ((ReactiveRoot("special:player-streams"))?.streams || []).map(stream => ({
            ...stream,
            match: ReactiveThing("match", {
                "teams": ReactiveArray("teams", {
                    "theme": ReactiveThing("theme")
                })
            })(stream),
            "event": ReactiveThing("event", {
                "theme": ReactiveThing("theme")
            })(stream),
            "player": ReactiveThing("player")(stream),
            "team": ReactiveThing("team", {
                "theme": ReactiveThing("theme")
            })(stream)
        })).sort((a, b) => sortAlphaRaw(a.match?.id, b.match?.id));
    });
}


export function getTeamsWithPlaceholders(match, bracketData) {
    // bracketData can be used to generate updated match text with context from previous matches

    const dummy = {
        text: "TBD",
        dummy: true,
        id: null
    };
    const dummies = bracketData ? generateDummies(dummy, match, bracketData) : [dummy, dummy];
    if (!match) {
        return [{
            ...dummies[0],
            _empty: true
        }, {
            ...dummies[1],
            _empty: true
        }];
    }
    // console.log("dummies", match._bracket_data.num, dummies);

    let text = (match.placeholder_teams || "").trim();
    text = text ? text.split("|").map(x => !x ? null : x) : [];

    let extraText = [null, null];

    if (text.length === 4) {
        extraText = [text[2], text[3]];
        text = [text[0], text[1]];
    }

    if (!match.teams || match.teams.length === 0) {
        if (text.length === 2) {
            return text.map((t, i) => ({
                ...dummies[i],
                ...(t ? { text: t } : {}),
                ...(extraText[i] ? { short: extraText[i] } : {}),
            }));
        } else if (text.length === 1) {
            if (match.placeholder_right) {
                return [dummies[0], {
                    ...dummies[1],
                    ...(text[0] ? { text: text[0] } : {}),
                }];
            }
            return [{
                ...dummies[0],
                ...(text[0] ? { text: text[0] } : {}),
                ...(extraText[0] ? { short: extraText[0] } : {}),
            }, dummies[1]];
        } else if (text.length === 0) {
            // no text, just use TBDs
            return dummies;
        }
    }
    if (match.teams.length === 1) {
        if (text.length === 2) {

            if (match.placeholder_right) {
                return [match.teams[0], {
                    ...dummies[1],
                    ...(text[1] ? { text: text[1] } : {}),
                    ...(extraText[1] ? { short: extraText[1] } : {}),
                }];
            }
            return [{
                ...dummies[0],
                ...(text[0] ? { text: text[0] } : {}),
                ...(extraText[0] ? { short: extraText[0] } : {}),
            }, match.teams[0]];

        } else if (text.length === 1) {

            if (match.placeholder_right) {
                return [match.teams[0], {
                    ...dummies[1],
                    ...(text[0] ? { text: text[0] } : {}),
                    ...(extraText[0] ? { short: extraText[0] } : {}),
                }];
            }

            return [{
                ...dummies[0],
                ...(text[0] ? { text: text[0] } : {}),
                ...(extraText[0] ? { short: extraText[0] } : {}),
            }, match.teams[0]];
        } else if (text.length === 0) {
            // no text, just use TBDs
            if (match.placeholder_right) return [match.teams[0], dummies[1]];
            return [dummies[0], match.teams[0]];
        }
    }

    if (match.teams.length === 2) return match.teams;
    return [];

}

function generateDummies(dummy, match, bracketData) {
    // "1" and "2" come from the dot notation (eg "winner": "7.2")
    // so 1 is top/left, 2 is bottom/right

    const feederMatches = bracketData?.connections?.feederMatches;
    // console.log("cons", match?._bracket_data?.num, match?._bracket_data?.connections);
    if (!feederMatches || (!feederMatches["1"] && !feederMatches["2"])) return [dummy, dummy];
    const dummies = [dummy, dummy];
    if (feederMatches["1"]) {
        // console.log("f1", feederMatches["1"]);
        dummies[0] = {
            ...dummy,
            text: generateDummyText(feederMatches["1"])
        };
    }

    if (feederMatches["2"]) {
        // console.log("f2", feederMatches["2"]);
        dummies[1] = {
            ...dummy,
            text: generateDummyText(feederMatches["2"])
        };
    }

    // console.log("dummies", match._bracket_data.num, dummies);

    return dummies;
}

function generateDummyText(match) {
    if (match?.teams?.length === 2 && match.teams.every(team => team.code)) {
        return `${match._m} of ${match.teams.map(team => team.code).join(" vs ")}`;
    }
    return `${match._m} M${(match.match_number || match.side)}`;
}


export function getVisibleVod(match) {
    let visibleVod = match.vod;

    if (visibleVod) {
        const vodData = getEmbedData(match.vod);
        if (vodData?.service && ["twitch-live", "unknown"].includes(vodData.service)) {

            visibleVod = null;
            if (match.vod_2) {
                const vod2Data = getEmbedData(match.vod_2);
                if (vod2Data?.service && ["twitch-live", "unknown"].includes(vod2Data.service)) {
                    visibleVod = match.vod_2;
                }
            }
        }
    }
    return visibleVod;
}

export function sortMatches(a, b) {
    if (a.start && b.start) {
        if ((new Date(a.start)).getTime() !== (new Date(b.start)).getTime()) {
            return (new Date(a.start) - new Date(b.start));
        }
    } else {
        if (a.event && b.event) {
            return (new Date(a.event.start_date) - new Date(b.event.start_date));
        }
    }
    return sortAlpha(a, b, "stream_code");
}

export function sortTeams(a, b) {
    if (a.event_date && b.event_date) {
        return (new Date(a.event_date[0]) - new Date(b.event_date[0]));
    }
    if (a.event_date) return -1;
    if (b.event_date) return 1;
}

export function sortEvents(a, b) {
    if (a && !b) return -1;
    if (!a && b) return 1;
    if (!a && !b) return 0;
    if (a.start_date && b.start_date) {
        return (new Date(a.start_date) - new Date(b.start_date));
    }
    if (a.start_date) return -1;
    if (b.start_date) return 1;
}

export function sortAlpha(a, b, key) {
    if (a[key]?.toLowerCase() > b[key]?.toLowerCase()) return 1;
    if (a[key]?.toLowerCase() < b[key]?.toLowerCase()) return -1;
    return 0;
}
export function sortAlphaRaw(a, b) {
    if (a?.toLowerCase() > b?.toLowerCase()) return 1;
    if (a?.toLowerCase() < b?.toLowerCase()) return -1;
    return 0;
}

export const PRODUCTION_HIERARCHY = [
    "Caster",
    "Desk Host",
    "Host",
    "Analyst",
    "Interviewer",
    "Director",
    "Producer",
    "Observer Director",
    "Replay Producer",
    "Observer",
    "Lobby Admin",
    "Stream Admin",
    "Moderator"
];
export const ROLE_ORDER = [
    "DPS", "Damage", "Offense", "Defense", "Duelist",
    "Tank", "Vanguard",
    "Support", "Strategist",
    "Flex"
];

export function sortRoles(a, b) {
    return ROLE_ORDER.indexOf(a) - ROLE_ORDER.indexOf(b);
}

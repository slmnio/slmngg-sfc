export function sortMatches(a, b) {
    if (a.start && b.start) {
        return (new Date(a.start) - new Date(b.start));
    } else {
        if (a.event && b.event) {
            return (new Date(a.event.start_date) - new Date(b.event.start_date));
        }
    }
}

export function sortTeams(a, b) {
    if (a.event_date && b.event_date) {
        return (new Date(a.event_date[0]) - new Date(b.event_date[0]));
    }
    if (a.event_date) return -1;
    if (b.event_date) return 1;
}

export function sortEvents(a, b) {
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

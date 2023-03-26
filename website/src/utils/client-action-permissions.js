
function dirtyID(id) {
    // add rec
    if (!id) return id;
    if (id.length === 14) return "rec" + id;
    return id;
}

export function canEditMatch(user, { event } = {}) {
    if (!user || !event) return false;
    if ((user?.website_settings || []).includes("Can edit any match")) return true;
    if ((event.staff || []).includes(dirtyID(user.airtableID))) return true;
    if ((event.player_relationships || []).some(rel => rel.player === dirtyID(user.airtableID) && (rel.permissions || []).includes("Match Editor"))) return true;
    return false;
}


function dirtyID(id) {
    // add rec
    if (!id) return id;
    if (id.length === 14) return "rec" + id;
    return id;
}

export function canEditMatch(player, { event, match } = {}) {
    if (!player || !event) return false;
    if ((player?.website_settings || []).includes("Can edit any match")) return true;
    if ((event?.staff || []).includes(dirtyID(player.id))) return true;
    if ((event?.player_relationships || []).some(rel => rel.player?.[0] === dirtyID(player.id) && (rel.permissions || []).includes("Match Editor"))) return true;
    if ((match?.player_relationships || []).some(rel => rel.player?.[0] === dirtyID(player.id) && (rel.permissions || []).includes("Match Editor"))) return true;

    return false;
}
export function isEventStaffOrHasRole(user, { event, role, websiteRoles } = {}) {
    if (!user || !event) return false;
    if ([...websiteRoles, role].some(websiteRole => (user.website_settings || []).includes(websiteRole)) || (event.staff || []).map(x => dirtyID(x?.id) || dirtyID(x)).includes(dirtyID(user.airtableID))) return true;
    if ((event.player_relationships || []).some(rel => rel.player?.[0] === dirtyID(user.airtableID) && (rel.permissions || []).includes(role))) return true;
    return false;
}

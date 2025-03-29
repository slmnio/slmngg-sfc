
function dirtyID(id) {
    // add rec
    if (!id) return id;
    if (id.length === 14) return "rec" + id;
    return id;
}

export function canEditMatch(player, { event, match } = {}) {
    if (!player || !event) return false;
    if ((match?.player_relationships || []).some(rel => rel.player?.[0] === dirtyID(player.id) && (rel.permissions || []).includes("Match Editor"))) return true;

    return isEventStaffOrHasRole({...player, airtableID: player.id}, event, ["Can edit any match"], ["Match Editor"]);
}

export function isEventStaffOrHasRole(user, event, websiteRoles, permissions) {
    if (!user || !event) return false;

    if (
        (websiteRoles || []).filter(Boolean).some(websiteRole => (user.website_settings || []).includes(websiteRole)) ||
        (event.staff || []).map(x => dirtyID(x?.id) || dirtyID(x)).includes(dirtyID(user.airtableID))
    ) return true;

    if ((event.player_relationships || []).some(rel => (
        rel.player?.[0] === dirtyID(user.airtableID) ||
        dirtyID(rel.player?.id) === dirtyID(user.airtableID)
    ) && (permissions || []).some(p => (rel.permissions || []).includes(p)))) return true;

    return false;
}

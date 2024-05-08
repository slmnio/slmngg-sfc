function sortTeamsIntoStandings(teams, methods) {

}

function getEventSortingMethods(event, group) {
    let blocks = event?.blocks;
    if (!blocks) return null;
    try {
        blocks = JSON.parse(blocks);
    } catch (e) {
        return null;
    }
    let matchGroupData;
    if (group) {
        matchGroupData =  (blocks?.standings || [])?.find(s => [s.group, s.key, s.title].map(e => e?.toLowerCase()).includes(group?.toLowerCase()));
    }

    try {
        if (matchGroupData?.sort) return matchGroupData.sort;
        const sorters = blocks.standingsSort;
        if (sorters?.length) {
            const sorter = sorters.find(s => s.group === group);
            return sorter?.sort;
        }
    } catch (e) {
        return null;
    }
    return null;
}

module.exports = { sortTeamsIntoStandings, getEventSortingMethods };

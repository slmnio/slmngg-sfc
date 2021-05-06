export default function sortTeams(a, b) {
    if (a.event_date && b.event_date) {
        return (new Date(a.event_date[0]) - new Date(b.event_date[0]));
    }
    if (a.event_date) return -1;
    if (b.event_date) return 1;
}

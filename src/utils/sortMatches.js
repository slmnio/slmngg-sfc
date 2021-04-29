export default function sortMatches(a, b) {
    if (a.start && b.start) {
        return (new Date(a.start) - new Date(b.start));
    } else {
        if (a.event && b.event) {
            return (new Date(a.event.start_date) - new Date(b.event.start_date));
        }
    }
}

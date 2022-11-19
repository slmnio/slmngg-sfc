const EventMain = () => import("@/views/sub-views/EventMain");
const EventRosters = () => import("@/views/sub-views/EventRosters");
const EventBrackets = () => import("@/views/sub-views/EventBrackets");
const EventSchedule = () => import("@/views/sub-views/EventSchedule");
const EventDraft = () => import("@/views/sub-views/EventDraft");
const EventStaff = () => import("@/views/sub-views/EventStaff");
const EventAbout = () => import("@/views/sub-views/EventAbout");
const EventScenarios2 = () => import("@/views/sub-views/EventScenarios2");
const EventStandings = () => import("@/views/sub-views/EventStandings");
const ThingTheme = () => import("@/views/sub-views/ThingTheme");
const EventBrands = () => import("@/views/sub-views/EventBrands");

export default [
    { path: "", component: EventMain },
    { path: "rosters", component: EventRosters },
    { path: "bracket", component: EventBrackets },
    { path: "brackets", redirect: "bracket" },
    { path: "schedule", component: EventSchedule },
    { path: "matches", redirect: "schedule" },
    // { path: "scenarios", component: EventScenarios },
    { path: "scenarios", component: EventScenarios2 },
    { path: "draft", component: EventDraft },
    { path: "staff", component: EventStaff },
    { path: "about", component: EventAbout },
    { path: "standings", component: EventStandings },
    { path: "theme", component: ThingTheme },
    { path: "brands", component: EventBrands }
];

import EventMain from "@/views/sub-views/EventMain";
import EventRosters from "@/views/sub-views/EventRosters";
import EventBrackets from "@/views/sub-views/EventBrackets";
import EventSchedule from "@/views/sub-views/EventSchedule";
// import EventScenarios from "@/components/website/EventScenarios";
import EventDraft from "@/views/sub-views/EventDraft";
import EventStaff from "@/views/sub-views/EventStaff";
import EventAbout from "@/views/sub-views/EventAbout";
import EventScenarios2 from "@/components/website/EventScenarios2";
import EventStandings from "@/views/sub-views/EventStandings";

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
    { path: "standings", component: EventStandings }
];

export default [
    { path: "", component: () => import("@/views/sub-views/EventMain.vue") },
    { path: "rosters", component: () => import("@/views/sub-views/EventRosters.vue") },
    { path: "bracket", component: () => import("@/views/sub-views/EventBrackets.vue") },
    { path: "brackets", redirect: "bracket" },
    { path: "schedule", component: () => import("@/views/sub-views/EventSchedule.vue") },
    { path: "matches", redirect: "schedule" },
    // { path: "scenarios", component: EventScenarios },
    { path: "scenarios", component: () => import("@/views/sub-views/EventScenarios2.vue") },
    { path: "draft", component: () => import("@/views/sub-views/EventDraft.vue") },
    { path: "staff", component: () => import("@/views/sub-views/EventStaff.vue") },
    { path: "about", component: () => import("@/views/sub-views/EventAbout.vue") },
    { path: "standings", component: () => import("@/views/sub-views/EventStandings.vue") },
    { path: "theme", component: () => import("@/views/sub-views/ThingTheme.vue") },
    { path: "brands", component: () => import("@/views/sub-views/EventBrands.vue") },
    { path: "auction", component: () => import("@/views/sub-views/EventAuction.vue") },
    { path: "stream", redirect: "streams" },
    { path: "stream-details", redirect: "streams" },
    { path: "streams", component: () => import("@/views/sub-views/EventStreamDetails.vue") },
    {
        path: "settings",
        component: () => import("@/views/sub-views/EventSettings.vue"),
        meta: {
            requiresAuth: true
        }
    }
];

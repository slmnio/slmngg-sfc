export default [
    { path: "", component: () => import("@/views/sub-views/EventMain.vue") },
    { path: "rosters", component: () => import("@/views/sub-views/EventRosters.vue") },
    { path: "bracket", name: "event-bracket", alias: "brackets", component: () => import("@/views/sub-views/EventBrackets.vue") },
    { path: "brackets", redirect: { name: "event-schedule" } },
    { path: "schedule", name: "event-schedule", component: () => import("@/views/sub-views/EventSchedule.vue") },
    { path: "matches", redirect: { name: "event-schedule" } },
    // { path: "scenarios", component: EventScenarios },
    { path: "scenarios", component: () => import("@/views/sub-views/EventScenarios2.vue") },
    { path: "draft", component: () => import("@/views/sub-views/EventDraft.vue") },
    { path: "staff", component: () => import("@/views/sub-views/EventStaff.vue") },
    { path: "about", component: () => import("@/views/sub-views/EventAbout.vue") },
    { path: "standings", component: () => import("@/views/sub-views/EventStandings.vue") },
    { path: "theme", component: () => import("@/views/sub-views/ThingTheme.vue") },
    { path: "brands", component: () => import("@/views/sub-views/EventBrands.vue") },
    { path: "auction", component: () => import("@/views/sub-views/EventAuction.vue") },
    { path: "streams", name: "event-streams", component: () => import("@/views/sub-views/EventStreamDetails.vue") },
    { path: "stream", alias: ["stream-details"], redirect: { name: "event-streams" } },
    {
        path: "settings",
        component: () => import("@/views/sub-views/event-settings/EventSettings.vue"),
        meta: {
            requiresAuth: true
        },
        children: [
            {
                path: "",
                component: () => import("@/views/sub-views/event-settings/EventSettingsGeneral.vue"),
            },
            {
                path: "discord",
                component: () => import("@/views/sub-views/event-settings/EventSettingsDiscord.vue"),
            }
        ]
    }
];

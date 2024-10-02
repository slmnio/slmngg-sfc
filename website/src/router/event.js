/**
 * @param isSubdomain
 * @returns {RouteRecordRaw[]}
 */
export default (isSubdomain) => [
    { path: "", component: () => import("@/views/sub-views/event/EventMain.vue") },
    { path: "rosters", component: () => import("@/views/sub-views/event/EventRosters.vue") },
    { path: "bracket", name: `event-${isSubdomain? "sub-" : ""}-brackets`, alias: "brackets", component: () => import("@/views/sub-views/event/EventBrackets.vue") },
    { path: "brackets", redirect: { name: `event-${isSubdomain? "sub-" : ""}-brackets` } },
    { path: "schedule", name: `event-${isSubdomain? "sub-" : ""}-schedule`, component: () => import("@/views/sub-views/event/EventSchedule.vue") },
    { path: "matches", redirect: { name: `event-${isSubdomain? "sub-" : ""}-schedule` } },
    // { path: "scenarios", component: EventScenarios },
    { path: "scenarios", component: () => import("@/views/sub-views/event/EventScenarios2.vue") },
    { path: "draft", component: () => import("@/views/sub-views/event/EventDraft.vue") },
    { path: "staff", component: () => import("@/views/sub-views/event/EventStaff.vue") },
    { path: "staff/extended", component: () => import("@/views/sub-views/event/EventStaffExtended.vue") },
    { path: "about", component: () => import("@/views/sub-views/event/EventAbout.vue") },
    { path: "standings", component: () => import("@/views/sub-views/event/EventStandings.vue") },
    { path: "theme", component: () => import("@/views/sub-views/ThingTheme.vue") },
    { path: "brands", component: () => import("@/views/sub-views/event/EventBrands.vue") },
    {
        path: "auction",
        component: () => import("@/views/sub-views/event/EventAuction.vue"),
        meta: { requiresAuth: true },
    },
    { path: "streams", name: `event-${isSubdomain? "sub-" : ""}-streams`, component: () => import("@/views/sub-views/event/EventStreamDetails.vue") },
    { path: "stream", alias: ["stream-details"], redirect: { name: `event-${isSubdomain? "sub-" : ""}-streams` } },
    {
        path: "settings",
        component: () => import("@/views/sub-views/event-settings/EventSettings.vue"),
        meta: {
            requiresAuth: true
        },
        children: [
            {
                path: "",
                component: () => import("@/views/sub-views/event-settings/EventSettingsEditor.vue"),
            },
            {
                path: "discord",
                component: () => import("@/views/sub-views/event-settings/EventSettingsDiscord.vue"),
            },
            {
                path: "discord-logging",
                component: () => import("@/views/sub-views/event-settings/EventSettingsDiscordLogging.vue"),
            },
            {
                path: "signups",
                component: () => import("@/views/sub-views/event-settings/EventSettingsSignups.vue"),
            }
        ]
    }
];

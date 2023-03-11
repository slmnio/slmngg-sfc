import EventRoutes from "@/router/event";

export default [
    {
        path: "/team/:id",
        // name: "Team",
        component: () => import("@/views/Team"),
        props: route => ({ id: route.params.id }),
        children: [
            { path: "", component: () => import("@/views/sub-views/TeamMain.vue") },
            { path: "matches", component: () => import("@/views/sub-views/TeamSchedule.vue") },
            { path: "theme", component: () => import("@/views/sub-views/ThingTheme.vue") },
            { path: "details", component: () => import("@/views/sub-views/TeamDetails.vue") },
            { path: "composition", component: () => import("@/views/sub-views/TeamComposition.vue") }
        ]
    },
    {
        path: "/event/:id",
        // name: "Event",
        component: () => import("@/views/Event.vue"),
        props: route => ({ id: route.params.id }),
        children: EventRoutes
    },
    {
        path: "/player/:id",
        // name: "Player",
        component: () => import("@/views/Player"),
        props: route => ({ id: route.params.id }),
        children: [
            { path: "", component: () => import("@/views/sub-views/PlayerMain.vue") },
            { path: "casts", component: () => import("@/views/sub-views/PlayerCasts.vue") },
            { path: "news", component: () => import("@/views/sub-views/PlayerNews.vue") },
            { path: "matches", component: () => import("@/views/sub-views/PlayerMatches.vue") },
            { path: "played-matches", component: () => import("@/views/sub-views/PlayerPlayedMatches.vue") },
            { path: "match-stats", component: () => import("@/views/sub-views/PlayerMatchStats.vue") },
            { path: "brands", component: () => import("@/views/sub-views/PlayerBrands.vue") },
            { path: "participation", component: () => import("@/views/sub-views/PlayerParticipation.vue") },
            { path: "banner", component: () => import("@/views/sub-views/PlayerBannerCreator.vue") }
        ]
    },
    {
        path: "/me",
        component: () => import("@/views/Me.vue"),
        meta: {
            requiresAuth: true
        }
    },
    {
        path: "/me/:subPage",
        component: () => import("@/views/Me.vue"),
        props: route => ({ subPage: route.params.subPage }),
        meta: {
            requiresAuth: true
        }
    },
    { path: "cams", component: () => import("@/views/sub-views/Cams.vue") },
    {
        path: "/match/:id",
        component: () => import("@/views/Match.vue"),
        props: route => ({ id: route.params.id }),
        children: [
            { path: "", component: () => import("@/views/sub-views/MatchVOD.vue") },
            { path: "history", component: () => import("@/views/sub-views/MatchHistory.vue") },
            { path: "editor", component: () => import("@/components/website/dashboard/MatchEditor.vue"), meta: { requiresAuth: true } }
        ]
    },
    { path: "/detailed/:id", component: () => import("@/views/DetailedMatch.vue"), props: route => ({ id: route.params.id }) },
    {
        path: "/news/:slug",
        component: () => import("@/views/News.vue"),
        props: route => ({ slug: route.params.slug })
    }
];

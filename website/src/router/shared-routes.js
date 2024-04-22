import EventRoutes from "@/router/event";

export default [
    {
        path: "/team/:id",
        // name: "Team",
        component: () => import("@/views/Team"),
        props: route => ({ id: route.params.id }),
        children: [
            { path: "", component: () => import("@/views/sub-views/team/TeamMainPage.vue") },
            { path: "matches", component: () => import("@/views/sub-views/team/TeamSchedule.vue") },
            { path: "theme", component: () => import("@/views/sub-views/ThingTheme.vue") },
            { path: "details", component: () => import("@/views/sub-views/team/TeamDetails.vue") },
            { path: "composition", component: () => import("@/views/sub-views/team/TeamComposition.vue") }
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
            { path: "", component: () => import("@/views/sub-views/player/PlayerMain.vue") },
            { path: "casts", component: () => import("@/views/sub-views/player/PlayerCasts.vue") },
            { path: "news", component: () => import("@/views/sub-views/player/PlayerNews.vue") },
            { path: "matches", component: () => import("@/views/sub-views/player/PlayerMatches.vue") },
            { path: "played-matches", component: () => import("@/views/sub-views/player/PlayerPlayedMatches.vue") },
            { path: "match-stats", component: () => import("@/views/sub-views/player/PlayerMatchStats.vue") },
            { path: "brands", component: () => import("@/views/sub-views/player/PlayerBrands.vue") },
            { path: "participation", component: () => import("@/views/sub-views/player/PlayerParticipation.vue") },
            { path: "banner", component: () => import("@/views/sub-views/player/PlayerBannerCreator.vue") },
            { path: "partners", component: () => import("@/views/sub-views/player/PlayerPartners.vue") }
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
            { path: "editor", component: () => import("@/views/sub-views/event/EventMatchEditor.vue"), meta: { requiresAuth: true } }
        ]
    },
    { path: "/detailed/:id", component: () => import("@/views/DetailedMatch.vue"), props: route => ({ id: route.params.id }) },
    {
        path: "/news/:slug",
        component: () => import("@/views/News.vue"),
        props: route => ({ slug: route.params.slug })
    }
];

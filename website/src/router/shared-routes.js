import Team from "@/views/Team";
import TeamMain from "@/views/sub-views/TeamMain";
// import TeamMatches from "@/views/sub-views/TeamMatches";
import TeamSchedule from "@/views/sub-views/TeamSchedule";
import TeamTheme from "@/views/sub-views/ThingTheme";
import TeamDetails from "@/views/sub-views/TeamDetails";
import Cams from "@/views/sub-views/Cams";
import Event from "@/views/Event";
import EventRoutes from "@/router/event";
const Team = () => import("@/views/Team");
const TeamMain = () => import("@/views/sub-views/TeamMain");
const TeamSchedule = () => import("@/views/sub-views/TeamSchedule");
const TeamTheme = () => import("@/views/sub-views/ThingTheme");
const TeamDetails = () => import("@/views/sub-views/TeamDetails");
const Event = () => import("@/views/Event");
const Player = () => import("@/views/Player");
const PlayerMain = () => import("@/views/sub-views/PlayerMain");
const PlayerCasts = () => import("@/views/sub-views/PlayerCasts");
const PlayerNews = () => import("@/views/sub-views/PlayerNews");
const PlayerMatches = () => import("@/views/sub-views/PlayerMatches");
const PlayerPlayedMatches = () => import("@/views/sub-views/PlayerPlayedMatches");
const Match = () => import("@/views/Match");
const News = () => import("@/views/News");
const DetailedMatch = () => import("@/views/DetailedMatch");
const MatchVOD = () => import("@/views/sub-views/MatchVOD");
const MatchHistory = () => import("@/views/sub-views/MatchHistory");
const TeamComposition = () => import("@/views/sub-views/TeamComposition");
const PlayerBrands = () => import("@/views/sub-views/PlayerBrands");
const MatchEditor = () => import("@/components/website/dashboard/MatchEditor");
const PlayerParticipation = () => import("@/views/sub-views/PlayerParticipation");
const Me = () => import("@/views/Me");

export default [
    {
        path: "/team/:id",
        // name: "Team",
        component: Team,
        props: route => ({ id: route.params.id }),
        children: [
            { path: "", component: TeamMain },
            { path: "matches", component: TeamSchedule },
            { path: "theme", component: TeamTheme },
            { path: "details", component: TeamDetails },
            { path: "composition", component: TeamComposition }
        ]
    },
    {
        path: "/event/:id",
        // name: "Event",
        component: Event,
        props: route => ({ id: route.params.id }),
        children: EventRoutes
    },
    {
        path: "/player/:id",
        // name: "Player",
        component: Player,
        props: route => ({ id: route.params.id }),
        children: [
            { path: "", component: PlayerMain },
            { path: "casts", component: PlayerCasts },
            { path: "news", component: PlayerNews },
            { path: "matches", component: PlayerMatches },
            { path: "played-matches", component: PlayerPlayedMatches },
            { path: "brands", component: PlayerBrands },
            { path: "participation", component: PlayerParticipation }
        ]
    },
    {
        path: "/me",
        component: Me,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: "/me/:subPage",
        component: Me,
        props: route => ({ subPage: route.params.subPage }),
        meta: {
            requiresAuth: true
        }
    },
    { path: "cams", component: Cams },
    {
        path: "/match/:id",
        component: Match,
        props: route => ({ id: route.params.id }),
        children: [
            { path: "", component: MatchVOD },
            { path: "history", component: MatchHistory },
            { path: "editor", component: MatchEditor, meta: { requiresAuth: true } }
        ]
    },
    { path: "/detailed/:id", component: DetailedMatch, props: route => ({ id: route.params.id }) },
    {
        path: "/news/:slug",
        component: News,
        props: route => ({ slug: route.params.slug })
    }
];

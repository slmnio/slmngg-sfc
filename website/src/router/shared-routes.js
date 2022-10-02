import Team from "@/views/Team";
import TeamMain from "@/views/sub-views/TeamMain";
// import TeamMatches from "@/views/sub-views/TeamMatches";
import TeamSchedule from "@/views/sub-views/TeamSchedule";
import TeamTheme from "@/views/sub-views/ThingTheme";
import TeamDetails from "@/views/sub-views/TeamDetails";
import TeamCams from "@/views/sub-views/TeamCams";
import Event from "@/views/Event";
import EventRoutes from "@/router/event";
import Player from "@/views/Player";
import PlayerMain from "@/views/sub-views/PlayerMain";
import PlayerCasts from "@/views/sub-views/PlayerCasts";
import PlayerNews from "@/views/sub-views/PlayerNews";
import PlayerMatches from "@/views/sub-views/PlayerMatches";
import PlayerPlayedMatches from "@/views/sub-views/PlayerPlayedMatches";
import Match from "@/views/Match";
import News from "@/views/News";
import DetailedMatch from "@/views/DetailedMatch";
import MatchVOD from "@/views/sub-views/MatchVOD";
import MatchHistory from "@/views/sub-views/MatchHistory";
import TeamComposition from "@/views/sub-views/TeamComposition";
import PlayerBrands from "@/views/sub-views/PlayerBrands";
import MatchEditor from "@/components/website/dashboard/MatchEditor";
import PlayerParticipation from "@/views/sub-views/PlayerParticipation";
import Me from "@/views/Me";

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
            { path: "composition", component: TeamComposition },
            { path: "cams", component: TeamCams }
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

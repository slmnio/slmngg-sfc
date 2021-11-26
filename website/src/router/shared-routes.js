import Team from "@/views/Team";
import TeamMain from "@/views/sub-views/TeamMain";
import TeamMatches from "@/views/sub-views/TeamMatches";
import TeamTheme from "@/views/sub-views/TeamTheme";
import TeamDetails from "@/views/sub-views/TeamDetails";
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
import PlayerBannerCreator from "@/views/sub-views/PlayerBannerCreator";

export default [
    {
        path: "/team/:id",
        // name: "Team",
        component: Team,
        props: route => ({ id: route.params.id }),
        children: [
            { path: "", component: TeamMain },
            { path: "matches", component: TeamMatches },
            { path: "theme", component: TeamTheme },
            { path: "details", component: TeamDetails }
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
            { path: "banner", component: PlayerBannerCreator }
        ]
    },
    {
        path: "/match/:id",
        component: Match,
        props: route => ({ id: route.params.id }),
        children: [
            { path: "", component: MatchVOD },
            { path: "history", component: MatchHistory }
        ]
    },
    { path: "/detailed/:id", component: DetailedMatch, props: route => ({ id: route.params.id }) },
    {
        path: "/news/:slug",
        component: News,
        props: route => ({ slug: route.params.slug })
    }
];

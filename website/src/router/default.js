import WebsiteApp from "@/apps/WebsiteApp";
import Home from "@/views/Home";
import Team from "@/views/Team";
import TeamMain from "@/views/sub-views/TeamMain";
import TeamMatches from "@/views/sub-views/TeamMatches";
import TeamTheme from "@/views/sub-views/TeamTheme";
import TeamDetails from "@/views/sub-views/TeamDetails";
import Events from "@/views/lists/Events";
import Teams from "@/views/lists/Teams";
import Players from "@/views/lists/Players";
import Event from "@/views/Event";
import EventRoutes from "@/router/event";
import Player from "@/views/Player";
import PlayerMain from "@/views/sub-views/PlayerMain";
import PlayerCasts from "@/views/sub-views/PlayerCasts";
import PlayerNews from "@/views/sub-views/PlayerNews";
import PlayerMatches from "@/views/sub-views/PlayerMatches";
import PlayerPlayedMatches from "@/views/sub-views/PlayerPlayedMatches";
import Match from "@/views/Match";
import OverlayApp from "@/apps/BroadcastApp";
import BroadcastRoutes from "@/router/broadcast";
import ClientApp from "@/apps/ClientApp";
import NotFoundPage from "@/views/NotFoundPage";

export default [
    {
        path: "/",
        name: "default",
        component: WebsiteApp,
        children: [
            {
                path: "/",
                // name: "Home",
                component: Home
            },
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
            { path: "/events", component: Events },
            { path: "/teams", component: Teams },
            { path: "/players", component: Players },
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
                    { path: "played-matches", component: PlayerPlayedMatches }
                ]
            },
            { path: "/match/:id", component: Match, props: route => ({ id: route.params.id }) },
            {
                path: "/about",
                // name: "About",
                // route level code-splitting
                // this generates a separate chunk (about.[hash].js) for this route
                // which is lazy-loaded when the route is visited.
                component: () => import(/* webpackChunkName: "about" */ "../views/About.vue")
            }
        ]
    },
    {
        path: "/broadcast/:broadcastCode",
        component: OverlayApp,
        props: route => ({ code: route.params.broadcastCode, title: route.query.title, top: route.query.top }),
        children: BroadcastRoutes
    },
    {
        path: "/client/:clientID",
        component: ClientApp,
        props: route => ({ client: route.params.clientID }),
        children: BroadcastRoutes
    },
    {
        path: "/*",
        component: NotFoundPage
    }
];

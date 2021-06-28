import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Team from "@/views/Team";
import Event from "@/views/Event";
import Player from "@/views/Player";
import WebsiteApp from "@/apps/WebsiteApp";
import OverlayApp from "@/apps/BroadcastApp";

import PlayerMain from "@/views/sub-views/PlayerMain";
import PlayerCasts from "@/views/sub-views/PlayerCasts";
import PlayerNews from "@/views/sub-views/PlayerNews";
import PlayerMatches from "@/views/sub-views/PlayerMatches";
import Events from "@/views/lists/Events";
import Teams from "@/views/lists/Teams";
import TeamMain from "@/views/sub-views/TeamMain";
import TeamMatches from "@/views/sub-views/TeamMatches";
import PlayerPlayedMatches from "@/views/sub-views/PlayerPlayedMatches";
import Match from "@/views/Match";
import EventMain from "@/views/sub-views/EventMain";
import EventRosters from "@/views/sub-views/EventRosters";
import EventBrackets from "@/views/sub-views/EventBrackets";
import TeamTheme from "@/views/sub-views/TeamTheme";
import EventSchedule from "@/views/sub-views/EventSchedule";
import EventScenarios from "@/components/website/EventScenarios";
import EventDraft from "@/views/sub-views/EventDraft";
import TeamDetails from "@/views/sub-views/TeamDetails";
import BroadcastRoutes from "@/router/broadcast";
import ClientApp from "@/apps/ClientApp";

Vue.use(VueRouter);

const routes = [
    {
        path: "/",
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
            {
                path: "/event/:id",
                // name: "Event",
                component: Event,
                props: route => ({ id: route.params.id }),
                children: [
                    { path: "", component: EventMain },
                    { path: "rosters", component: EventRosters },
                    { path: "bracket", component: EventBrackets },
                    { path: "brackets", redirect: "bracket" },
                    { path: "schedule", component: EventSchedule },
                    { path: "matches", redirect: "schedule" },
                    { path: "scenarios", component: EventScenarios },
                    // { path: "scenarios2", component: EventScenarios2 },
                    { path: "draft", component: EventDraft }
                ]
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
    }
];

const router = new VueRouter({
    mode: "history",
    base: process.env.BASE_URL,
    routes
});

export default router;

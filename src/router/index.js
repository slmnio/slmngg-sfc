import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Team from "@/views/Team";
import Event from "@/views/Event";
import Player from "@/views/Player";

import PlayerMain from "@/views/sub-views/PlayerMain";
import PlayerCasts from "@/views/sub-views/PlayerCasts";
import PlayerNews from "@/views/sub-views/PlayerNews";
import PlayerMatches from "@/views/sub-views/PlayerMatches";
import Events from "@/views/lists/Events";
import Teams from "@/views/lists/Teams";
import TeamMain from "@/views/sub-views/TeamMain";
import TeamMatches from "@/views/sub-views/TeamMatches";
import PlayerPlayedMatches from "@/views/sub-views/PlayerPlayedMatches";

Vue.use(VueRouter);

const routes = [
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
            { path: "matches", component: TeamMatches }
        ]
    },
    { path: "/events", component: Events },
    { path: "/teams", component: Teams },
    {
        path: "/event/:id",
        // name: "Event",
        component: Event,
        props: route => ({ id: route.params.id })
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
    {
        path: "/about",
        // name: "About",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ "../views/About.vue")
    }
];

const router = new VueRouter({
    mode: "history",
    base: process.env.BASE_URL,
    routes
});

export default router;

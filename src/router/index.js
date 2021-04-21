import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Team from "@/views/Team";
import Event from "@/views/Event";
import Player from "@/views/Player";
Vue.use(VueRouter);

const routes = [
    {
        path: "/",
        name: "Home",
        component: Home
    },
    {
        path: "/team/:id",
        name: "Team",
        component: Team,
        props: route => ({ id: route.params.id })
    },
    {
        path: "/event/:id",
        name: "Event",
        component: Event,
        props: route => ({ id: route.params.id })
    },
    {
        path: "/player/:id",
        name: "Player",
        component: Player,
        props: route => ({ id: route.params.id })
    },
    {
        path: "/about",
        name: "About",
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

import Home from "@/views/Home";
import Events from "@/views/lists/Events";
import Teams from "@/views/lists/Teams";
import Players from "@/views/lists/Players";
import NotFoundPage from "@/views/NotFoundPage";

import WebsiteApp from "@/apps/WebsiteApp";
import OverlayApp from "@/apps/BroadcastApp";
import ClientApp from "@/apps/ClientApp";

import BroadcastRoutes from "@/router/broadcast";
import SharedRoutes from "@/router/shared-routes";

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
            { path: "/events", component: Events },
            { path: "/teams", component: Teams },
            { path: "/players", component: Players },
            ...SharedRoutes,
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
        props: route => ({ client: route.params.clientID, title: route.query.title }),
        children: BroadcastRoutes
    },
    // {
    //     path: "/redirect",
    //     beforeEnter: (to, from, next) => {
    //         window.location.href = to.query.url;
    //     }
    // },
    {
        path: "/*",
        component: NotFoundPage
    }
];

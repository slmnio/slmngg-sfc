import Home from "@/views/Home";
import Events from "@/views/lists/Events";
import Teams from "@/views/lists/Teams";
import Players from "@/views/lists/Players";
import NotFoundPage from "@/views/NotFoundPage";

import WebsiteApp from "@/apps/WebsiteApp";
import BroadcastApp from "@/apps/BroadcastApp";
import ClientApp from "@/apps/ClientApp";

import BroadcastRoutes from "@/router/broadcast";
import SharedRoutes from "@/router/shared-routes";
import Authenticator from "@/views/Authenticator";

export default [
    {
        path: "/",
        // name: "default",
        component: WebsiteApp,
        children: [
            {
                path: "/",
                // name: "Home",
                component: Home
            },
            {
                path: "/events",
                component: Events
            },
            {
                path: "/teams",
                component: Teams
            },
            {
                path: "/players",
                component: Players
            },
            ...SharedRoutes,
            {
                path: "/about",
                // name: "About",
                // route level code-splitting
                // this generates a separate chunk (about.[hash].js) for this route
                // which is lazy-loaded when the route is visited.
                component: () => import(/* webpackChunkName: "about" */ "../views/About.vue")
            },
            {
                path: "/auth/discord/return",
                props: route => ({ code: route.query.code }),
                component: Authenticator
            }
        ]
    },
    {
        path: "/login",
        redirect: "/auth/discord/redirect"
    },
    {
        path: "/auth/discord/redirect",
        beforeEnter(to, from, next) {
            console.log("ZOOM DISCORD TIME");
            const params = {
                client_id: process.env.VUE_APP_DISCORD_CLIENT_ID,
                redirect_uri: "http://localhost:8080/auth/discord/return",
                response_type: "code",
                scope: ["identify"].join(" ")
            };

            const stringParams = Object.entries(params)
                .map(parts => parts.map(part => encodeURIComponent(part)).join("="))
                .join("&");

            window.location.replace("https://discord.com/api/oauth2/authorize?" + stringParams);
        }
    },
    {
        path: "/broadcast/:broadcastCode",
        component: BroadcastApp,
        props: route => ({
            code: route.params.broadcastCode,
            title: route.query.title,
            top: route.query.top,
            noAnimation: (route.query.noAnimate || route.query.dontAnimate || route.query.noAnimation),
            noStinger: (route.query.noStinger || route.query.stinger === "false")
        }),
        children: BroadcastRoutes
    },
    {
        path: "/client/:clientID",
        component: ClientApp,
        props: route => ({
            client: route.params.clientID,
            title: route.query.title,
            noAnimation: (route.query.noAnimate || route.query.dontAnimate || route.query.noAnimation),
            noStinger: (route.query.noStinger || route.query.stinger === "false")
        }),
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

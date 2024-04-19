import Home from "@/views/Home";
import Events from "@/views/lists/Events";
import Teams from "@/views/lists/Teams";
import Players from "@/views/lists/Players";

import WebsiteApp from "@/apps/WebsiteApp";
import BroadcastApp from "@/apps/BroadcastApp";
import ClientApp from "@/apps/ClientApp";

import BroadcastRoutes from "@/router/broadcast";
import SharedRoutes from "@/router/shared-routes";
import Authenticator from "@/views/Authenticator";
import Dashboard from "@/views/Dashboard";
import ProfilePage from "@/views/ProfilePage";
import TwitchAuthScopeSelector from "@/components/website/TwitchAuthScopeSelector";
import BracketCreator from "@/views/BracketCreator.vue";
import NotFoundPage from "@/views/NotFoundPage";

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
                path: "/profile",
                meta: { requiresAuth: true },
                component: ProfilePage
            },
            {
                path: "/dashboard",
                meta: { requiresAuth: true },
                component: Dashboard
            },
            {
                path: "/auth/discord/return",
                props: route => ({ code: route.query.code }),
                component: Authenticator
            },
            {
                path: "/twitch-auth",
                component: TwitchAuthScopeSelector
            },
            {
                path: "/bracket-creator",
                component: BracketCreator
            },
            {
                path: "/guide",
                component: () => import("@/views/Guide"),
                children: [
                    { path: "", component: () => import("@/views/sub-views/guide/GuideIntro.vue") },
                    { path: "virtual-cable", component: () => import("@/views/sub-views/guide/GuideVirtualCable.vue") },
                    { path: "obs", component: () => import("@/views/sub-views/guide/GuideObsSetup.vue") },
                    { path: "obs-profile", component: () => import("@/views/sub-views/guide/GuideObsProfile.vue") },
                    { path: "ow-settings", component: () => import("@/views/sub-views/guide/GuideOverwatchSettings.vue") }
                ]
            }
        ]
    },
    {
        path: "/broadcast/:broadcastCode",
        component: BroadcastApp,
        props: route => ({
            code: route.params.broadcastCode,
            title: route.query.title,
            stingerText: route.query.stingerText,
            stingerThemeOverride: route.query.stingerThemeOverride || route.query.stingerTheme,
            top: route.query.top,
            noAnimation: (route.query.noAnimate || route.query.dontAnimate || route.query.noAnimation),
            noStinger: (route.query.noStinger || route.query.stinger === "false"),
            bodyClass: route.query.class || route.query.bodyClass,
            full: !!route.query.full,
            backgroundIndex: route.query.background && parseInt(route.query.background)
        }),
        children: BroadcastRoutes
    },
    {
        path: "/client/:clientID",
        component: ClientApp,
        props: route => ({
            client: route.params.clientID,
            title: route.query.title,
            stingerText: route.query.stingerText,
            stingerThemeOverride: route.query.stingerThemeOverride || route.query.stingerTheme,
            noAnimation: (route.query.noAnimate || route.query.dontAnimate || route.query.noAnimation),
            noStinger: (route.query.noStinger || route.query.stinger === "false"),
            bodyClass: route.query.class || route.query.bodyClass,
            full: !!route.query.full,
            backgroundIndex: route.query.background && parseInt(route.query.background)
        }),
        children: BroadcastRoutes
    },
    { path: "*", component: NotFoundPage }
    // {
    //     path: "/redirect",
    //     beforeEnter: (to, from, next) => {
    //         window.location.href = to.query.url;
    //     }
    // },
];

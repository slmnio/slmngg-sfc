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
import Learn from "@/views/Learn.vue";

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
                path: "/learn",
                component: Learn
            },
            {
                path: "/guide",
                alias: ["/guides", "/tools"],
                redirect: "/learn"
            },
            {
                path: "/learn/guides/observing-tech",
                component: () => import("@/views/sub-views/guide/observer/ObserverGuideContainer.vue"),
                children: [
                    { path: "", component: () => import("@/views/sub-views/guide/observer/ObserverGuideIntro.vue") },
                    { path: "virtual-cable", component: () => import("@/views/sub-views/guide/observer/ObserverGuideVirtualCable.vue") },
                    { path: "obs-setup", component: () => import("@/views/sub-views/guide/observer/ObserverGuideObsSetup.vue") },
                    { path: "obs-scenes", component: () => import("@/views/sub-views/guide/observer/ObserverGuideObsScenes.vue") },
                    { path: "ow-settings", component: () => import("@/views/sub-views/guide/observer/ObserverGuideOverwatchSettings.vue") }
                ]
            },
            {
                path: "/learn/guides/ow-settings",
                component: () => import("@/views/sub-views/guide/ow-settings/OverwatchSettingsGuideContainer.vue"),
                children: [
                    { path: "", component: () => import("@/views/sub-views/guide/ow-settings/OverwatchSettingsGuideIntro.vue") },
                    { path: "tool", component: () => import("@/views/sub-views/guide/ow-settings/OverwatchSettingsGuideTool.vue") },
                    { path: "video", component: () => import("@/views/sub-views/guide/ow-settings/OverwatchSettingsGuideVideo.vue") },
                    { path: "sound", component: () => import("@/views/sub-views/guide/ow-settings/OverwatchSettingsGuideSound.vue") },
                    { path: "controls", component: () => import("@/views/sub-views/guide/ow-settings/OverwatchSettingsGuideControls.vue") },
                    { path: "gameplay", component: () => import("@/views/sub-views/guide/ow-settings/OverwatchSettingsGuideGameplay.vue") },
                    { path: "social", component: () => import("@/views/sub-views/guide/ow-settings/OverwatchSettingsGuideSocial.vue") },
                    { path: "a11y", component: () => import("@/views/sub-views/guide/ow-settings/OverwatchSettingsGuideAccessibility.vue") }
                ]
            },
            {
                path: "/learn/guides/companion-module",
                component: () => import("@/views/sub-views/guide/companion-module/CompanionModuleGuideContainer.vue"),
                children: [
                    { path: "", component: () => import("@/views/sub-views/guide/companion-module/CompanionModuleGuideIntro.vue") }
                ]
            },
            {
                path: "/tools/obs-scene-collections",
                component: () => import("@/views/sub-views/tools/ToolObsSceneCollections.vue")
            },
            {
                path: "/tools/ow-settings",
                component: () => import("@/views/sub-views/tools/ToolOWProfileShell.vue")
            },
            {
                path: "/tools/broadcast-routes",
                component: () => import("@/views/sub-views/tools/ToolProdRoutes.vue")
            },
            {
                path: "/tools/standings",
                component: () => import("@/views/sub-views/tools/ToolStandings.vue")
            },
            {
                path: "/tools/twitch-auth",
                component: TwitchAuthScopeSelector
            },
            {
                path: "/tools/bracket-creator",
                component: BracketCreator
            }
        ]
    },
    {
        path: "/bracket-creator",
        redirect: "/tools/bracket-creator"
    },
    {
        path: "/twitch-auth",
        redirect: "/tools/twitch-auth"
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
            client: route.params.clientID.toLowerCase(),
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
    { path: "/:pathMatch(.*)*", component: NotFoundPage }
    // {
    //     path: "/redirect",
    //     beforeEnter: (to, from, next) => {
    //         window.location.href = to.query.url;
    //     }
    // },
];

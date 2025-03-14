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
import Cookies from "universal-cookie";

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
                component: () => import("@/views/sub-views/guide/LearnWrapper.vue"),
                children: [
                    {
                        path: "",
                        component: Learn
                    },
                    {
                        path: "broadcast-routes",
                        name: "broadcast-routes",
                        component: () => import("@/views/sub-views/tools/ToolProdRoutes.vue")
                    },
                    {
                        path: "standings",
                        name: "standings",
                        component: () => import("@/views/sub-views/tools/ToolStandings.vue")
                    },
                ],
            },
            {
                path: "/guide",
                alias: ["/guides", "/tools"],
                redirect: "/learn"
            },
            {
                path: "/learn/guides",
                component: () => import("@/views/sub-views/guide/LearnWrapper.vue"),
                props: () => ({ subtitle: "Guides" }),
                children: [
                    {
                        path: "observing-tech",
                        component: () => import("@/views/sub-views/guide/observer/ObserverGuideContainer.vue"),
                        children: [
                            { path: "", component: () => import("@/views/sub-views/guide/observer/ObserverGuideIntro.vue"), name: "observing-tech-guide" },
                            { path: "virtual-cable", component: () => import("@/views/sub-views/guide/observer/ObserverGuideVirtualCable.vue"), name: "observing-tech-virtual-cable" },
                            { path: "obs-setup", component: () => import("@/views/sub-views/guide/observer/ObserverGuideObsSetup.vue"), name: "observing-tech-obs-setup" },
                            { path: "obs-scenes", component: () => import("@/views/sub-views/guide/observer/ObserverGuideObsScenes.vue"), name: "observing-tech-obs-scenes" },
                            { path: "overwatch-settings", component: () => import("@/views/sub-views/guide/observer/ObserverGuideOverwatchSettings.vue"), name: "observing-tech-overwatch-settings" },
                        ]
                    },
                    {
                        path: "overwatch-settings",
                        component: () => import("@/views/sub-views/guide/ow-settings/OverwatchSettingsGuideContainer.vue"),
                        children: [
                            { path: "", component: () => import("@/views/sub-views/guide/ow-settings/OverwatchSettingsGuideIntro.vue"), name: "overwatch-settings" },
                            { path: "tool", component: () => import("@/views/sub-views/guide/ow-settings/OverwatchSettingsGuideTool.vue"), name: "overwatch-settings-tool" },
                            { path: "video", component: () => import("@/views/sub-views/guide/ow-settings/OverwatchSettingsGuideVideo.vue"), name: "overwatch-settings-video" },
                            { path: "sound", component: () => import("@/views/sub-views/guide/ow-settings/OverwatchSettingsGuideSound.vue"), name: "overwatch-settings-sound" },
                            { path: "controls", component: () => import("@/views/sub-views/guide/ow-settings/OverwatchSettingsGuideControls.vue"), name: "overwatch-settings-controls" },
                            { path: "gameplay", component: () => import("@/views/sub-views/guide/ow-settings/OverwatchSettingsGuideGameplay.vue"), name: "overwatch-settings-gameplay" },
                            { path: "social", component: () => import("@/views/sub-views/guide/ow-settings/OverwatchSettingsGuideSocial.vue"), name: "overwatch-settings-social" },
                            { path: "a11y", component: () => import("@/views/sub-views/guide/ow-settings/OverwatchSettingsGuideAccessibility.vue"), name: "overwatch-settings-a11y" }
                        ]
                    },
                    {
                        path: "companion-module",
                        component: () => import("@/views/sub-views/guide/companion-module/CompanionModuleGuideContainer.vue"),
                        children: [
                            { path: "", component: () => import("@/views/sub-views/guide/companion-module/CompanionModuleGuideIntro.vue"), name: "companion-module" },
                            { path: "companion-setup", component: () => import("@/views/sub-views/guide/companion-module/CompanionModuleGuideSetupCompanion.vue"), name: "companion-module-companion" },
                            { path: "module-setup", component: () => import("@/views/sub-views/guide/companion-module/CompanionModuleGuideSetupModule.vue"), name: "companion-module-module" },
                            { path: "connections-buttons", component: () => import("@/views/sub-views/guide/companion-module/CompanionModuleGuideConnections.vue"), name: "companion-module-connections" }
                        ]
                    },
                ],
            },
            {
                path: "/tools",
                component: () => import("@/views/sub-views/guide/LearnWrapper.vue"),
                props: () => ({ subtitle: "Tools" }),
                children: [
                    {
                        path: "obs-scene-collections",
                        name: "obs-scene-collections",
                        component: () => import("@/views/sub-views/tools/ToolObsSceneCollections.vue")
                    },
                    {
                        path: "/tools/overwatch-settings-switcher",
                        name: "overwatch-settings-switcher",
                        component: () => import("@/views/sub-views/tools/ToolOWProfileShell.vue")
                    },

                ]
            },
            {
                path: "/tools/twitch-auth",
                name: "twitch-auth",
                component: TwitchAuthScopeSelector
            },
            {
                path: "/tools/bracket-creator",
                name: "bracket-creator",
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
        path: "/scenes",
        redirect: {
            name: "observing-tech-obs-scenes"
        }
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

    {
        path: "/reset",
        redirect: to => {
            console.log("setting cookies to empty");

            (new Cookies()).remove("auth", { path: "/" });
            (new Cookies()).remove("auth", { path: "/", domain: "." + window.location.hostname });

            return { path: "/" };
        },
    },
    { path: "/:pathMatch(.*)*", component: NotFoundPage }
    // {
    //     path: "/redirect",
    //     beforeEnter: (to, from, next) => {
    //         window.location.href = to.query.url;
    //     }
    // },
];

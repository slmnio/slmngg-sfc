import Vue from "vue";
import GlobalApp from "./apps/GlobalApp";
import store from "@/thing-store";
import Vuex from "vuex";
import VueMeta from "vue-meta";
import VueRouter from "vue-router";
import VueSocketIOExt from "vue-socket.io-extended";
import { io } from "socket.io-client";
import { VBTooltip } from "bootstrap-vue";
import VueYoutubeEmbed from "vue-youtube-embed";
import VueCookies from "vue-cookies";

import defaultRoutes from "@/router/default";
import { getDataServerAddress, fetchThings } from "@/utils/fetch";
import EventRoutes from "@/router/event";

import Event from "@/views/Event";
import MinisiteWrapperApp from "@/apps/MinisiteWrapperApp";
import NotFoundPage from "@/views/NotFoundPage";
import SharedRoutes from "@/router/shared-routes";
import { ReactiveRoot } from "@/utils/reactive";
import { authenticateWithToken } from "@/utils/auth";


Vue.use(Vuex);
Vue.use(VueMeta);
Vue.use(VueRouter);
Vue.use(VueYoutubeEmbed, { global: false });
Vue.use(VueCookies);

store.subscribe((mutation, state) => {
    if (mutation.type === "setPlayerDraftNotes") {
        // store to localstorage
        localStorage.setItem("draft-notes", JSON.stringify(state.draft_notes));
    }
});

Vue.directive("b-tooltip", VBTooltip);

const socket = io(getDataServerAddress(), { transports: ["websocket", "polling"] });

Vue.use(VueSocketIOExt, socket, { store });

Vue.config.productionTip = false;

Vue.component("v-style", {
    render: function (createElement) {
        return createElement("style", this.$slots.default);
    }
});


const host = window.location.hostname;
const domains = ["slmn.gg", "localslmn", "localhost"].map(d => new RegExp(`(?:^|(.*)\\.)${d.replace(".", "\\.")}(?:$|\\n)`));
let subdomain = null;
let routes = [];
let subID;

domains.forEach(r => {
    const result = host.match(r);
    if (result && result[1] && !["dev", "live"].includes(result[1])) {
        if (result[1].endsWith(".dev")) {
            result[1] = result[1].slice(0, -4);
        }
        if (result[1].endsWith(".live")) {
            result[1] = result[1].slice(0, -5);
        }
        subdomain = result[1];
    }
});

// TODO: add other domain support here

if (subdomain) {
    // verify event from subdomain
    console.log("[subdomain]", subdomain);
    routes = [
        {
            path: "/",
            component: MinisiteWrapperApp,
            children: [
                {
                    path: "/",
                    component: Event,
                    children: EventRoutes,
                    props: (route) => {
                        return {
                            id: subID,
                            isMinisite: true
                        };
                    }
                },
                ...SharedRoutes
            ]
        },
        { path: "/*", component: NotFoundPage }
    ];
} else {
    // default slmn.gg
    console.log("[subdomain]", "default routes applied");
    routes = defaultRoutes;
}

const router = new VueRouter({
    mode: "history",
    base: process.env.BASE_URL,
    routes
});

let preloadAuthCheckRequired = false;

// TODO: this doesn't really work very well nor work on the first run
router.beforeEach((to, from, next) => {
    try {
        console.log("routerResolve", to, this, app);
        if (to.meta.requiresAuth) {
            // authenticating!

            if (app && !app.auth.user) {
                return next({ path: "/login" });
                // TODO: to.fullPath can be used for return (set in localstorage or something  /redirect?to=)
            } else {
                console.warn("Need to check if authenticated, but the app hasn't loaded yet.");
                preloadAuthCheckRequired = true;
                // console.log(document.cookie);
                // return next({ path: "/login" });
            }
        }

        next();
    } catch (e) {
        console.error("Vue navigation error", e);
        next();
    }
});


const app = new Vue({
    router,
    render: h => h(GlobalApp),
    store,
    sockets: {
        connect() {
            console.log("[socket]", "connected", this.$store.state.subscribed_ids.length);
            this.$socket.client.emit("subscribe-multiple", this.$store.state.subscribed_ids);
        },
        data_update(d) {
            // handled by vuex
            console.log("[socket]", "data_update", d);
        },
        server_rebuilding(x) {
            console.log("rebuilding", x);
            this.isRebuilding = x;
        },
        high_error_rate(x) {
            console.log("high error rate", x);
            this.highErrorRate = x;
        }
    },
    metaInfo: {
        // title: "SLMN.GG",
        titleTemplate: (chunk) => chunk ? `${chunk} | SLMN.GG` : "SLMN.GG"
        // link: [
        //     { rel: "icon", href: "https://slmn.io/slmn-new.png" }
        // ]
    },
    data: () => ({
        interval: null,
        minisiteEventStatus: subdomain ? "loading" : null,
        isRebuilding: false,
        animationActive: true,
        activeScene: null,
        broadcast: null,
        defaults: {
            camParams: (["cover", "na", "animate=0"]).join("&")
        },
        auth: {
            token: null,
            user: null
        }
    }),
    async mounted() {
        console.log("[app]", "subdomain", subdomain);
        console.log("[app]", "data server", getDataServerAddress());
        if (subdomain) {
            this.loadMinisite(subdomain);
        }

        setInterval(() => app.$store.commit("executeRequestBuffer"), 100);

        try {
            if (localStorage.getItem("draft-notes")) {
                const notes = JSON.parse(localStorage.getItem("draft-notes"));
                this.$store.state.draft_notes = notes;
            }
        } catch (e) { console.error("Draft notes local storage error", e); }

        if (!this.auth.user) {
            const token = this.$cookies.get("token");
            if (token) {
                // authenticate
                await authenticateWithToken(this, token);
            }
        }

        if (!this.auth.user && preloadAuthCheckRequired) {
            console.warn("App loaded, recognising preload check is required and we're not authenticated. Sending to login");
            preloadAuthCheckRequired = false;
            this.$router.push("/login");
        }
    },
    computed: {
        minisiteEvent() {
            return this.$store.getters.thing(`subdomain-${subdomain}`);
        },
        version() {
            return process.env?.VUE_APP_SLMNGG_VERSION;
        },
        authUser() {
            if (!this.auth.user?.airtableID) return null;
            return ReactiveRoot(this.auth.user.airtableID);
        }
    },
    methods: {
        async loadMinisite(subdomain) {
            // get and verify
            const data = await fetchThings([`subdomain-${subdomain}`]);
            if (!data || !data[0] || !data[0].id) {
                // !! no valid minisite
                this.minisiteEventStatus = "failed";
            } else {
                // add minisite routes
                this.minisiteEventStatus = "success";
                subID = data[0]._original_data_id || data[0].id;
                store.dispatch("subscribe", subID);
                store.dispatch("subscribe", `subdomain-${subdomain}`);
                console.log("[subID]", subID);
                this.$router.addRoute("default", {
                    path: "/",
                    component: Event,
                    children: EventRoutes,
                    props: route => ({ id: data[0].id })
                });
                // EventRoutes.forEach(route => {
                //     this.$router.addRoute("event", route);
                // });
                // console.log("[route]", this.$router.getRoutes());
            }
        }
    }
}).$mount("#app");

import { configureCompat, createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import store from "@/thing-store";


import GlobalApp from "./apps/GlobalApp";
import VueMeta from "vue-meta";
import { io } from "socket.io-client";
import { createBootstrap } from "bootstrap-vue-next";
// import "bootstrap-vue/dist/bootstrap-vue.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";

import VueYoutubeEmbed from "vue-youtube-embed";
import VueCookies from "vue-cookies";

import { Notyf } from "notyf";
import "notyf/notyf.min.css";

import { getDataServerAddress } from "@/utils/fetch";
import { ReactiveRoot } from "@/utils/reactive";
import { authenticateWithToken, getAuthNext, setAuthNext } from "@/utils/auth";
import { createRouter } from "@/router";

import AuthRoutes from "@/router/auth-redirects";

configureCompat({
    COMPONENT_V_MODEL: false
});

const router = await createRouter();

let subdomain = false;


const app = createApp({
    render: h => h(GlobalApp),
    sockets: {
        connect() {
            console.log("[socket]", "connected", this.$store.state.subscribed_ids.length);
            this.$socket.client.emit("subscribe-multiple", this.$store.state.subscribed_ids);
        },
        data_update(d) {
            // handled by vuex
            console.log("[socket]", "data_update", d);
        },
        website_flags(flags) {
            console.log("website_flags", flags);
            this.isRebuilding = flags.includes("server_rebuilding");
            this.highErrorRate = flags.includes("high_error_rate");
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
        },
        // this is mainly for development, probably won't stay
        colorControls: {
            schema: {
                hue: 0,
                saturation: 0,
                overlay: 0,
                multiply: 0
            }
        }
    }),
    async mounted() {
        console.log("[app]", "data server", getDataServerAddress());


        setInterval(() => this.$store.commit("executeRequestBuffer"), 100);
        setInterval(() => this.$store.commit("executeUpdateBuffer"), 50);

        try {
            if (localStorage.getItem("draft-notes")) {
                const notes = JSON.parse(localStorage.getItem("draft-notes"));
                this.$store.state.draft_notes = notes;
            }
        } catch (e) {
            console.error("Draft notes local storage error", e);
        }

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
            if (preloadAuthReturn) setAuthNext(app, preloadAuthReturn);

            this.$router.push({
                path: "/login",
                query: {
                    return: getAuthNext(app, true)
                }
            });
        }
    },
    computed: {
        minisiteEvent() {
            return this.$store.getters.thing(`subdomain-${subdomain}`);
        },
        version() {
            return import.meta.env?.VITE_SLMNGG_VERSION;
        },
        authUser() {
            if (!this.auth.user?.airtableID) return null;
            return ReactiveRoot(this.auth.user.airtableID);
        }
    }
});


app.use(store);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);

router.addRoute(AuthRoutes(app));

app.use(router);

app.use(createBootstrap()); // Important

app.use(VueMeta);
app.use(VueYoutubeEmbed, { global: false });
app.use(VueCookies);

app.config.globalProperties.$notyf = new Notyf({
    duration: 5000,
    position: {
        x: "right",
        y: "top"
    },
    dismissible: true
});

store.subscribe((mutation, state) => {
    if (mutation.type === "setPlayerDraftNotes") {
        // store to localstorage
        localStorage.setItem("draft-notes", JSON.stringify(state.draft_notes));
    }
});


const socket = io(getDataServerAddress(), { transports: ["websocket", "polling"] });


app.config.$socket = { client: socket };

app.config.productionTip = false;

app.config.devtools = ["local", "staging"].includes(import.meta.env.VITE_DEPLOY_MODE);

app.component("v-style", {
    render: function (createElement) {
        return createElement("style", this.$slots.default);
    }
});


// TODO: add other domain support here


let preloadAuthCheckRequired = false;
let preloadAuthReturn = null;

// TODO: this doesn't really work very well nor work on the first run
router.beforeEach((to, from, next) => {
    try {
        // console.log("routerResolve", to, this, app);
        if (to.meta.requiresAuth) {
            // authenticating!

            getAuthNext(app); // empty auth

            if (app && !app.auth.user) {
                setAuthNext(app?.$root, to.fullPath);
                return router.push({
                    path: "/login",
                    query: { return: to.fullPath }
                });
                // TODO: to.fullPath can be used for return (set in localstorage or something  /redirect?to=)
            } else {
                console.warn("Need to check if authenticated, but the app hasn't loaded yet.");
                preloadAuthCheckRequired = true;
                preloadAuthReturn = to.fullPath;
                // console.log(document.cookie);
                // return next({ path: "/login" });
            }
        }
    } catch (e) {
        console.error("Vue navigation error", e);
    }

    next();
});


app.mount("#app");

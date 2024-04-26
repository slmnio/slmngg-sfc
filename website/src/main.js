import { createApp, h } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import store from "@/thing-store";

import GlobalApp from "./apps/GlobalApp";
import { createBootstrap } from "bootstrap-vue-next";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";

import { createHead, VueHeadMixin } from "@unhead/vue";
import VueCookies from "vue-cookies";
import VueConfetti from "vue-confetti";

import { Notyf } from "notyf";
import "notyf/notyf.min.css";

import { getDataServerAddress } from "@/utils/fetch";
import { ReactiveRoot } from "@/utils/reactive";
import { createRouter } from "@/router";

import socketMixin from "@/socket-client";
import { getSubdomain } from "@/utils/get-subdomain";
import { useAuthStore } from "@/stores/authStore";

const { subdomain, subID } = await getSubdomain();

const app = createApp({
    render: () => h(GlobalApp),
    head: {
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

        const auth = useAuthStore();
        if (auth.token) {
            console.log("Token in storage, authenticating");
            auth.authenticateWithToken(auth.token);
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

const { router } = createRouter(app, subID, subdomain);

app.use(store);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);

app.use(socketMixin);

app.use(router);

app.use(createBootstrap()); // Important

const head = createHead();
app.use(head);
app.mixin(VueHeadMixin);


app.use(VueCookies);
app.use(VueConfetti); // TODO figure out a way to not do this globally

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

app.component("v-style", {
    render: function () {
        return h("style", this.$slots.default);
    }
});


// TODO: add other domain support here


const preloadAuthCheckRequired = false;
const preloadAuthReturn = null;

// TODO: this doesn't really work very well nor work on the first run
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    try {
        // console.log("routerResolve", to, this, app);
        if (to.meta.requiresAuth && !authStore.isAuthenticated) {
            // page needs auth and auth is not finished

            if (authStore.token) {
                // token in storage - check with server
                await authStore.authenticateWithToken(authStore.token);
            }
            if (authStore.user) return next();

            // still no auth after that
            authStore.setAuthNext(to.fullPath);
            return router.push({
                path: "/login",
                query: { return: to.fullPath }
            });
        }
    } catch (e) {
        console.error("Vue navigation error", e);
    }

    next();
});


router.isReady().then(() => app.mount("#app"));

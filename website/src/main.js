import { createApp, h } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import store from "@/thing-store";

import GlobalApp from "./apps/GlobalApp";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";

import { createHead, VueHeadMixin } from "@unhead/vue/client";
import VueConfetti from "vue-confetti";

import { Notyf } from "notyf";
import "notyf/notyf.min.css";

import { getDataServerAddress } from "@/utils/fetch";
import { createRouter } from "@/router";

import socketMixin from "@/socket-client";
import { getSubdomain } from "@/utils/get-subdomain";
import { useAuthStore } from "@/stores/authStore";

const { subdomain, subID } = await getSubdomain();

const app = createApp({
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
    computed: {
        minisiteEvent() {
            return this.$store.getters.thing(`subdomain-${subdomain}`);
        },
        version() {
            return import.meta.env?.VITE_SLMNGG_VERSION;
        }
    },
    async mounted() {
        console.log("[app]", "data server", getDataServerAddress());


        setInterval(() => this.$store.commit("executeRequestBuffer"), 100);
        setInterval(() => this.$store.commit("executeUpdateBuffer"), 50);

        const auth = useAuthStore();
        if (auth.token) {
            console.log("Token in storage, authenticating");
            await auth.authenticateWithToken(auth.token);
        }
    },
    render: () => h(GlobalApp),
    head: {
        // title: "SLMN.GG",
        titleTemplate: (chunk) => chunk ? `${chunk} | SLMN.GG` : "SLMN.GG",
        link: [
            { rel: "icon", href: "/favicon.ico", key: "favicon" }
        ]
    }
});

const { router } = createRouter(app, subID, subdomain);

app.use(store);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);

app.use(socketMixin);

app.use(router);

const head = createHead();
app.use(head);
app.mixin(VueHeadMixin);

app.use(VueConfetti); // TODO figure out a way to not do this globally

app.config.globalProperties.$notyf = new Notyf({
    duration: 5000,
    position: {
        x: "right",
        y: "top"
    },
    dismissible: true
});

app.component("VStyle", {
    render: function () {
        return h("style", this.$slots.default());
    }
});

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
router.getRoutes(); // for some reason this triggers minisites to load properly

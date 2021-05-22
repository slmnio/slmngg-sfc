import Vue from "vue";
import GlobalApp from "./apps/GlobalApp";
import router from "./router";
import store from "@/thing-store";
import Vuex from "vuex";
import VueMeta from "vue-meta";
import VueSocketIOExt from "vue-socket.io-extended";
import { io } from "socket.io-client";

Vue.use(Vuex);
Vue.use(VueMeta);

const socket = io(process.env.NODE_ENV === "development" ? "http://localhost:8901" : "https://data.slmn.gg", { transports: ["websocket", "polling"] });

Vue.use(VueSocketIOExt, socket, { store });

Vue.config.productionTip = false;

const app = new Vue({
    router,
    render: h => h(GlobalApp),
    store,
    sockets: {
        connect() {
            console.log("[socket]", "connected");
        },
        data_update(d) {
            // handled by vuex
            console.log("[socket]", "data_update", d);
        }
    },
    metaInfo: {
        title: "SLMN.GG",
        titleTemplate: "%s | SLMN.GG"
    },
    data: () => ({ interval: null }),
    mounted() {
        setInterval(() => app.$store.commit("executeRequestBuffer"), 300);
    }
}).$mount("#app");

// app.sockets.subscribe("data_UPDATE", ([id, data]) => {
//     console.log("[thing]", "data_UPDATE", id, data);
//     store.commit("push", { id, data });
// });

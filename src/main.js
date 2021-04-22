import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "@/thing-store";
import Vuex from "vuex";
import VueMeta from "vue-meta";
import VueSocketIOExt from "vue-socket.io-extended";
import { io } from "socket.io-client";

Vue.use(Vuex);
Vue.use(VueMeta);

const socket = io("http://localhost:8901", { transports: ["websocket", "polling"] });

Vue.use(VueSocketIOExt, socket, { store });

Vue.config.productionTip = false;

new Vue({
    router,
    render: h => h(App),
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
    }
}).$mount("#app");

// app.sockets.subscribe("data_UPDATE", ([id, data]) => {
//     console.log("[thing]", "data_UPDATE", id, data);
//     store.commit("push", { id, data });
// });

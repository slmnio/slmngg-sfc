import Vue from "vue";
import GlobalApp from "./apps/GlobalApp";
import router from "./router";
import store from "@/thing-store";
import Vuex from "vuex";
import VueMeta from "vue-meta";
import VueSocketIOExt from "vue-socket.io-extended";
import { io } from "socket.io-client";
import { VBTooltip } from "bootstrap-vue";

Vue.use(Vuex);
Vue.use(VueMeta);

store.subscribe((mutation, state) => {
    if (mutation.type === "setPlayerDraftNotes") {
        // store to localstorage
        localStorage.setItem("draft-notes", JSON.stringify(state.draft_notes));
    }
});

Vue.directive("b-tooltip", VBTooltip);

const socket = io(process.env.NODE_ENV === "development" ? "http://localhost:8901" : "https://data.slmn.gg", { transports: ["websocket", "polling"] });

Vue.use(VueSocketIOExt, socket, { store });

Vue.config.productionTip = false;

Vue.component("v-style", {
    render: function (createElement) {
        return createElement("style", this.$slots.default);
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
        }
    },
    metaInfo: {
        title: "SLMN.GG",
        titleTemplate: "%s | SLMN.GG"
    },
    data: () => ({ interval: null }),
    mounted() {
        setInterval(() => app.$store.commit("executeRequestBuffer"), 300);

        try {
            if (localStorage.getItem("draft-notes")) {
                const notes = JSON.parse(localStorage.getItem("draft-notes"));
                console.log(notes);
                this.$store.state.draft_notes = notes;
            }
        } catch (e) { console.error("Draft notes local storage error", e); }
    }
}).$mount("#app");

// app.sockets.subscribe("data_UPDATE", ([id, data]) => {
//     console.log("[thing]", "data_UPDATE", id, data);
//     store.commit("push", { id, data });
// });

import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "@/thing-store";
import Vuex from "vuex";
import VueSocketIO from "vue-socket.io";
import VueMeta from "vue-meta";

Vue.use(Vuex);
Vue.use(VueMeta);
Vue.use(new VueSocketIO({
    debug: true,
    connection: "http://localhost:8901"
}));

Vue.config.productionTip = false;

const app = new Vue({
    router,
    render: h => h(App),
    store
}).$mount("#app");

app.sockets.subscribe("data-update", ([id, data]) => {
    console.log("[thing]", "data-update", id, data);
    store.commit("push", { id, data });
});

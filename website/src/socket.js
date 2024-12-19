import { reactive } from "vue";
import { io } from "socket.io-client";
import { getDataServerAddress } from "@/utils/fetch";
import store from "@/thing-store";

export const state = reactive({
    connected: false
});

export const socket = io(getDataServerAddress(), { transports: ["websocket", "polling"] });

socket.on("connect", () => {
    state.connected = true;
    if (store.state.subscribed_ids?.length) {
        socket.emit("subscribe-multiple", store.state.subscribed_ids);
    }
});

socket.on("disconnect", () => {
    state.connected = false;
});

socket.on("website_flags", (flags) => {
    console.log("website_flags", flags);
    store.commit("setWebsiteFlags", flags);
});

socket.on("data_update", (id, data) => {
    store.commit("socketDataUpdate", { id, data });
});

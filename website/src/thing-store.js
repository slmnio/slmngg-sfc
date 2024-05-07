import { socket } from "@/socket";
import { createStore } from "vuex";
import { cleanID } from "@/utils/content-utils";
import { fetchThings } from "@/utils/fetch";

const store = createStore({
    state: {
        things: [],
        thing_map: {},
        subscribed_ids: [],
        request_buffer: [],

        last_event_match_pages: [],

        data_update_buffer: [],
        website_flags: []
    },
    mutations: {
        push(_store, { id, data }) {
            data = JSON.parse(JSON.stringify({ ...data, id: cleanID(id), _original_data_id: cleanID(data.id), __stored: true }));

            const index = this.state.thing_map[id] || -1;
            if (index !== -1) {
                this.state.things.splice(index, 1, data);
                return this.state.things[index];
            } else {
                this.state.things.push(data);
                this.state.thing_map[id] = this.state.things.length - 1;
                return this.state.things[this.state.things.length - 1];
            }
        },
        addToRequestBuffer(state, id) {
            state.request_buffer.push(id);
        },
        clearRequestBuffer(state) {
            state.request_buffer = state.request_buffer.slice(100);
        },
        executeRequestBuffer(state) {
            const ids = state.request_buffer.slice(0, 100);
            if (!ids.length) return;
            this.commit("clearRequestBuffer");
            return fetchThings(ids);
        },
        socketDataUpdate(state, { id, data }) {
            // console.log("[store] [data_update] commit->", data);
            // this.commit("push", { id, data });
            state.data_update_buffer.push({ id, data });
        },
        executeUpdateBuffer(state) {
            if (!state.data_update_buffer.length) return;
            // console.log("[store] [data_update] execute->", state.data_update_buffer.length);
            state.data_update_buffer.forEach(({ id, data }) => {
                this.commit("push", { id, data });
            });
            state.data_update_buffer = [];
        },
        subscribe(state, id) {
            if (!id) return;
            if (state.subscribed_ids.includes(id)) return;
            socket.emit("subscribe", id);
            state.subscribed_ids.push(id);
        },
        unsubscribe(state, id) {
            if (!id) return;
            if (!state.subscribed_ids.includes(id)) return;
            socket.emit("unsubscribe", id);
            state.subscribed_ids.splice(this.state.subscribed_ids.indexOf(id), 1);
        },
        setEventMatchPage(state, { eventID, matchPage }) {
            if (!eventID) return;
            if (!matchPage) return;
            const item = { eventID, matchPage };
            const index = state.last_event_match_pages.findIndex(x => x.eventID === eventID);
            if (index === -1) return state.last_event_match_pages.push(item);
            state.last_event_match_pages.splice(index, 1, item);
        },
        setWebsiteFlags(state, flags) {
            state.website_flags = flags;
        }
    },
    getters: {
        things: state => state.things,
        thing: (state) => (id) => state.things[state.thing_map[id]],
        getLastMatchPage: state => (eventID) => state.last_event_match_pages.find(x => x.eventID === eventID),
        // highlightedMatch: (state, getters) => () => getters.thing(state.highlighted_match)
        hasWebsiteFlag: state => flag => state.website_flags.includes(flag)
    },
    actions: {
        subscribe: (state, data) => state.commit("subscribe", data),
        unsubscribe: (state, data) => state.commit("unsubscribe", data)
    }
});


export default store;


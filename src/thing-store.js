import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        things: new Map()
    },
    mutations: {
        push(_store, { id, data }) {
            data = JSON.parse(JSON.stringify(data));
            console.log(">update", id, this.state.things);
            this.state.things.set(id, data);
            // TODO: setup socket.io handler here for "data-update"
        }
    }
});

import Vue from "vue";
import Vuex from "vuex";
import { cleanID } from "@/utils/content-utils";
Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        things: []
    },
    mutations: {
        push(_store, { id, data }) {
            // console.log(data);
            data = JSON.parse(JSON.stringify({ ...data, id: cleanID(id), __stored: true }));
            // if ()

            const index = this.state.things.findIndex(t => t.id === id);
            // console.log(">update", id, this.state.things, index);
            if (index !== -1) {
                this.state.things.splice(index, 1, data);
                return this.state.things[index];
            } else {
                this.state.things.push(data);
                return this.state.things[this.state.things.length - 1];
            }

            // this.state.things.set(id, data);
            // TODO: setup socket.io handler here for "data-update"
        }
    },
    getters: {
        things: state => state.things
    }
});

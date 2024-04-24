import GlobalEmitter from "./global-emitter";
import createMixin from "./create-mixin";
import { socket } from "@/socket";

function install(Vue) {
    const emitter = (GlobalEmitter);
    socket.onAny((eventName, data) => {
        // console.log("socket receive", d);
        emitter.emit(eventName, data);
    });
    Vue.mixin(createMixin(emitter));
    const strategies = Vue.config.optionMergeStrategies;
    strategies.sockets = strategies.methods;
}

export { install };

import GlobalEmitter from "./global-emitter";
import createMixin from "./create-mixin";
import { socket } from "@/socket";

function install(Vue) {
    const emitter = (GlobalEmitter);
    socket.onAny((...d) => {
        // console.log("socket receive", d);
        const event = d.shift();
        emitter.emit(event, ...d);
    });
    Vue.mixin(createMixin(emitter));
    const strategies = Vue.config.optionMergeStrategies;
    strategies.sockets = strategies.methods;
}

export { install };

// import Observe from "./Observe";
import GlobalEmitter from "./global-emitter";
import createMixin from "./create-mixin";
// import { isSocketIo } from "./utils";
// import defaults from "./defaults";

// eslint-disable-next-line import/prefer-default-export
function install(Vue, socket, options) {
    // Observe(socket, options);
    Vue.mixin(createMixin(GlobalEmitter));
    const strategies = Vue.config.optionMergeStrategies;
    strategies.sockets = strategies.methods;
}

export { install };

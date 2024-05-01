class EventHandler {
    constructor() {
        this.fns = [];
    }
    dispatch(eventName, data) {
        this.fns.forEach(fn => {
            fn(eventName, data);
        });
    }
    subscribe(fn) {
        this.fns.push(fn);
    }
}

class DistributedEventHandler {
    constructor() {
        this.handlers = {};
    }
    dispatch(handlerName, eventName, data) {
        if (!handlerName) return;
        if (!this.handlers[handlerName]) return;
        this.handlers[handlerName].forEach(handler => {
            handler(eventName, data);
        });
    }

    subscribe(handlerName, fn) {
        if (!this.handlers[handlerName]) this.handlers[handlerName] = [];
        this.handlers[handlerName].push(fn);
    }
}

module.exports = { EventHandler, DistributedEventHandler };

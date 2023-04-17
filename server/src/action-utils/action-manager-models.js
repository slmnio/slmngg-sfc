const express = require("express");
const bodyParser = require("body-parser");
const {
    updateRecord,
    createRecord
} = require("./action-utils");

const Cache = require("../cache.js");
const permissions = require("./action-permissions");

class Action {
    /**
     * @param {string} key
     * @param {function} handler
     * @param {string[]} auth
     * @param {string[]} requiredParams
     * @param {string[]} optionalParams
     */
    constructor({ key, handler, auth, requiredParams, optionalParams, registerFunction }) {
        this.key = key;
        this.handler = handler;
        this.auth = auth;
        this.requiredParams = requiredParams;
        this.optionalParams = optionalParams;
        this.registerFunction = registerFunction;
    }

    execute(args, auth, { success, error }) {
        this.handler(args, auth)
            .then(data => {
                console.log(`[actions] Success in ${this.key}`, data);
                success(data);
            },
            e => {
                console.trace(e);
                let errorCode = e?.errorCode || 500;
                let errorMessage = e?.errorMessage || e?.message || e;
                error(errorCode, errorMessage);
            });
    }

    get helpers() {
        return {
            get: (...args) => Cache.get(...args),
            createRecord: (tableName, data) => createRecord(Cache, tableName, [data]),
            createRecords: (tableName, items) => createRecord(Cache, tableName, items),
            updateRecord: (tableName, item, data) => updateRecord(Cache, tableName, item, data),
            auth: Cache.auth,
            permissions
        };
    }
}

class ActionManager {
    constructor(args) {
        this._setup(args);
        this.actions = new Map(); // Map<Action>
    }

    _setup() {

    }

    finalSetup() {

    }

    async register(action, registerFunction) {
        if (!(action instanceof Action)) action = new Action(action);
        this.actions.set(action.key, action);
    }
}

class HTTPActionManager extends ActionManager {
    constructor({ cors }) {
        super({ cors });
        this.cors = cors;
    }

    _setup(args) {
        this.app = express.Router();
        this.app.use(bodyParser.json());
        this.app.options("/*", args.cors());
    }

    /**
     *
     * @param {Action} action
     * @param {function} registerFunction
     * @returns {Promise<void>}
     */
    async register(action, registerFunction) {
        await super.register(action, registerFunction);

        this.app.post(`/${action.key}`, this.cors(), async(req, res) => {
            let args = req.body;
            let token = this.getToken(req);

            registerFunction({
                token: token,
                args: args,
                error: (errorCode, errorMessage) => {
                    console.error(`[actions] Error in pre-processing for action [${action.key}]`);
                    res.status(errorCode).send({
                        error: true,
                        errorMessage
                    });
                },
                execute: (params, auth) => action.execute(params, auth, {
                    success: (data) => res.send({ error: false, data }),
                    error: (errorCode, errorMessage) => {
                        console.error(`[actions] Error during execution in action [${action.key}]`, {
                            errorCode,
                            errorMessage
                        });
                        res.status(errorCode).send({
                            error: true,
                            errorMessage
                        });
                    }
                })
            }).catch(e => {
                console.error("[actions] Manager register error", e);
                if (!res.headersSent) res.status(500).send({ error: true, errorMessage: "Error executing the action" });
            });
        });
    }

    getToken(req) {
        let token;

        let header = req.headers.authentication;
        if (!header || !header.startsWith("Bearer ")) return null;

        token = header.slice(("Bearer ").length);
        if (!token || token === "") return null;

        return token;
    }

    finalSetup(expressApp) {
        expressApp.use("/actions", this.app);
    }

}

class SocketActionManager extends ActionManager {
    constructor(props) {
        super(props);

    }

    _setup() {
        super._setup();
    }

    finalSetup(io) {
        io.on("connection", socket => {
            for (let [key, action] of this.actions) {
                if (!(action instanceof Action)) action = new Action(action);

                socket.on(action.key, async (args) => {
                    let token = socket.handshake?.query?.token;

                    action.registerFunction({
                        token: token,
                        args: args,
                        error: (errorCode, errorMessage) => {
                            console.error(`[actions] Error in pre-processing for action [${action.key}]`);
                            socket.emit("action_error", {
                                action: action.key,
                                error: true,
                                errorCode: errorCode || 500,
                                errorMessage
                            });
                        },
                        execute: (params, auth) => action.execute(params, auth, {
                            success: (data) => socket.emit(action.key, { error: false, ...data }),
                            error: (errorCode, errorMessage) => {
                                console.error(`[actions] Error during execution in action [${action.key}]`, {
                                    errorCode,
                                    errorMessage
                                });
                                socket.emit("action_error", {
                                    action: action.key,
                                    error: true,
                                    errorCode: errorCode || 500,
                                    errorMessage
                                });
                            }
                        })

                    }).catch(e => {
                        console.error("[actions] Manager register error", e);
                        socket.emit("action_error", {
                            action: action.key,
                            error: true,
                            errorCode: 500,
                            errorMessage: "Error executing the action"
                        });
                    });
                });
            }
        });
    }

    async register(action, registerFunction) {
        this.actions.set(action.key, {
            ...action,
            registerFunction
        });
    }

}

module.exports = {
    Action, HTTPActionManager, SocketActionManager
};

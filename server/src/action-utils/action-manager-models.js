import express from "express";
import bodyParser from "body-parser";
import { createRecord, updateRecord } from "./action-utils.js";

import * as Cache from "../cache.js";
import * as permissions from "./action-permissions.js";
import { createError, createRouter, defineEventHandler, getRequestHeader, readBody, useBase } from "h3";
import { h3App } from "../index.js";

function cleanID(id) {
    // console.log(">id", id);
    if (!id) return null;
    if (typeof id !== "string") return null;
    if (id.startsWith("rec") && id.length === 17) id = id.slice(3);
    return id;
}
function cleanUser(user) {
    // console.log("clean user", user);
    return ({
        discordID: user.discord?.id,
        airtableID: cleanID(user.airtable?.id),
        name: user.airtable.name,
        avatar: `https://cdn.discordapp.com/avatars/${user.discord.id}/${user.discord.avatar}.png`,
        website_settings: user.airtable.website_settings || []
    });
}


export class Action {
    /**
     * @param {string} key
     * @param {function} handler
     * @param {string[]} auth
     * @param {string[]} requiredParams
     * @param {string[]} optionalParams
     */
    constructor({
        key,
        handler,
        auth,
        requiredParams,
        optionalParams,
        registerFunction
    }) {
        this.key = key;
        this.handler = handler;
        this.auth = auth;
        this.requiredParams = requiredParams;
        this.optionalParams = optionalParams;
        this.registerFunction = registerFunction;
    }

    async execute(args, auth, {
        success,
        error
    }) {
        return this.handler(args, auth)
            .then(data => {
                console.log(`[actions] Success in ${this.key}`);
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
        this.actions.set(action.key, {
            ...action,
            registerFunction
        });
    }
}

export class HTTPActionManager extends ActionManager {
    constructor({ cors }) {
        super({ cors });
        this.cors = cors;
    }

    _setup(args) {
        this.app = createRouter();
        // this.app.options("/*", args.cors()); TODO CORS
    }

    /**
     *
     * @param {Action} action
     * @param {function} registerFunction
     * @returns {Promise<void>}
     */
    async register(action, registerFunction) {
        await super.register(action, registerFunction);

        this.app.post(`/${action.key}`, defineEventHandler(async (event) => {
            let args = await readBody(event);
            let token = this.getToken(event);

            registerFunction({
                token: token,
                args: args,
                error: (errorCode, errorMessage) => {
                    console.error(`[actions] Error in pre-processing for action [${action.key}]`);
                    // TODO error: true
                    throw createError({
                        status: errorCode,
                        message: errorMessage
                    });
                },
                execute: (params, auth) => action.execute(params, auth, {
                    success: (data) => ({
                        error: false,
                        ...data
                    }),
                    error: (errorCode, errorMessage) => {
                        console.error(`[actions] Error during execution in action [${action.key}]`, {
                            errorCode,
                            errorMessage
                        });
                        // TODO error: true
                        throw createError({
                            status: errorCode,
                            message: errorMessage
                        });
                    }
                })
            }).catch(e => {
                console.error("[actions] Manager register error", e);
                // TODO uncomment
                // if (!res.headersSent) {
                //     res.status(500).send({
                //         error: true,
                //         errorMessage: "Error executing the action"
                //     });
                // }
            });
        }));
    }

    /**
     * @param {import("h3").H3Event<import("h3").EventHandlerRequest>} event
     * @returns {string|null}
     */
    getToken(event) {
        let token;

        let header = getRequestHeader(event, "authentication");
        if (!header || !header.startsWith("Bearer ")) return null;

        token = header.slice(("Bearer ").length);
        if (!token || token === "") return null;

        return token;
    }

    finalSetup() {
        h3App.use("/actions", useBase("/actions", this.app.handler));
    }

}

export class SocketActionManager extends ActionManager {
    constructor(props) {
        super(props);

    }

    _setup() {
        super._setup();
    }

    finalSetup(io) {
        io.on("connection", socket => {
            if (socket.handshake?.query?.token) {
                // auth check
                (async () => {
                    let userData = await Cache.auth.getData(socket.handshake.query.token);
                    if (!userData?.user) {
                        socket.emit("auth_status", { error: true, message: "Unknown token" });
                    } else {
                        socket.emit("auth_status", { error: false, user: cleanUser(userData.user)});
                    }
                })();
            }

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

export class InternalActionManager extends ActionManager {

    constructor(props) {
        super(props);

        this.auth = {
            user: null,
            client: null
        };
    }

    async runAction(actionKey, args, token, isAutomation) {
        let action = this.actions.get(actionKey);
        if (!(action instanceof Action)) action = new Action(action);
        if (!action) return console.error(`Oh god no action ${actionKey}`);
        return new Promise((resolve, reject) => {
            action.registerFunction({
                token,
                args,
                error: (errorCode, errorMessage) => reject({ errorCode, errorMessage }),
                execute: (params, authObjects) => action.execute(params, authObjects, {
                    error: (errorCode, errorMessage) => reject({ errorCode, errorMessage }),
                    success: resolve,
                }),
                isAutomation
            });
        });
    }

    async runActionAsAutomation(actionKey, args) {
        let action = this.actions.get(actionKey);
        if (!(action instanceof Action)) action = new Action(action);
        return new Promise((resolve, reject) => {
            return action.execute(args, { isAutomation: true }, {
                success: (s) => resolve(s),
                error: (e) => reject(e)
            });
        });
    }
}

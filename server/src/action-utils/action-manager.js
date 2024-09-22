import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import express from "express";
import bodyParser from "body-parser";
import { getSelfClient } from "./action-utils.js";
import { Action, HTTPActionManager, InternalActionManager, SocketActionManager } from "./action-manager-models.js";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));

let actions = [];

async function loadActions(directory) {
    try {
        await fs.stat(directory);
    } catch (e) {
        console.error(`[actions] trying to load folder but error: [${e.code}] ${e.message}`);
        return [];
    }
    const files = (await fs.readdir(directory)).filter(file => file.endsWith(".js") || file.endsWith(".ts"));
    console.log(`[actions] loading ${files.length} actions`);
    console.log(files.map(filename => ` + ${filename}`).join("\n"));
    return await Promise.all(files.map(file => import(pathToFileURL(path.join(directory, file)))));
}

let managers = {};

export async function load(expressApp, cors, Cache, io) {
    const actionApp = express.Router();
    actionApp.use(bodyParser.json());
    actionApp.options("/*", cors());
    actions = (await loadActions(path.join(DIRNAME, "..", "actions"))) || [];

    /**
     *
     * @type {(ActionManager)[]}
     */

    managers = {
        http: new HTTPActionManager({ cors }),
        socket: new SocketActionManager({ cors }),
        internal: new InternalActionManager()
    };

    let requireAuth = true;

    Object.values(managers).forEach(manager => {
        actions.forEach(action => {
            action = new Action(action.default);

            manager.register(action, async ({ token, args, error, execute, isAutomation }) => {
                let params = {};
                let authObjects = {};

                if (isAutomation) {
                    requireAuth = false;
                    authObjects.isAutomation = true;
                }

                if (requireAuth && !token) return error(401, "Unauthorized");

                if (action.requiredParams && !action.requiredParams.every(key => args[key] !== undefined)) {
                    return error(400, "Missing required parameter");
                }

                if (!isAutomation && action.auth?.includes("user")) {
                    /** @type {AuthUserData.user} */
                    authObjects.user = (await Cache.auth.getData(token))?.user;
                    if (!authObjects.user) return error(401, "Unauthorized operation. You might have a stale token (try logging in again)");
                }
                if (!isAutomation && action.auth?.includes("client")) {
                    authObjects.client = await getSelfClient(Cache, token);
                    if (!authObjects.client) return error(401, "No client data associated with this token");
                }

                if (action.optionalParams) {
                    (action.optionalParams || []).forEach(key => {
                        params[key] = args[key];
                    });
                }
                if (action.requiredParams) {
                    (action.requiredParams || []).forEach(key => {
                        params[key] = args[key];
                    });
                }

                try {
                    return execute(params, authObjects);
                } catch (e) {
                    console.error("[Action manager register outer]", e);
                }
            });
        });
    });

    // EXPORT NOW
    managers.http.finalSetup(expressApp);
    managers.socket.finalSetup(io);
}

/**
 * @returns {InternalActionManager}
 */
export function getInternalManager() {
    return managers?.internal;
}

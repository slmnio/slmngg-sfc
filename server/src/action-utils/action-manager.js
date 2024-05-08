const fs = require("fs/promises");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const { getSelfClient } = require("./action-utils");

const {
    HTTPActionManager,
    SocketActionManager,
    Action,
    InternalActionManager
} = require("./action-manager-models");

let actions = [];

async function loadActions(directory) {
    try {
        await fs.stat(directory);
    } catch (e) {
        console.error(`[actions] trying to load folder but error: [${e.code}] ${e.message}`);
        return [];
    }
    const files = (await fs.readdir(directory)).filter(file => file.endsWith(".js"));
    console.log(`[actions] loading ${files.length} actions`);
    console.log(files.map(filename => ` + ${filename}`).join("\n"));
    return files.map(file => require(path.join(directory, file)));
}

let managers = {};

async function load(expressApp, cors, Cache, io) {
    const actionApp = express.Router();
    actionApp.use(bodyParser.json());
    actionApp.options("/*", cors());
    actions = (await loadActions(path.join(__dirname, "..", "actions"))) || [];

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
            action = new Action(action);

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


module.exports = {
    load,
    /**
     * @returns {InternalActionManager}
     */
    getInternalManager() {
        return managers?.internal;
    }
};

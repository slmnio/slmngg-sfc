const fs = require("fs/promises");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const { getSelfClient,
    updateRecord,
    createRecord
} = require("./action-utils");

let actions = [];
async function loadActions(directory) {
    try {
        await fs.stat(directory);
    } catch (e) {
        console.error(`[actions] trying to load folder but error: [${e.code}] ${e.message}`);
        return;
    }
    const files = (await fs.readdir(directory)).filter(file => file.endsWith(".js"));
    console.log(`[actions] loading ${files.length} actions`);
    console.log(files.map(filename => ` + ${filename}`).join("\n"));
    return files.map(file => require(path.join(directory, file)));
}

async function load(expressApp, cors, Cache) {
    const actionApp = express.Router();
    actionApp.use(bodyParser.json());
    actionApp.options("/*", cors());
    actions = (await loadActions(path.join(__dirname, "actions"))) || [];

    actions.forEach(action => {
        let requireAuth = true;
        actionApp.post(`/${action.key}`, cors(), async(req, res) => {
            let token;
            let params = {};
            let authObjects = {};

            if (requireAuth) {
                let header = req.headers.authentication;
                if (!header || !header.startsWith("Bearer ")) return res.status(401).send({ error: true, errorMessage: "Unauthorized" });
                token = header.slice(("Bearer ").length);
                if (!token || token === "") return res.status(401).send({ error: true, errorMessage: "Unauthorized" });
            }

            if (action.requiredParams && !action.requiredParams.every(key => req.body[key])) {
                return res.status(400).send({ error: true, errorMessage: "Missing required parameter" });
            }
            if (action.auth?.includes("user")) {
                authObjects.user = (await Cache.auth.getData(token))?.user;
                if (!authObjects.user) return res.status(401).send({ error: true, errorMessage: "Unauthorized operation. You might have a stale token (try logging in again)" });
            }
            if (action.auth?.includes("client")) {
                authObjects.client = await getSelfClient(Cache, token);
                if (!authObjects.client) return res.status(403).send({ error: true, errorMessage: "No client data associated with this user" });
            }

            if (action.requiredParams) {
                (action.requiredParams || []).forEach(key => {
                    params[key] = req.body[key];
                });
            }

            await action.handler(
                async (data) => res.send({ error: false, ...data }),
                async (errorMessage, errorCode) => res.status(errorCode || 400).send({ error: true, errorMessage }),
                params,
                authObjects,
                {
                    updateRecord: (tableName, item, data) => updateRecord(Cache, tableName, item, data),
                    get: Cache.get,
                    createRecord: (tableName, data) => createRecord(Cache, tableName, data),
                }
            );
        });
    });

    // web api
    expressApp.use("/actions", actionApp);
}


module.exports = {
    load
};

import fs from "node:fs";
import path from "node:path";
import { onUpdate } from "./cache.js";
import { fileURLToPath, pathToFileURL } from "node:url";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));

const automations = [];
const filesPath = path.join(DIRNAME, "automation");
const files = fs.readdirSync(filesPath);

console.log("[auto] loading automations");
for (const fileName of files) {
    const filePath = path.join(filesPath, fileName);
    const { default: automation } = await import(pathToFileURL(filePath));
    automations.push(automation);
    console.log(" ~ ", fileName);
}

onUpdate(async (id, {oldData, newData}) => {
    if (!oldData) return;
    if (newData?.customKey) return; // remove things set multiple times with a custom key (e.g. subdomain-bpl)
    for (const auto of automations) {
        auto.handler({ id, oldData, newData });
    }
});

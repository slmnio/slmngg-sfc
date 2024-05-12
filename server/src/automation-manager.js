import fs from "node:fs";
import path from "node:path";
import { onUpdate } from "./cache.js";
import { pathToFileURL } from "node:url";

const automations = [];
const filesPath = path.join(import.meta.dirname, "automation");
const files = fs.readdirSync(filesPath);

console.log("[auto] loading automations");
for (const fileName of files) {
    const filePath = path.join(filesPath, fileName);
    const { default: automation } = await import(pathToFileURL(filePath));
    automations.push(automation);
    console.log(" ~ ", fileName);
}

onUpdate(async (id, {oldData, newData}) => {
    if (newData?.customKey) return;
    for (const auto of automations) {
        auto.handler({ id, oldData, newData });
    }
});

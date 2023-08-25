const fs = require("fs");
const path = require("path");
const { onUpdate } = require("./cache");

const automations = [];
const filesPath = path.join(__dirname, "automation");
const files = fs.readdirSync(filesPath);

console.log("[auto] loading automations");
for (const fileName of files) {
    const filePath = path.join(filesPath, fileName);
    const automation = require(filePath);
    automations.push(automation);
    console.log(" ~ ", fileName);
}

onUpdate(async (id, {oldData, newData}) => {
    if (newData?.customKey) return;
    for (const auto of automations) {
        auto.handler({ id, oldData, newData });
    }
});

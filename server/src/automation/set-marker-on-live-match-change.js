const Cache = require("../cache");
const { cleanID } = require("../action-utils/action-utils");
const { getInternalManager } = require("../action-utils/action-manager");
module.exports = {
    /**
     *
     * @param {AnyAirtableID} id
     * @param {object} newData
     * @param {object?} oldData
     * @returns {Promise<void>}
     */
    async handler({ id, newData, oldData }) {
        if (newData?.__tableName !== "Broadcasts") return;
        if (!oldData) return;

        const settings = newData?.automation_settings || [];
        if (!settings.includes("Set marker when live match changes")) return;

        if (cleanID(oldData?.live_match?.[0]) === cleanID(newData?.live_match?.[0])) return;

        await Cache.get(id);
        const manager = getInternalManager();
        if (!manager) return console.error("No internal manager can run automation action");

        console.log("[auto] live match changed", id, newData?.name , oldData?.live_match?.[0], "->", newData?.live_match?.[0]);
        const actionResponse = await manager.runActionAsAutomation("set-marker", {
            "broadcastID": id
        }).catch(console.error);
        console.log("[auto] live match", id, newData?.name , oldData?.live_match?.[0], "->", newData?.live_match?.[0]);
        console.log("[auto] action response", actionResponse);
    }
};
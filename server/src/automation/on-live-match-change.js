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

        if (cleanID(oldData?.live_match?.[0]) === cleanID(newData?.live_match?.[0])) return;

        await Cache.get(id);
        const manager = getInternalManager();
        if (!manager) return console.error("No internal manager can run automation action");

        console.log("[auto] live match changed", id, newData?.name , oldData?.live_match?.[0], "->", newData?.live_match?.[0]);

        if (settings.includes("Send Discord message when live match changes")) {
            const actionResponse = await manager.runActionAsAutomation("send-match-discord-message", {
                "broadcastID": id
            }).catch(console.error);
            console.log("[auto] action response", actionResponse);
        }
        if (settings.includes("Set marker when live match changes")) {
            const actionResponse = await manager.runActionAsAutomation("set-marker", {
                "broadcastID": id
            }).catch(console.error);
            console.log("[auto] action response", actionResponse);
        }
        if (settings.includes("Set title when live match changes")) {
            const actionResponse = await manager.runActionAsAutomation("set-title", {
                "broadcastID": id
            }).catch(console.error);
            console.log("[auto] action response", actionResponse);
        }
    }
};

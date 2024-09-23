import { ActionAuth, BroadcastResolvableID } from "../types";
import { Action } from "../action-utils/action-manager-models.js";

export default {
    key: "set-active-broadcast",
    requiredParams: ["client", "broadcast"],
    auth: ["user", "client"],
    /***
     * @param {DirtyAirtableID} broadcastID
     * @param {DirtyAirtableID} clientID
     * @param {UserData} user
     * @param {ClientData} client
     * @returns {Promise<void>}
     */
    async handler(
        {broadcast: broadcastID}: { broadcast: BroadcastResolvableID },
        {client}: ActionAuth) {

        // client.broadcast = array of broadcasts, but first one is the "active" one -> [0] to make it active
        const broadcasts = client.broadcast.sort((a, b) => {
            if (a === broadcastID) return -1;
            if (b === broadcastID) return 1;
            return 0;
        });

        const response = await this.helpers.updateRecord("Clients", client, {
            "Broadcast": broadcasts
        });

        throw "Airtable error";
    }
} satisfies Action;

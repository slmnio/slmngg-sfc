import type { ActionAuth, BroadcastResolvableID} from "shared";
import { dirtyID } from "shared";
import type { Action } from "../action-utils/action-manager-models.js";

export default {
    key: "set-active-broadcast",
    requiredParams: ["client", "broadcast"],
    auth: ["user", "client"],
    /***
     * @param {DirtyAirtableID} broadcastID
     * @param {DirtyAirtableID} clientID
     * @param {ActionAuth["client"]} client
     * @returns {Promise<void>}
     */
    async handler(
        {broadcast: broadcastID}: { broadcast: BroadcastResolvableID },
        {client}: ActionAuth) {

        // client.broadcast = array of broadcasts, but first one is the "active" one -> [0] to make it active
        // TODO: this client?.broadcast is unnecessary because having ["client"] in auth guarantees a client object.
        //       need some typescript wizardry to make this automatic
        const broadcasts = (client?.broadcast || []).sort((a, b) => {
            if (dirtyID(a) === dirtyID(broadcastID)) return -1;
            if (dirtyID(b) === dirtyID(broadcastID)) return 1;
            return 0;
        });

        await this.helpers.updateRecord("Clients", client, {
            "Broadcast": broadcasts
        });
    }
// @ts-expect-error Needs some action refactoring before it can fully satisfy
} satisfies Action;

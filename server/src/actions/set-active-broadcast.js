import { dirtyID } from "../action-utils/action-utils.js";

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
    async handler({ broadcast: broadcastID }, { client }) {
        broadcastID = dirtyID(broadcastID);

        // client.broadcast = array of broadcasts, but first one is the "active" one -> [0] to make it active
        let broadcasts = client.broadcast.sort((a,b) => {
            if (a === broadcastID) return -1;
            if (b === broadcastID) return 1;
            return 0;
        });

        let response = await this.helpers.updateRecord("Clients", client, {
            "Broadcast": broadcasts
        });

        if (response?.error) {
            console.error("Airtable error", response.error);
            throw "Airtable error";
        }
    }
};

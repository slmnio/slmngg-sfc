const { dirtyID } = require("../action-utils");

module.exports = {
    key: "set-active-broadcast",
    requiredParams: ["client", "broadcast"],
    auth: ["user", "client"],
    /***
     * @param {ActionSuccessCallback} success
     * @param {ActionErrorCallback} error
     * @param {DirtyAirtableID} broadcastID
     * @param {DirtyAirtableID} clientID
     * @param {UserData} user
     * @param {ClientData} client
     * @param {SimpleUpdateRecord} updateRecord
     * @returns {Promise<void>}
     */
    async handler(success, error, { broadcast: broadcastID }, { client }, { updateRecord }) {
        broadcastID = dirtyID(broadcastID);

        // client.broadcast = array of broadcasts, but first one is the "active" one -> [0] to make it active
        let broadcasts = client.broadcast.sort((a,b) => {
            if (a === broadcastID) return -1;
            if (b === broadcastID) return 1;
            return 0;
        });

        let response = await updateRecord("Clients", client, {
            "Broadcast": broadcasts
        });

        return response?.error ? error("Airtable error", 500) : success();
    }
};

module.exports = {
    key: "toggle-player-cams",
    auth: ["client"],
    /***
     * @param {ActionSuccessCallback} success
     * @param {ActionErrorCallback} error
     * @param {ClientData} client
     * @param {CacheGetFunction} get
     * @param {SimpleUpdateRecord} updateRecord
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line no-empty-pattern
    async handler(success, error, {  }, { client }, { get, updateRecord }) {
        let broadcast = await get(client?.broadcast?.[0]);
        if (!broadcast) error("No broadcast associated");

        let response = await updateRecord("Broadcasts", broadcast, {
            "Show Cams": !broadcast.show_cams
        });

        return response?.error ? error("Airtable error", 500) : success();
    }
};

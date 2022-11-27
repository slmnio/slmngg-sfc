module.exports = {
    key: "set-map-attack",
    auth: ["client"],
    optionalParams: ["side"],
    /***
     * @param {ActionSuccessCallback} success
     * @param {ActionErrorCallback} error
     * @param {ClientData} client
     * @param {CacheGetFunction} get
     * @param {SimpleUpdateRecord} updateRecord
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line no-empty-pattern
    async handler(success, error, { side }, { client }, { get, updateRecord }) {
        let broadcast = await get(client?.broadcast?.[0]);
        if (!broadcast) error("No broadcast associated");

        let eligibleSides = [null, "Left", "Right", "Both"];
        if (!eligibleSides.includes(side)) return error("Invalid side");


        let response = await updateRecord("Broadcasts", broadcast, {
            "Map Attack": side
        });

        return response?.error ? error("Airtable error", 500) : success();
    }
};

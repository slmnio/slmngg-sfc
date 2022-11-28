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
    async handler({ side }, { client }) {
        let broadcast = await this.helpers.get(client?.broadcast?.[0]);
        if (!broadcast) throw ("No broadcast associated");

        let eligibleSides = [null, "Left", "Right", "Both"];
        if (!eligibleSides.includes(side)) throw ("Invalid side");

        let response = await this.helpers.updateRecord("Broadcasts", broadcast, {
            "Map Attack": side
        });

        if (response?.error) {
            console.error("Airtable error", response.error);
            throw "Airtable error";
        }
    }
};

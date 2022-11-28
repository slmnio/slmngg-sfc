module.exports = {
    key: "toggle-player-cams",
    auth: ["client"],
    /***
     * @param {Object?} params
     * @param {ClientData} client
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line no-empty-pattern
    async handler(params, { client }) {
        let broadcast = await this.helpers.get(client?.broadcast?.[0]);
        if (!broadcast) throw "No broadcast associated";

        let response = await this.helpers.updateRecord("Broadcasts", broadcast, {
            "Show Cams": !broadcast.show_cams
        });
        if (response?.error) {
            console.error("Airtable error", response.error);
            throw "Airtable error";
        }
    }
};

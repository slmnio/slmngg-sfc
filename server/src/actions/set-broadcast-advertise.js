
module.exports = {
    key: "set-broadcast-advertise",
    auth: ["client"],
    optionalParams: ["advertise"],
    /***
     * @param {boolean} advertise
     * @param {ClientData} client
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line no-empty-pattern
    async handler({ advertise }, { client }) {
        let broadcast = await this.helpers.get(client?.broadcast?.[0]);
        if (!broadcast) throw ("No broadcast associated");

        advertise = !!advertise;

        let response = await this.helpers.updateRecord("Broadcasts", broadcast, {
            "Advertise": advertise
        });

        if (response?.error) {
            console.error("Airtable error", response.error);
            throw "Airtable error";
        }
    }
};

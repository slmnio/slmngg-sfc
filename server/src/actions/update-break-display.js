const { getBroadcast } = require("../action-utils/action-utils");

module.exports = {
    key: "update-break-display",
    auth: ["client"],
    requiredParams: ["option"],
    /***
     * @param {string} option
     * @param {ClientData} client
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line no-empty-pattern
    async handler({ option }, { client }) {

        const broadcast = await getBroadcast(client);

        let validOptions = [
            "Automated",
            "Schedule",
            "Standings",
            "Image",
            "Bracket",
            "Staff",
            "Matchup",
            "Title",
            "Other Streams",
            "Other Info",
        ];

        if (!validOptions.includes(option) && option !== null) {
            throw "Invalid option provided";
        }

        let response = await this.helpers.updateRecord("Broadcasts", broadcast,{
            "Break Display": option
        });

        if (response?.error) {
            console.error("Airtable error", response.error);
            throw "Airtable error";
        }
    }
};

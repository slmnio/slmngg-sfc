import { getBroadcast } from "../action-utils/action-utils.js";

export default {
    key: "update-break-automation",
    auth: ["client"],
    requiredParams: ["options"],
    /***
     * @param {string[]} options
     * @param {ActionAuth["client"]} client
     * @returns {Promise<void>}
     */

    async handler({ options }, { client }) {

        const broadcast = await getBroadcast(client);

        let validOptions = [
            "use: Schedule",
            "use: Standings",
            "use: Image",
            "use: Staff",
            "use: Bracket",
            "use: Matchup",
            "use: Title",
            "use: Other Info",
            "setting: Always do 30s Matchup",
            "setting: Always do 30s Schedule"
        ];

        if (!options.every(option => validOptions.includes(option))) {
            throw "Invalid options provided";
        }

        let response = await this.helpers.updateRecord("Broadcasts", broadcast,{
            "Break Automation": options
        });

        if (response?.error) {
            console.error("Airtable error", response.error);
            throw "Airtable error";
        }
    }
};

export default {
    key: "toggle-flip-teams",
    auth: ["client"],
    /***
     * @param {Object?} params
     * @param {ClientData} client
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line no-empty-pattern
    async handler(params, { client }) {
        let broadcast = await this.helpers.get(client?.broadcast?.[0]);
        if (!broadcast?.id) throw "No broadcast associated";

        let match = await this.helpers.get(broadcast?.live_match?.[0]);
        if (!match?.id) throw "No match associated";

        let response = await this.helpers.updateRecord("Matches", match, {
            "Flip Teams": !match.flip_teams
        });

        if (response?.error) {
            console.error("Airtable error", response.error);
            throw "Airtable error";
        }
    }
};

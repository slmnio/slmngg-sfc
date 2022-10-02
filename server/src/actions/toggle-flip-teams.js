module.exports = {
    key: "toggle-flip-teams",
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

        let match = await get(broadcast?.live_match?.[0]);
        if (!match) error("No match associated");

        let response = await updateRecord("Matches", match, {
            "Flip Teams": !match.flip_teams
        });

        return response?.error ? error("Airtable error", 500) : success();
    }
};

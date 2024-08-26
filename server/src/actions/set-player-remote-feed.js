module.exports = {
    key: "set-player-remote-feed",
    requiredParams: ["discordData"],
    auth: ["user"],
    /***
     * @param { ? } player
     * @param { string } feed
     */
    async handler({ player, feed }, { isAutomation }) {
        if (!isAutomation) throw "This action can only be run internally.";

        return this.helpers.updateRecord("Players", player, {
            "Remote Feed": feed
        });
    }
};

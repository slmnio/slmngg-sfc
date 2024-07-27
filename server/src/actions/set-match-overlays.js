export default {
    key: "set-match-overlays",
    auth: ["user"],
    requiredParams: ["match", "overlayType", "state"],
    /***
     * @param {Object?} params
     * @param {ClientData} client
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line no-empty-pattern
    async handler({ match: matchID, overlayType, state }, { user }) {
        if (!user.airtable?.website_settings?.includes("Can edit any match")) throw { errorMessage: "You don't have permission to edit this item", errorCode: 403 };

        let match = await this.helpers.get(matchID);
        if (!match?.id) throw "No match associated";

        overlayType = overlayType.toLowerCase();
        if (!["primary", "secondary"].includes(overlayType)) throw "Unknown overlay type";

        let updateData = {};

        if (overlayType === "primary") updateData = { "Show on Overlays": !!state };
        if (overlayType === "secondary") updateData = { "Show on Secondary Overlays": !!state };

        let response = await this.helpers.updateRecord("Matches", match, updateData);

        if (response?.error) {
            console.error("Airtable error", response.error);
            throw "Airtable error";
        }
    }
};

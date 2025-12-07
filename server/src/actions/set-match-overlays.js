export default {
    key: "set-match-overlays",
    auth: ["user"],
    requiredParams: ["match", "overlayType", "state"],
    /***
     * @param {Object?} params
     * @param {ActionAuth["user"]} user
     * @returns {Promise<void>}
     */

    async handler({ match: matchID, overlayType, state }, { user }) {
        const match = await this.helpers.get(matchID);
        if (!match?.id) throw "No match associated";
        if (!(await this.helpers.permissions.canEditMatch(user, { match }))) throw { errorMessage: "You don't have permission to edit this item", errorCode: 403 };

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

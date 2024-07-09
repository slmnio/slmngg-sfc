const { cleanID, dirtyID } = require("../action-utils/action-utils");
module.exports = {
    key: "update-gfx-index",
    auth: ["client"],
    requiredParams: ["gfxID", "index"],
    /***
     * @param {AnyAirtableID} gfxID
     * @param {number} index
     * @param {ClientData} client
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line no-empty-pattern
    async handler({ gfxID, index }, { client }) {
        let broadcast = await this.helpers.get(client?.broadcast?.[0]);
        if (!broadcast?.id) throw ("No broadcast associated");

        gfxID = cleanID(gfxID);

        const gfxArray = (broadcast.gfx || []).map(id => cleanID(id));
        if (!gfxArray.includes(gfxID)) throw "GFX is not associated with the broadcast";

        let replacingId = gfxArray[index];
        let replacingIndex = gfxArray.indexOf(gfxID);

        const newArray = gfxArray;

        newArray[index] = gfxID;
        newArray[replacingIndex] = replacingId;

        await this.helpers.updateRecord("Broadcasts", broadcast, {
            "GFX": newArray.map(id => dirtyID(id))
        });
    }
};

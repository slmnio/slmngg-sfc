const { safeInput } = require("../action-utils/action-utils");

module.exports = {
    key: "update-broadcast",
    auth: ["client"],
    optionalParams: ["match", "advertise", "playerCams", "mapAttack", "title", "manualGuests"],
    /***
     * @param {AnyAirtableID} match
     * @param {ClientData} client
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line no-empty-pattern
    async handler({ match: matchID, advertise, playerCams, mapAttack, title, manualGuests }, { client }) {
        let broadcast = await this.helpers.get(client?.broadcast?.[0]);
        if (!broadcast) throw ("No broadcast associated");

        console.log({ matchID, advertise, playerCams, mapAttack, title, manualGuests });
        let validatedData = {};

        if (matchID !== undefined) {
            if (matchID === null) {
                validatedData["Live Match"] = null;
            } else {
                let match = await this.helpers.get(matchID);
                if (!match) throw ("Unknown match");
                validatedData["Live Match"] = [ match.id ];
            }
        }
        if (mapAttack !== undefined) {
            let eligibleSides = [null, "Left", "Right", "Both"];
            if (!eligibleSides.includes(mapAttack)) throw ("Invalid side");
            validatedData["Map Attack"] = mapAttack;
        }
        if (advertise !== undefined) {
            validatedData["Advertise"] = !!advertise;
        }
        if (playerCams !== undefined) {
            validatedData["Show Cams"] = !!playerCams;
        }
        if (title !== undefined) {
            validatedData["Title"] = safeInput(title);
        }
        if (manualGuests !== undefined) {
            validatedData["Manual Guests"] = safeInput(manualGuests);
        }

        console.log(validatedData);

        let response = await this.helpers.updateRecord("Broadcasts", broadcast, validatedData);

        if (response?.error) {
            console.error("Airtable error", response.error);
            throw "Airtable error";
        }
    }
};

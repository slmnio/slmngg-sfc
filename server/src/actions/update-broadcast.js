import { safeInput, safeInputNoQuotes } from "../action-utils/action-utils.js";

export default {
    key: "update-broadcast",
    auth: ["client"],
    optionalParams: ["match", "advertise", "playerCams", "mapAttack", "title", "manualGuests", "deskDisplayMode", "deskDisplayText", "showLiveMatch", "countdownEnd"],
    /***
     * @param {AnyAirtableID} match
     * @param {ClientData} client
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line no-empty-pattern
    async handler({ match: matchID, advertise, playerCams, mapAttack, title, manualGuests, deskDisplayMode, deskDisplayText, showLiveMatch, countdownEnd }, { client }) {
        let broadcast = await this.helpers.get(client?.broadcast?.[0]);
        if (!broadcast) throw ("No broadcast associated");

        console.log({ matchID, advertise, playerCams, mapAttack, title, manualGuests, deskDisplayMode, deskDisplayText, showLiveMatch });
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
        if (showLiveMatch !== undefined) {
            validatedData["Show Live Match"] = !!showLiveMatch;
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
        if (deskDisplayMode !== undefined) {
            let eligibleModes = [null, "Match", "Predictions", "Maps", "Notice (Team 1)", "Notice (Team 2)", "Notice (Event)", "Scoreboard", "Drafted Maps", "Interview", "Hidden", "Casters"];
            if (!eligibleModes.includes(deskDisplayMode)) throw ("Invalid display mode");
            validatedData["Desk Display"] = deskDisplayMode;
        }
        if (deskDisplayText !== undefined) {
            validatedData["Notice Text"] = safeInputNoQuotes(deskDisplayText);
        }
        if (countdownEnd !== undefined) {
            validatedData["Countdown End"] = countdownEnd ? new Date(countdownEnd) : countdownEnd;
        }

        console.log(validatedData);

        let response = await this.helpers.updateRecord("Broadcasts", broadcast, validatedData);

        if (response?.error) {
            console.error("Airtable error", response.error);
            throw "Airtable error";
        }
    }
};

const { safeInput, safeInputNoQuotes } = require("../action-utils/action-utils");

module.exports = {
    key: "update-broadcast",
    auth: ["client"],
    optionalParams: ["match", "advertise", "playerCams", "mapAttack", "title", "manualGuests", "deskDisplayMode", "deskDisplayText", "showLiveMatch", "countdownEnd", "highlightTeamID", "highlightHeroID", "highlightPlayerID"],
    /***
     * @param {AnyAirtableID} match
     * @param {ClientData} client
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line no-empty-pattern
    async handler({
        match: matchID,
        advertise,
        playerCams,
        mapAttack,
        title,
        manualGuests,
        deskDisplayMode,
        deskDisplayText,
        showLiveMatch,
        countdownEnd,
        highlightTeamID,
        highlightHeroID,
        highlightPlayerID
    }, { client }) {
        let broadcast = await this.helpers.get(client?.broadcast?.[0]);
        if (!broadcast) throw ("No broadcast associated");

        console.log({ matchID, advertise, playerCams, mapAttack, title, manualGuests, deskDisplayMode, deskDisplayText, showLiveMatch, highlightTeamID, highlightHeroID, highlightPlayerID });
        let validatedData = {};

        if (matchID !== undefined) {
            if (matchID === null) {
                validatedData["Live Match"] = null;
            } else {
                let match = await this.helpers.get(matchID);
                if (!match) throw ("Unknown match");
                if (match.__tableName !== "Matches") throw ("Live match object is not a Match");
                validatedData["Live Match"] = [ match.id ];
            }
        }
        if (highlightTeamID !== undefined) {
            if (highlightTeamID === null) {
                validatedData["Highlight Team"] = null;
            } else {
                let team = await this.helpers.get(highlightTeamID);
                if (!team) throw ("Unknown highlight team");
                if (team.__tableName !== "Teams") throw ("Highlight team object is not a Team");
                validatedData["Highlight Team"] = [ team.id ];
            }
        }
        if (highlightHeroID !== undefined) {
            if (highlightHeroID === null) {
                validatedData["Highlight Hero"] = null;
            } else {
                let hero = await this.helpers.get(highlightHeroID);
                if (!hero) throw ("Unknown highlight hero");
                if (hero.__tableName !== "Heroes") throw ("Highlight hero object is not a Hero");
                validatedData["Highlight Hero"] = [ hero.id ];
            }
        }
        if (highlightPlayerID !== undefined) {
            if (highlightPlayerID === null) {
                validatedData["Highlight Player"] = null;
            } else {
                let player = await this.helpers.get(highlightPlayerID);
                if (!player) throw ("Unknown highlight player");
                if (player.__tableName !== "Players") throw ("Highlight player object is not a Player");
                validatedData["Highlight Player"] = [ player.id ];
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
            validatedData["Title"] = safeInputNoQuotes(title);
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

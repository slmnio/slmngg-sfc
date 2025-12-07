import { safeInput, safeInputNoQuotes } from "../action-utils/action-utils.js";

export default {
    key: "update-broadcast",
    auth: ["client"],
    optionalParams: ["match", "advertise", "playerCams", "mapAttack", "title", "manualGuests", "deskDisplayMode", "deskDisplayText", "showLiveMatch", "countdownEnd", "highlightTeamID", "highlightHeroID", "highlightPlayerID", "highlightMediaID", "triviaSettings"],
    /***
     * @param {AnyAirtableID} match
     * @param {ActionAuth["client"]} client
     * @returns {Promise<void>}
     */

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
        highlightPlayerID,
        highlightMediaID,
        triviaSettings
    }, { client }) {
        let broadcast = await this.helpers.get(client?.broadcast?.[0]);
        if (!broadcast?.id) throw ("No broadcast associated");

        console.log({ matchID, advertise, playerCams, mapAttack, title, manualGuests, deskDisplayMode, deskDisplayText, showLiveMatch, highlightTeamID, highlightHeroID, highlightPlayerID, highlightMediaID });
        let validatedData = {};

        if (matchID !== undefined) {
            if (matchID === null) {
                validatedData["Live Match"] = null;
            } else {
                let match = await this.helpers.get(matchID);
                if (!match?.id) throw ("Unknown match");
                if (match.__tableName !== "Matches") throw ("Live match object is not a Match");
                validatedData["Live Match"] = [ match.id ];
            }
        }
        if (highlightTeamID !== undefined) {
            if (highlightTeamID === null) {
                validatedData["Highlight Team"] = null;
            } else {
                let team = await this.helpers.get(highlightTeamID);
                if (!team?.id) throw ("Unknown highlight team");
                if (team.__tableName !== "Teams") throw ("Highlight team object is not a Team");
                validatedData["Highlight Team"] = [ team.id ];
            }
        }
        if (highlightHeroID !== undefined) {
            if (highlightHeroID === null) {
                validatedData["Highlight Hero"] = null;
            } else {
                let hero = await this.helpers.get(highlightHeroID);
                if (!hero?.id) throw ("Unknown highlight hero");
                if (hero.__tableName !== "Heroes") throw ("Highlight hero object is not a Hero");
                validatedData["Highlight Hero"] = [ hero.id ];
            }
        }
        if (highlightPlayerID !== undefined) {
            if (highlightPlayerID === null) {
                validatedData["Highlight Player"] = null;
            } else {
                let player = await this.helpers.get(highlightPlayerID);
                if (!player?.id) throw ("Unknown highlight player");
                if (player.__tableName !== "Players") throw ("Highlight player object is not a Player");
                validatedData["Highlight Player"] = [ player.id ];
            }
        }
        if (highlightMediaID !== undefined) {
            if (highlightMediaID === null) {
                validatedData["Highlight Media"] = null;
            } else {
                let media = await this.helpers.get(highlightMediaID);
                if (!media?.id) throw ("Unknown highlight media");
                if (media.__tableName !== "News") throw ("Highlight media object is not a News item");
                validatedData["Highlight Media"] = [ media.id ];
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
            let eligibleModes = [null, "Match", "Predictions", "Maps", "Notice (Team 1)", "Notice (Team 2)", "Notice (Event)", "Scoreboard", "Drafted Maps", "Drafted Maps (Reveal)", "Interview", "Hidden", "Casters", "Scoreboard Bans", "Hero Draft"];
            if (!eligibleModes.includes(deskDisplayMode)) throw ("Invalid display mode");
            validatedData["Desk Display"] = deskDisplayMode;
        }
        if (deskDisplayText !== undefined) {
            validatedData["Notice Text"] = safeInputNoQuotes(deskDisplayText);
        }
        if (countdownEnd !== undefined) {
            validatedData["Countdown End"] = countdownEnd ? new Date(countdownEnd) : countdownEnd;
        }
        if (triviaSettings !== undefined) {
            validatedData["Trivia Settings"] = (typeof(triviaSettings) === typeof({})) ? JSON.stringify(triviaSettings) : triviaSettings;
        }

        console.log(validatedData);

        let response = await this.helpers.updateRecord("Broadcasts", broadcast, validatedData);

        if (response?.error) {
            console.error("Airtable error", response.error);
            throw "Airtable error";
        }
    }
};

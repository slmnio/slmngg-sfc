const { isEventStaffOrHasRole } = require("../action-utils/action-permissions");
const { dirtyID } = require("../action-utils/action-utils")

module.exports = {
    key: "adjust-match-broadcast",
    auth: ["client", "user"],
    requiredParams: ["mode", "broadcastID", "matchID"],
    async handler({ mode, broadcastID: newBroadcastID, matchID }, { client, user }) {

        if (!["add", "remove"].includes(mode)) throw { errorCode: 400, errorMessage: "Unknown mode" }

        const match = await this.helpers.get(matchID);
        if (!match?.event?.[0]) throw { errorCode: 404, errorMessage: "Couldn't find that match" }

        const event = await this.helpers.get(match.event[0]);
        if (!event) throw { errorCode: 404, errorMessage: "Couldn't find that event" }

        if (!(await isEventStaffOrHasRole(
            user, 
            event,
            "Broadcast Manager", 
            ["Can edit any match", "Can edit any event", "Full broadcast permissions"]
        ))) throw { errorCode: 403, errorMessage: "You don't have permission to edit this match" }

        const newBroadcast = await this.helpers.get(newBroadcastID);
        if (!newBroadcast) throw { errorCode: 404, errorMessage: "Couldn't find that broadcast" }


        const broadcastIDs = (match.scheduled_broadcast || []).map(dirtyID);
        newBroadcastID = dirtyID(newBroadcastID);

        if (mode === "add") {
            if (broadcastIDs.includes(newBroadcastID)) return "Match already assigned to broadcast";
            broadcastIDs.push(newBroadcastID)
        }
        else if (mode === "remove") {
            if (!broadcastIDs.includes(newBroadcastID)) return "Match is not assigned to broadcast";
            broadcastIDs.splice(broadcastIDs.indexOf(newBroadcastID), 1);  
        }
        
        let response = await this.helpers.updateRecord("Matches", match, {
            "Scheduled Broadcast": broadcastIDs
        });

        if (response?.error) {
            console.error("Airtable error", response.error);
            throw "Airtable error";
        }
        
        return `Match ${mode === 'add' ? 'added to' : 'removed from'} ${newBroadcast?.name}`;
        // u like this
        //i think so? is this not just double confirm
        // always good to get confirmation from the server rather than the client 
        // where is that outputed? the logs somewhere?

        // come

    }
}
const { isEventStaffOrHasRole } = require("../action-utils/action-permissions");
module.exports = {
    key: "find-player-data",
    requiredParams: ["eventID", "playerData"],
    auth: ["user"],
    async handler({ eventID, playerData }, { user }) {
        const event = await this.helpers.get(eventID);
        if (!event?.id) {
            throw {
                errorCode: 400,
                errorMessage: "Cannot find that event"
            };
        }
        if (!(await isEventStaffOrHasRole(user, event, null, ["Can edit any event"]))) {
            throw {
                errorCode: 403,
                errorMessage: "You don't have permission to get data for this event"
            };
        }

        if (!playerData?.length) return [];

        const { players } = await this.helpers.get("internal:lookup-players");

        return playerData.map(({ name, discord_tag, battletag, discord_id, id }) => {
            const player = players.find(p => {
                if (discord_tag && p.discord_tag === discord_tag) return true;
                if (battletag && p.battletag === battletag) return true;
                if (discord_id && p.discord_id === discord_id) return true;
                if (id && p.id === id) return true;
                //p.discord_tag === discord_tag || p.battletag === battletag || p.discord_id === discord_id
                return false;
            });
            if (player) return player;
            if (name) return players.find(p => p.name === name);
            return null;
        });
    }
};

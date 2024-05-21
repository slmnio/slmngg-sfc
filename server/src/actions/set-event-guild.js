const { isEventStaffOrHasRole } = require("../action-utils/action-permissions");
const { MapObject } = require("../discord/managers");

module.exports = {
    key: "set-event-guild",
    requiredParams: ["guildID", "eventID"],
    auth: ["user"],
    /***
     * @param {Snowflake} guildID
     * @param {AnyAirtableID} eventID
     * @param {UserData} user
     * @returns {Promise<void>}
     */
    async handler({ eventID, guildID }, { user }) {
        const event = await this.helpers.get(eventID);
        if (!event) throw { errorCode: 400, errorMessage: "Cannot find that event" };
        if (!(await isEventStaffOrHasRole(user, event, null, ["Can edit any event"]))) throw { errorCode: 403, errorMessage: "You don't have permission to edit this event" };

        const guilds = ((await this.helpers.get("discord-guilds"))?.guilds) || [];
        if (!guildID && !guilds.find(guild => guild.id === guildID)) throw { errorCode: 400, errorMessage: "Cannot find that guild" };

        const control = new MapObject(event?.discord_control || "");
        control.push("guild_id", guildID);

        const response = this.helpers.updateRecord("Events", event, {
            "Discord Control": control.textMap
        });

        if (response?.error) {
            console.error("Airtable error", response.error);
            throw "Airtable error";
        }
    }
};

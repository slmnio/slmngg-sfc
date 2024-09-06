const { isEventStaffOrHasRole } = require("../action-utils/action-permissions");
const client = require("../discord/client");
const { MapObject } = require("../discord/managers");

module.exports = {
    key: "get-discord-server-data",
    requiredParams: ["eventID"],
    auth: ["user"],
    /***
     * @param {AnyAirtableID} eventID
     * @param {Snowflake} guildID
     * @param {string[]} teamSettings
     * @param {string[]} runSettings
     *
     * @param {{}} settings
     * @param {string[]} settings.textChannelRoles
     * @param {string[]} settings.voiceChannelRoles
     * @param {UserData} user
     * @returns {Promise<void>}
     */
    async handler({ eventID }, { user }) {
        if (!client?.guilds) {
            throw {
                errorCode: 500,
                errorMessage: "Discord service is not available"
            };
        }

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
        if (!event?.discord_control) throw "No Discord data set for this event";

        const eventControl = new MapObject(event?.discord_control);
        const guildID = eventControl.get("guild_id");
        if (!guildID) throw "No Discord server set for this event";
        const guild = client.guilds.resolve(guildID);
        if (!guild?.available) {
            throw {
                errorCode: 400,
                errorMessage: "Guild not found or unavailable"
            };
        }

        return guild.roles.cache;
    }
};


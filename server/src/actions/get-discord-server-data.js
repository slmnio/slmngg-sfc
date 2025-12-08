import { isEventStaffOrHasRole } from "../action-utils/action-permissions.js";
import client from "../discord/client.js";
import { MapObject } from "shared";


export default {
    key: "get-discord-server-data",
    requiredParams: ["eventID", "dataType"],
    auth: ["user"],
    /***
     * @param {AnyAirtableID} eventID
     *
     * @param {'roles' | 'channels'} dataType
     * @param {ActionAuth['user']} user
     * @returns {Promise<void>}
     */
    async handler({ eventID, dataType }, { user }) {
        if (!client?.guilds) {
            throw {
                errorCode: 500,
                errorMessage: "Discord service is not available"
            };
        }
        if (!["roles", "channels"].includes(dataType)) throw "Unknown data type";

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

        if (dataType === "roles") {
            return guild.roles.cache;
        } else if (dataType === "channels") {
            return guild.channels.cache;
        }
    }
};


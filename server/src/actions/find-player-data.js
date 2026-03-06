import { isEventStaffOrHasRole } from "../action-utils/action-permissions.js";
import { lookupPlayer } from "../action-utils/ts-action-utils.js";
import client from "../discord/client.js";
import { MapObject } from "shared";

export default {
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

        let eventGuild = null;
        if (event.discord_control) {
            const eventDiscord = new MapObject(event.discord_control);
            const eventGuildID = eventDiscord.getString("guild_id");
            if (eventGuildID) {
                try {
                    const testGuild = await client.guilds.fetch(eventGuildID);
                    if (testGuild?.available) {
                        eventGuild = testGuild;
                    }
                } catch (e) {
                    console.warn(e);
                }
            }
        }

        return Promise.all(playerData.map(async (player) => (await lookupPlayer(player, players, eventGuild)).player));
    }
};

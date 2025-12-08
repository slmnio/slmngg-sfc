import { ActionAuth, TeamResolvableID } from "shared";
import { get } from "../action-utils/action-cache.js";
import { isEventStaffOrHasRole } from "../action-utils/action-permissions.js";
import { Action } from "../action-utils/action-manager-models.js";

export default {
    key: "update-discord-color",
    requiredParams: ["teamID", "color"],
    auth: ["user"],
    async handler(
        {teamID, color}: {
            teamID: TeamResolvableID,
            color: string
        },
        {user}: ActionAuth
    ) {
        const team = await get(teamID);
        if (!team?.id) throw "Team couldn't be loaded";
        if (!team?.event?.[0])  throw "Event couldn't be loaded";
        const event = await get(team.event[0]);
        if (!event?.id) throw "Event couldn't be loaded";
        if (!(await isEventStaffOrHasRole(user, event, null, ["Can edit any match", "Can edit any event", "Full broadcast permissions"]))) {
            throw "You don't have permission to edit this team's colors.";
        }
        if (!team?.theme?.[0]) throw "No theme associated with this team";
        const theme = await get(team.theme[0]);

        await this.helpers.updateRecord("Themes", theme, {
            "Color: Theme on Dark": color.trim().toUpperCase()
        }, "actions/update-discord-color");
    }
} as Action;

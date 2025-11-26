import { Action } from "../action-utils/action-manager-models.js";
import { ActionAuth, cleanTypedID, EventSettings, MapObject, MatchResolvableID } from "shared";
import { get } from "../action-utils/action-cache.js";
import { getTeamEmojiText, sendRecordedMessage } from "../action-utils/ts-action-utils.js";
import { hammerTime } from "../action-utils/action-utils.js";

export default {
    key: "send-reschedule-message",
    requiredParams: ["matchID", "newTime"],
    auth: ["user"],
    async handler(
        { matchID, newTime }:
        { matchID: MatchResolvableID, newTime: string },
        { user, isAutomation }: ActionAuth
    ) {
        if (!newTime) throw { errorMessage: "Cannot send a message for no new time" };
        const match = await get(matchID);
        if (!(isAutomation || (await this.helpers.permissions.canEditMatch(user, { match })))) throw { errorMessage: "You don't have permission to edit this item", errorCode: 403 };
        if (!match?.id) throw "Couldn't load match data";


        /* Almost all of this is lifted from automation/on-score-report-update.ts but I don't want to trigger the whole thing
            especially since this doesn't need a Report to run
        *  */

        if (!match?.event?.length) throw "No event data available for this match";
        const event = await get(match?.event?.[0]);
        if (!event?.id || !event?.blocks) throw "No event data available for this match";
        const eventSettings = JSON.parse(event.blocks) as EventSettings;
        let subdomain = "";
        if (event?.subdomain || event?.partial_subdomain) {
            subdomain = (event.subdomain || event.partial_subdomain || "") + ".";
        }
        const matchLink = `https://${subdomain}slmn.gg/match/${cleanTypedID(match.id)}`;

        if (!eventSettings.logging?.matchTimeChanges) throw "No rescheduling channel found for this match";

        const allTeams = await Promise.all((match.teams || []).map(id => get(id)));
        const allTeamsDisplay = (await Promise.all(allTeams.map(async (t) => (await getTeamEmojiText(t) || "") + (t.name || t.code || "")))).join(" vs ");

        const teamPings = allTeams.map(opponent => {
            const discordControl = new MapObject(opponent?.discord_control);
            return discordControl.get("role_id") ? `<@&${discordControl.get("role_id")}>` : "";
        });
        await sendRecordedMessage({
            key: "reschedule_completed",
            mapObject: new MapObject(), // we don't care about this
            channelID: eventSettings.logging?.matchTimeChanges,
            content: `⌚ Match reschedule ${teamPings.join(" ")}: \n${allTeamsDisplay} ${match.start ? "rescheduled to" : "scheduled for"} ${hammerTime(newTime)}.\n${matchLink}`
        });
    }
} as Action;

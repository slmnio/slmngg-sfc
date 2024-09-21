import { isEventStaffOrHasRole } from "../action-utils/action-permissions.js";

export default {
    key: "set-event-settings",
    auth: ["user"],
    requiredParams: ["settings", "eventID"],
    async handler({ settings, eventID }, { user }) {
        const event = await this.helpers.get(eventID);
        if (!event?.id) throw { errorCode: 404, errorMessage: "Couldn't find that event" };

        if (!(await isEventStaffOrHasRole(
            user,
            event,
            null,
            ["Can edit any event"]
        ))) throw { errorCode: 403, errorMessage: "You don't have permission to edit this event" };

        let settingsJSON;
        try {
            settingsJSON = JSON.parse(settings);
        } catch (e) {
            throw "Malformed JSON object";
        }

        let response = await this.helpers.updateRecord("Events", event, {
            "Blocks": JSON.stringify(settingsJSON, null, 4)
        });

        if (response?.error) {
            console.error("Airtable error", response.error);
            throw "Airtable error";
        }
    }
};

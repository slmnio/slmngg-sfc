import type { MatchResolvableID } from "shared";
import * as Cache from "../../../cache.js";
import { getInternalManager } from "../../../action-utils/action-manager.js";
import type { InteractionHandler } from "../../interactions.js";

export default {
    execute: async (interaction, args) => {

        // auth through discord
        const { token } = await Cache.auth.startRawDiscordAuth(interaction.user);
        if (!token) throw "Could not authenticate you with SLMN.GG.";

        const matchID = args[0] as MatchResolvableID;
        const action = args[1] as "approve" | "deny";

        console.log("approval", { matchID, action }, interaction.message);

        const internalManager = getInternalManager();
        if (!internalManager) {
            throw "Could not handle this request (no internal system available)";
        }
        const managerResponse = await internalManager.runAction("approve-match-reschedule", { matchID: matchID, reaction: action }, token);
        console.log(managerResponse);

        if (managerResponse?.error) {
            throw managerResponse.error;
        } else {
            return managerResponse;
        }
    }
} satisfies InteractionHandler;

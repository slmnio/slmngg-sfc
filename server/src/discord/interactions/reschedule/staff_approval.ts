import { Interaction, InteractionType, } from "discord.js";
import { MatchResolvableID } from "../../../types.js";
import * as Cache from "../../../cache.js";
import { getInternalManager } from "../../../action-utils/action-manager.js";

export default {
    execute: async (interaction: Interaction, args: string[]) => {
        if (interaction.type !== InteractionType.MessageComponent) return;

        // auth through discord
        const { token } = await Cache.auth.startRawDiscordAuth(interaction.user);
        if (!token) throw "Could not authenticate you with SLMN.GG.";

        const matchID = args[0] as MatchResolvableID;
        const action = args[1] as "approve" | "pre-approve" | "force-approve" | "deny" | "delete";

        console.log("approval", { matchID, action }, interaction.message);

        const internalManager = getInternalManager();
        if (!internalManager) {
            throw "Could not handle this request (no internal system available)";
        }
        const managerResponse = await internalManager.runAction("staff-approve-match-reschedule", { matchID: matchID, reaction: action }, token);
        console.log(managerResponse);

        if (managerResponse?.error) {
            throw managerResponse.error;
        } else {
            return managerResponse;
        }
    }
};

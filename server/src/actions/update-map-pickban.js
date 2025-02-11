import { dirtyID } from "../action-utils/action-utils";

export default {
    key: "update-map-pickban",
    requiredParams: ["matchID", "mapID", "mapData"],
    auth: ["user"],
    async handler({ matchID, mapID, mapData }, { user }) {
        const match = await this.helpers.get(matchID);
        if (!match.id) throw "Could not load match data";
        const existingMapData = await this.helpers.get(mapID);
        if (!existingMapData?.id) throw "Could not load map data";

        if (!match.maps.includes(existingMapData.id))
            throw "Map and match mismatch";

        const captainIds = (
            await Promise.all(
                (match.teams || []).map((t) => this.helpers.get(t))
            )
        ).map((t) => t.captains);
        if (
            !captainIds.includes(user.id) ||
            (await this.helpers.permissions.canEditMatch(user, { match }))
        )
            throw {
                errorMessage: "You don't have permission to edit this item",
                errorCode: 403,
            };

        const flip = (mapData.flip_pick_ban_order !== undefined ? mapData.flip_pick_ban_order : existingMapData.flip_pick_ban_order) || false;

        // This allows match editors to do whatever with this endpoint, though IDK why they'd use it.
        // Otherwise restricts captain to only editing their side of the picks/bans.
        const isTeamCaptain = captainIds.includes(user.id);
        const isTeamOneCaptain = isTeamCaptain && captainIds.indexOf(user.id) === (flip ? 1 : 0);

        const updates = {};

        // TODO: Probaly only update this if draft is empty
        if (mapData.flip_pick_ban_order !== existingMapData.flip_pick_ban_order) {
            updates["Flip Pick Ban Order"] = mapData.flip_pick_ban_order;
        }

        const team_1_picks = (mapData.team_1_picks || []).filter(Boolean).map((id) => dirtyID(id));
        if (JSON.stringify(team_1_picks) !== JSON.stringify(existingMapData.team_1_picks || []) && (!isTeamCaptain || isTeamOneCaptain)) {
            updates["Team 1 Picks"] = team_1_picks;
        }

        const team_2_picks = (mapData.team_2_picks || []).filter(Boolean).map((id) => dirtyID(id));
        if (JSON.stringify(team_2_picks) !== JSON.stringify(existingMapData.team_2_picks || []) && (!isTeamCaptain || !isTeamOneCaptain)) {
            updates["Team 2 Picks"] = team_2_picks;
        }

        const team_1_bans = (mapData.team_1_bans || []).filter(Boolean).map((id) => dirtyID(id));
        if (JSON.stringify(team_1_bans) !== JSON.stringify(existingMapData.team_1_bans || []) && (!isTeamCaptain || isTeamOneCaptain)) {
            updates["Team 1 Bans"] = team_1_bans;
        }

        const team_2_bans = (mapData.team_2_bans || []).filter(Boolean).map((id) => dirtyID(id));
        if (JSON.stringify(team_2_bans) !== JSON.stringify(existingMapData.team_2_bans || []) && (!isTeamCaptain || !isTeamOneCaptain)) {
            updates["Team 2 Bans"] = team_2_bans;
        }

        const response = this.helpers.updateRecord("Maps", existingMapData, updates);
        if (response?.error) throw "Airtable error";
    },
};

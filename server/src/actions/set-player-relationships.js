const { dirtyID } = require("../action-utils/action-utils");

function getLanguage(role) {
    const plural = {
        "Graphics Operator": "Graphics Operators"
    };

    return {
        "Plural Name": plural[role] || `${role}s`,
        "Player Text": `${role} for`
    };
}


module.exports = {
    key: "set-player-relationships",
    requiredParams: ["matchID", "roles"],
    auth: ["client", "user"],
    /***
     * @param {Object?} params
     * @param {ClientData} client
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line no-empty-pattern
    async handler({ matchID, roles }, { user }) {

        let match = await this.helpers.get(matchID);
        if (!match) throw "No match associated";
        if (!(await this.helpers.permissions.canEditMatch(user, { match }))) throw { errorMessage: "You don't have permission to edit this item", errorCode: 403 };

        const matchRelationships = await Promise.all((match.player_relationships || []).map(id => this.helpers.get(id)));

        const newToAdd = [];

        console.log(roles);

        for (const roleKey in roles) {
            for (const playerID of roles[roleKey].selected) {
                if (!playerID) continue;
                const player = await this.helpers.get(playerID);
                if (!player) continue;
                const playerRelationships = await Promise.all((player.player_relationships || []).map(id => this.helpers.get(id)));

                const realRelation = playerRelationships.filter((x) => x.singular_name === roleKey);
                if (realRelation.length) {
                    newToAdd.push(realRelation[0].id);
                } else {
                    const [newRelationship] = await this.helpers.createRecord("Player Relationships", {
                        "Singular Name": roleKey,
                        "Player": [dirtyID(player.id)],
                        ...getLanguage(roleKey)
                    });

                    await this.helpers.updateRecord("Players", player, {
                        "Player Relationships": [...(player.player_relationships || []), newRelationship.id]
                    });

                    newToAdd.push(newRelationship.id);
                }
            }
        }

        const nonDashboardRelationships = matchRelationships.filter((x) => !(Object.keys(roles).includes(x.singular_name)));

        console.log({
            newToAdd, nonDashboardRelationships
        });

        const newRelationshipIDs = [...newToAdd, ...nonDashboardRelationships].filter((v, i, a) => a.indexOf(v) === i);

        let response = await this.helpers.updateRecord("Matches", match, {
            "Player Relationships": newRelationshipIDs
        });

        if (response?.error) {
            console.error("Airtable error", response.error);
            throw "Airtable error";
        }

        return {
            added: newRelationshipIDs
        };
    }
};

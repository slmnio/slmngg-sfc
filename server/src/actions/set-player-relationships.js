module.exports = {
    key: "set-player-relationsips",
    requiredParams: ["matchID", "roles"],
    auth: ["client"],
    /***
     * @param {Object?} params
     * @param {ClientData} client
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line no-empty-pattern
    async handler({ matchID, roles }, { client }) {

        let match = await this.helpers.get(matchID);
        if (!match) throw "No match associated";
        const matchRelationships = await Promise.all((match.player_relationships || []).map(id => this.helpers.get(id)))

        const newToAdd = [];

        for (roleKey in roles) {
            for (playerID of roles[roleKey].selected) {
                const player = await this.helpers.get(playerID);
                if (!player) continue
                
                const realRelation = player.player_relationships.filter((x) => x.singular_name == roleKey);
                if (realRelation.length < 1) {
                    // TODO: Create relationship
                    // realRelation = newlyCXreated
                } else {
                    realRelation = realRelation[0];
                }
                newToAdd.push(realRelation.id)
            }
        }

        const nonDashboardRelationsips = matchRelationships.filter((x) => !(Object.keys(roles).includes(x.singular_name)))
        
        let response = await this.helpers.updateRecord('Matches', match, {
            'Player Relationships': [...newToAdd, ...nonDashboardRelationsips]
        })

        if (response?.error) {
            console.error("Airtable error", response.error);
            throw "Airtable error";
        }

    //     let broadcast = await this.helpers.get(client?.broadcast?.[0]);
    //     if (!broadcast) throw "No broadcast associated";

    //     let newObserverSettings = broadcast.observer_settings || [];

    //     if (observerSettingValue === "toggle") {
    //         observerSettingValue = !newObserverSettings.includes(observerSetting);
    //     }

    //     if (observerSettingValue) {
    //         // add to array
    //         if (!newObserverSettings.includes(observerSetting)) newObserverSettings.push(observerSetting);
    //     } else {
    //         // remove from array
    //         if (newObserverSettings.includes(observerSetting)) newObserverSettings.splice(newObserverSettings.indexOf(observerSetting), 1);
    //     }

    //     let response = await this.helpers.updateRecord("Broadcasts", broadcast, {
    //         "Observer settings": newObserverSettings
    //     });

    //     if (response?.error) {
    //         console.error("Airtable error", response.error);
    //         throw "Airtable error";
    //     }
    }
};

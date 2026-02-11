import { dirtyID } from "shared";

export default {
    key: "set-player-cams",
    auth: ["client"],
    requiredParams: ["cams"],
    /***
     * @param {AnyAirtableID[][]} cams
     * @param {ActionAuth["client"]} client
     * @returns {Promise<void>}
     */

    async handler({ cams }, { client }) {
        let broadcast = await this.helpers.get(client?.broadcast?.[0]);
        if (!broadcast?.id) throw ("No broadcast associated");

        const [team1Cams, team2Cams] = cams;
        console.log({ team1Cams, team2Cams });

        const validated = {
            "Team 1 Player Cams": [],
            "Team 2 Player Cams": [],
        };

        for (let teamIndex in cams) {
            const team = cams[teamIndex];
            for (let playerID of team) {
                const player = await this.helpers.get(playerID);
                if (!player?.id || player.__tableName !== "Players") throw "Invalid player";
                validated[`Team ${parseInt(teamIndex) + 1} Player Cams`].push(dirtyID(player.id));
            }
        }

        console.log(validated);

        let response = await this.helpers.updateRecord("Broadcasts", broadcast, validated);

        if (response?.error) {
            console.error("Airtable error", response.error);
            throw "Airtable error";
        }
    }
};

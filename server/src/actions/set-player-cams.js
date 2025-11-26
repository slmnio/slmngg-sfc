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
    // eslint-disable-next-line no-empty-pattern
    async handler({ cams }, { client }) {
        let broadcast = await this.helpers.get(client?.broadcast?.[0]);
        if (!broadcast?.id) throw ("No broadcast associated");

        const [team1Cams, team2Cams] = cams;
        console.log({ team1Cams, team2Cams });

        const validated = {
            "Team 1 Cams": [],
            "Team 2 Cams": [],
        };

        for (let teamIndex in cams) {
            const team = cams[teamIndex];
            for (let playerID of team) {
                const player = await this.helpers.get(playerID);
                if (!player?.id || player.__tableName !== "Players") throw "Invalid player";

                if (!player?.live_guests?.[0]) throw "Player has no live guest record";

                validated[`Team ${parseInt(teamIndex) + 1} Cams`].push(dirtyID(player.live_guests[0]));
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

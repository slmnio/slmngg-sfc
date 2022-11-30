const { getTwitchChannel,
    getTwitchAPIClient,
    getMatchData
} = require("../action-utils");

const automaticPredictionTitleStartCharacter = "⬥";

function generatePredictionTitle(map, predictionType) {
    let title;
    if (predictionType === "match") {
        title = "Who will win the match?";
    } else if (map.number) {
        if (map.name) {
            title = `Who will win map ${map.number} - ${map.name}?`;
        } else {
            title = `Who will win map ${map.number}?`;
        }

    } else if (map.name) {
        title = `Who will win ${map.name}?`;
    } else {
        title = "Who will win the map?";
    }
    return `${automaticPredictionTitleStartCharacter} ${title}`;
}

function getTargetPrediction(predictions, teams) {
    return predictions.find(p =>
        ["ACTIVE", "LOCKED"].includes(p.status) &&
        p.outcomes.every(outcome => [...teams.map(t => t.name), "Draw"].includes(outcome.title)) &&
        p.title.startsWith(automaticPredictionTitleStartCharacter)
    );
}


function getMatchWinner(match, team1, team2) {
    if (match.score1 >= match.first_to) return team1;
    if (match.score2 >= match.first_to) return team2;
    return null;
}


module.exports = {
    key: "manage-prediction",
    auth: ["client"],
    requiredParams: ["predictionAction"],
    optionalParams: ["autoLockAfter"],
    /***
     * @param {PredictionAction} predictionAction
     * @param {number?} autoLockAfter
     * @param {ClientData} client
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line no-empty-pattern
    async handler({ predictionAction, autoLockAfter = 120 }, { client }) {
        if (!(["create", "lock", "resolve", "cancel"].includes(predictionAction))) throw ("Invalid action");
        console.log(predictionAction);

        // TODO: move cancel action to here

        const { broadcast, channel } = getTwitchChannel(client, ["channel:manage:predictions", "channel:read:predictions"]);
        // console.log(channel);
        const api = await getTwitchAPIClient(channel);
        const predictionType = (broadcast.broadcast_settings || []).includes("Predict every map") ? "map" : "match";
        const { match, team1, team2 } = await getMatchData(broadcast, true);

        const maps = await Promise.all((match.maps || []).map(async m => {
            let map = await this.helpers.get(m);

            if (map?.map?.[0]) {
                map.map = await this.helpers.get(map?.map?.[0]);
            }

            if (map?.winner?.[0]) {
                map.winner = await this.helpers.get(map?.winner?.[0]);
            }

            return map;
        }));

        const matchWinner = getMatchWinner(match, team1, team2);

        if (predictionType === "map" && maps.length === 0) throw ("No maps associated with match");

        const { data: predictions } = await api.predictions.getPredictions(channel.channel_id);


        if (["create", "lock"].includes(predictionAction)) {
            const currentMap = maps.filter(m => !m.dummy && !m.winner && !m.draw && !m.banner)[0];
            if (predictionType === "map" && !currentMap) throw ("No valid map to start a prediction for");

            const targetPrediction = getTargetPrediction(predictions, [team1, team2]);
            console.log(targetPrediction);

            if (predictionAction === "create") {
                if (targetPrediction) throw ("Prediction already exists");
                const predictionTitle = generatePredictionTitle(currentMap, predictionType);

                let outcomes = [team1.name, team2.name];

                if (predictionType === "map" &&
                    !(currentMap && currentMap.map.type === "Control") &&
                    (broadcast.broadcast_settings || []).includes("Allow draw predictions")) {
                    outcomes.push("Draw");
                }

                const responsePrediction = await api.predictions.createPrediction(channel.channel_id, {
                    title: predictionTitle,
                    outcomes: outcomes,
                    autoLockAfter: autoLockAfter || 120
                });
                console.log(responsePrediction);
                // TODO: check responsePrediction for errors
                return;
            }

            if (!targetPrediction) throw ("Prediction does not exist");

            if (predictionAction === "lock") {
                const responsePrediction = await api.predictions.lockPrediction(channel.channel_id, targetPrediction.id);
                console.log(responsePrediction);
            }

        } else if (["resolve"].includes(predictionAction)) {
            const lastMap = maps.filter(m => !m.dummy && !m.banner && (m.winner || m.draw)).pop();
            const targetPrediction = getTargetPrediction(predictions, [team1, team2]);
            if (!targetPrediction) throw ("Prediction does not exist");
            console.log(targetPrediction);

            if (predictionType === "match") {
                if (!matchWinner) throw ("Match has not been won yet");
                const responsePrediction = await api.predictions.resolvePrediction(channel.channel_id, targetPrediction.id, targetPrediction.outcomes.find(o => o.title === matchWinner.name).id);
                console.log(responsePrediction);
            } else {
                if (lastMap.draw) {
                    const responsePrediction = await api.predictions.resolvePrediction(channel.channel_id, targetPrediction.id, targetPrediction.outcomes.find(o => o.title === "Draw").id);
                    console.log(responsePrediction);
                } else {
                    const responsePrediction = await api.predictions.resolvePrediction(channel.channel_id, targetPrediction.id, targetPrediction.outcomes.find(o => o.title === lastMap.winner.name).id);
                    console.log(responsePrediction);
                }
            }

        } else if (["cancel"].includes(predictionAction)) {
            const activePredictions = predictions.filter(p => ["ACTIVE", "LOCKED"].includes(p.status));
            for (const prediction of activePredictions) {
                const responsePrediction = await api.predictions.cancelPrediction(channel.channel_id, prediction.id);
                console.log(responsePrediction);
            }
        }
    }
};

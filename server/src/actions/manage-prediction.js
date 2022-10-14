const { ApiClient } = require("@twurple/api");
const { StaticAuthProvider, refreshUserToken } = require("@twurple/auth");

const automaticPredictionTitleStartCharacter = "⬥";

function generatePredictionTitle(map) {
    let title;
    if (map.number) {
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

module.exports = {
    key: "manage-prediction",
    auth: ["client"],
    requiredParams: ["predictionAction"],
    optionalParams: ["autoLockAfter"],
    /***
     * @param {ActionSuccessCallback} success
     * @param {ActionErrorCallback} error
     * @param {PredictionAction} predictionAction
     * @param {number?} autoLockAfter
     * @param {ClientData} client
     * @param {CacheGetFunction} get
     * @param {CacheAuthFunctions} auth
     * @param {SimpleUpdateRecord} updateRecord
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line no-empty-pattern
    async handler(success, error, { predictionAction, autoLockAfter = 120 }, { client }, { get, auth }) {
        if (!(["create", "lock", "resolve", "cancel"].includes(predictionAction))) return error("Invalid action");
        console.log(predictionAction);

        const broadcast = await get(client?.broadcast?.[0]);
        if (!broadcast) return error("No broadcast associated");
        if (!broadcast.channel) return error("No channel associated with broadcast");

        const channel = await auth.getChannel(broadcast?.channel?.[0]);
        if (!channel.twitch_refresh_token) return error("No twitch auth token associated with channel");
        if (!channel.channel_id || !channel.name || !channel.twitch_scopes) return error("Invalid channel data");
        let scopes = channel.twitch_scopes.split(" ");
        if (!["channel:manage:predictions", "channel:read:predictions"].every(scope => scopes.includes(scope))) return error("Token doesn't have the required scopes");

        console.log(channel);
        const accessToken = await auth.getTwitchAccessToken(channel);

        const authProvider = new StaticAuthProvider(process.env.TWITCH_CLIENT_ID, accessToken);
        const api = new ApiClient({authProvider});

        // TODO: move cancel action to here

        const match = await get(broadcast?.live_match?.[0]);
        if (!match) return error("No match associated");

        const team1 = await get(match?.teams?.[0]);
        const team2 = await get(match?.teams?.[1]);
        if (!team1 || !team2) return error("Did not find two teams!");

        const maps = await Promise.all((match.maps || []).map(async m => {
            let map = await get(m);

            if (map?.map?.[0]) {
                let mapData = await get(map?.map?.[0]);
                map.map = mapData;
            }

            if (map?.winner?.[0]) {
                let winner = await get(map?.winner?.[0]);
                map.winner = winner;
            }

            return map;
        }));
        if (maps.length === 0) return error("No maps associated with match");

        const { data: predictions } = await api.predictions.getPredictions(channel.channel_id);


        if (["create", "lock"].includes(predictionAction)) {
            const currentMap = maps.filter(m => !m.dummy && !m.winner && !m.draw && !m.banner)[0];
            if (!currentMap) return error("No valid map to start a prediction for");


            const targetPrediction = getTargetPrediction(predictions, [team1, team2]);
            console.log(targetPrediction);

            if (predictionAction === "create") {
                if (targetPrediction) return error("Prediction already exists");
                const predictionTitle = generatePredictionTitle(currentMap);

                let outcomes = [team1.name, team2.name];

                if (!(currentMap && currentMap.map.type === "Control")) {
                    outcomes.push("Draw");
                }

                const responsePrediction = await api.predictions.createPrediction(channel.channel_id, {
                    title: predictionTitle,
                    outcomes: outcomes,
                    autoLockAfter: autoLockAfter || 120
                });
                console.log(responsePrediction);
                return success(); // TODO: check responsePrediction for errors
            }

            if (!targetPrediction) return error("Prediction does not exist");

            if (predictionAction === "lock") {
                const responsePrediction = await api.predictions.lockPrediction(channel.channel_id, targetPrediction.id);
                console.log(responsePrediction);
            }

        } else if (["resolve"].includes(predictionAction)) {
            const lastMap = maps.filter(m => !m.dummy && !m.banner && (m.winner || m.draw)).pop();
            const targetPrediction = getTargetPrediction(predictions, [team1, team2]);
            console.log(targetPrediction);

            if (lastMap.draw) {
                const responsePrediction = await api.predictions.resolvePrediction(channel.channel_id, targetPrediction.id, targetPrediction.outcomes.find(o => o.title === "Draw").id);
                console.log(responsePrediction);
            } else {
                const responsePrediction = await api.predictions.resolvePrediction(channel.channel_id, targetPrediction.id, targetPrediction.outcomes.find(o => o.title === lastMap.winner.name).id);
                console.log(responsePrediction);
            }

        } else if (["cancel"].includes(predictionAction)) {
            const activePredictions = predictions.filter(p => ["ACTIVE", "LOCKED"].includes(p.status));
            for (const prediction of activePredictions) {
                const responsePrediction = await api.predictions.cancelPrediction(channel.channel_id, prediction.id);
                console.log(responsePrediction);
            }
        }

        return success();
    }
};

const { getAll, cleanID } = require("../action-utils/action-utils");
const { canEditMatch } = require("../action-utils/action-permissions");

module.exports = {
    key: "resolve-entire-bracket",
    auth: ["user"],
    requiredParams: ["bracketID"],
    async handler({ bracketID }, { user }) {

        let bracket = await this.helpers.get(bracketID);

        if (bracket.events) {
            // Bracket attached to event, use event permissions
            let event = await this.helpers.get(bracket.events?.[0]);
            if (!await canEditMatch(user, { event })) {
                throw {
                    errorMessage: "You don't have permission to resolve brackets",
                    errorCode: 403
                };
            }

        } else {
            // Bracket is not attached to an event, use global permissions
            if (!user.airtable?.website_settings?.includes("Can edit any match")) {
                throw {
                    errorMessage: "You don't have permission to resolve brackets",
                    errorCode: 403
                };
            }
        }

        if (!bracket?.bracket_layout) throw { errorMessage: "Unknown or unusable bracket" };

        let layout;
        try { layout = JSON.parse(bracket.bracket_layout); } catch (e) { throw "Bracket parse error"; }
        if (!layout.connections) throw "Bracket has no connections";
        let { connections } = layout;

        let matches = await getAll(bracket.ordered_matches);

        for (const i in matches) {
            const match = matches[i];
            if (match.teams?.[0]) match.teams[0] = await this.helpers.get(cleanID(match.teams[0]));
            if (match.teams?.[1]) match.teams[1] = await this.helpers.get(cleanID(match.teams[1]));
            matches[i] = match;
        }

        function splitDot(dot) {
            if (!dot.includes(".")) return { special: dot };
            return {
                matchNum: dot.split(".")[0],
                position: dot.split(".")[1]
            };
        }

        function getFeederMatchConnections(targetMatchNum) {
            let matchConnections = [];
            Object.entries(connections).forEach(([matchNum, connects]) => {
                if (splitDot(connects.win)?.matchNum === targetMatchNum) {
                    matchConnections.push({ winner: true, matchNum, position: splitDot(connects.win)?.position });
                }
                if (splitDot(connects.lose)?.matchNum === targetMatchNum) {
                    matchConnections.push({ loser: true, matchNum, position: splitDot(connects.lose)?.position });
                }
            });
            return matchConnections;
        }

        let responses = [];

        for (const [matchNum, connects] of Object.entries(connections)) {
            let match = matches[parseInt(matchNum) - 1];

            if (match?.teams?.length === 2) continue; // ignore if it's already got 2 teams

            let correctTeams = [null, null];

            if (match?.teams?.length === 1) {
                correctTeams[match.placeholder_right ? 0 : 1] = match.teams[0];
            }

            // see what connects to this match

            let feeders = getFeederMatchConnections(matchNum);
            console.log(`Feeders for match ${matchNum} are`, feeders);

            feeders.forEach(connection => {
                let connectionMatch = matches[parseInt(connection.matchNum) - 1];

                if (!(connectionMatch?.first_to && [connectionMatch.score_1, connectionMatch.score_2].some(s => s === connectionMatch.first_to))) {
                    return; // match is not yet complete, cannot fill from it
                }
                let teamIndex = connectionMatch.first_to === connectionMatch.score_1 ? 0 : 1;
                if (connection.loser) teamIndex = +!teamIndex;
                let team = connectionMatch.teams[teamIndex];
                team._position = connection.position;
                if (team) {
                    correctTeams[parseInt(connection.position) - 1] = team;
                } else {
                    console.warn("No team available", connection, team);
                }
            });
            console.log("correct teams", correctTeams.map(t => t?.code || t));

            correctTeams = correctTeams.filter(c => c);

            if (correctTeams.length === 0) {
                // no updates
            } else if (correctTeams.length === 1) {
                let placeholderRight = parseInt(correctTeams[0]._position) === 1; // (not 2)
                // console.log(matchNum, correctTeams[0]._position, placeholderRight, feeders.length);

                if (!correctTeams[0]?._position && feeders.length === 1) {
                    // team here doesn't know where it should be, and there's one feeder
                    // therefore put the only team in the opposite to the feeder
                    let feeder = feeders[0];
                    placeholderRight = feeder.position === "2";
                    // feeder position 2 = right/bottom, so placeholder there
                }

                let response = await this.helpers.updateRecord("Matches", match, {
                    "Teams": [correctTeams[0].id],
                    "Placeholder Right": placeholderRight
                });
                responses.push(response);
            } else if (correctTeams.length === 2) {
                let response = await this.helpers.updateRecord("Matches", match, {
                    "Teams": correctTeams.map(team => team.id),
                    "Placeholder Right": false
                });
                responses.push(response);
            }

            matches[parseInt(matchNum) - 1].teams = correctTeams;
        }

        // console.log("responses", responses);
        let success = responses.filter(response => !response.error).length;
        let error = responses.filter(response => response.error).length;
        let output = [];
        if (success) output.push(`${success} match${success === 1 ? "" : "es"} updated`);
        if (error) output.push(`${error} match${error === 1 ? "" : "es"} errored`);
        if (!output.length) output.push("No matches updated");

        return {
            hasError: !!error,
            message: output.join(", ")
        };
    }
};

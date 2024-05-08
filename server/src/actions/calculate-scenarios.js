const { getAll } = require("../action-utils/action-utils");
const { sortTeamsIntoStandings,
    getEventSortingMethods
} = require("../action-utils/server-scenarios");

class BitCounter {
    constructor (props) {
        if (!props.bits.length) throw new Error("no valid array length for bit counter");
        this.bitMask = props.bits;
        this.bits = props.bits.map(() => 0);
    }

    add(number = 1) {
        // console.log("bit counter", "currently", this.bits);
        this.addAtPosition(0, number);
        // console.log("bit counter", "now", this.bits);
    }

    addAtPosition(position, amount) {
        if (position >= this.bits.length + 1) throw new Error("Index error - tried to add over the maximum bit length");
        const change = this.bits[position] + amount;

        if (change >= this.bitMask[position]) {
            // recursively go up
            const carry = Math.floor(change / this.bitMask[position]);
            const remainder = change - (carry * this.bitMask[position]);

            this.addAtPosition(position + 1, carry);
            this.bits[position] = remainder;
        } else {
            this.bits[position] = change;
        }
    }

    at(index) {
        return this.bits[index];
    }
}

const DefaultStandings = {
    wins: 0,
    losses: 0,
    played: 0,

    map_wins: 0,
    map_losses: 0,
    maps_played: 0,
    rank: null,
    h2h: {},
    h2h_maps: {}
};


module.exports = {
    key: "calculate-scenarios",
    requiredParams: ["eventID", "group"],
    async handler({ eventID, group }) {
        let event = await this.helpers.get(eventID);
        if (!event) throw "Unknown event";

        const sortingMethods = getEventSortingMethods(event, group);

        const _teams = await getAll(event.teams);
        console.log(_teams.length, "total teams");
        const teams = new Map();
        _teams.forEach(t => teams.set(t.id, t));

        const allMatches = await getAll(event.matches);
        console.log(allMatches.length, "total matches");

        const groupMatches = allMatches.filter(match => match.match_group === group);
        console.log(groupMatches.length, "group matches");

        const historicalTeams = new Map();
        groupMatches.forEach(match => {
            match.teams.forEach(tID => {
                const team = teams.get(tID);
                if (!historicalTeams.has(team.id) && team.id && team.code) {
                    historicalTeams.set(team.id, {
                        id: team.id,
                        code: team.code,
                        extra_points: team.extra_points,
                        standings: ({...DefaultStandings})
                    });
                }
            });
        });
        console.log(historicalTeams);

        const matchesWithOutcomes = groupMatches.map(m => {
            const outcomes = [];

            for (let i = 0; i < m.first_to * 2; i++) {
                const score = [m.first_to, (i % m.first_to)];
                let winner = m.teams[0];
                if (i >= m.first_to) {
                    score.reverse();
                    winner = m.teams[1];
                }
                const outcome = { scores: score, winner, scoreFirstWinner: [m.first_to, (i % m.first_to)] };

                outcomes.push(outcome);

                if (score[0] === m.score_1 && score[1] === m.score_2) {
                    m.completed = true;
                    m.completedOutcome = outcome;
                }
            }
            return { ...m, outcomes };
        });

        const unfinishedMatches = [];
        const finishedMatches = [];

        matchesWithOutcomes.forEach(m => {
            if (m.completed) {
                finishedMatches.push(m);
            } else {
                unfinishedMatches.push(m);
            }
        });
        console.log(unfinishedMatches.length, "unfinished matches");
        console.log(finishedMatches.length, "finished matches");


        const maxBits = unfinishedMatches.map(m => m.first_to * 2);
        const scenarioCount = maxBits.reduce((last, curr) => last * curr, 1);
        console.log("Scenario count", scenarioCount);

        const bitCounter = new BitCounter({ bits: maxBits });
        const scenarios = [];

        for (let i = 0; i < scenarioCount; i++) {
            const scenario = {
                i,
                outcomes: [],
                standings: [],
                teams: structuredClone(historicalTeams) // deep copy
            };

            console.log(scenario);

            // loop through all matches to add them
            // if they're complete then find the outcome that works (see below ↓)
            // if they're not complete then pop one off the bit counter (might need to copy it) and use that outcome instead
            const bits = [...bitCounter.bits];

            unfinishedMatches.forEach(match => {
                scenario.outcomes.push({
                    ...match.outcomes[bits.shift()],
                    completed: false,
                    id: match.id
                });
            });

            if (i % 100 === 0) console.log("scenario creation", bitCounter.bits, i, scenario.outcomes?.length);

            scenario.outcomes.forEach((outcome, i) => {
                const match = unfinishedMatches[i];

                match.teams.forEach((_teamID, ti) => {
                    const team = scenario.teams.get(_teamID);
                    const otherTeam = scenario.teams.get(match.teams[+!ti]);

                    // update standings
                    const teamWonThisMatch = match.first_to === outcome.scores[ti];
                    if (teamWonThisMatch) {
                        team.standings.wins++;

                        if (!team.standings.h2h[otherTeam.id]) team.standings.h2h[otherTeam.id] = 0;
                        team.standings.h2h[otherTeam.id]++;
                    } else {
                        team.standings.losses++;
                        if (!team.standings.h2h[otherTeam.id]) team.standings.h2h[otherTeam.id] = 0;
                        team.standings.h2h[otherTeam.id]--;
                    }
                    team.standings.map_wins += outcome.scores[ti];
                    team.standings.map_losses += outcome.scores[+!ti];

                    if (!team.standings.h2h_maps[otherTeam.id]) team.standings.h2h_maps[otherTeam.id] = 0;
                    team.standings.h2h_maps[otherTeam.id] += outcome.scores[ti] - outcome.scores[+!ti];
                });
            });

            // console.log("scenario set up", scenario);

            scenario.standings = sortTeamsIntoStandings(teams, sortingMethods);

            bitCounter.add();
        }
        console.log("scenarios done", scenarioCount);
    }
};

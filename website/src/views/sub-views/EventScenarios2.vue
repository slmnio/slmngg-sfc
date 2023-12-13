<template>
    <div class="event-scenarios container">
        <h1>Scenarios 2.0</h1>


        <div class="form-inline mb-2">
<!--            <select name="" id="" v-model="activeScenarioView" class="mr-2 form-control">-->
<!--                <option value="all" selected>All</option>-->
<!--                <option value="possible">Possible</option>-->
<!--                <option value="incomplete">Incomplete</option>-->
<!--            </select>-->

<!--            <BFormCheckbox class="mr-3" v-model="showOnlyPossible">Show only possible</BFormCheckbox>-->
            <BFormCheckbox class="mr-3" v-model="showOnlyIncomplete">Show only incomplete</BFormCheckbox>
            <BFormCheckbox class="mr-3" v-model="showCountsAsPercentages">Show counts as percentages</BFormCheckbox>

<!--            <div class="btn btn-secondary" v-if="showCountsAsPercentages" @click="showCountsAsPercentages = false">View as numbers</div>-->
<!--            <div class="btn btn-secondary" v-if="!showCountsAsPercentages" @click="showCountsAsPercentages = true">View as percentages</div>-->
        </div>
<!--        <div>-->
<!--            matches: {{ matches?.length }} / scenario matches: {{ scenarioMatches?.length }} / for scenarios: {{ matchesForScenarios?.length }} / with outcomes: {{ scenarioMatchesWithOutcomes?.length }} <br>-->
<!--        </div>-->
<!--        <div v-if="scenarios" class="mb-2">-->
<!--            {{ currentScenarioView && currentScenarioView.length }} in view ~ {{ scenarios.scenarios && scenarios.scenarios.length }} / {{ scenarios.scenarioCount }}-->
<!--&lt;!&ndash;            {{ scenarios.maxBits }}&ndash;&gt;-->
<!--&lt;!&ndash;            {{ scenarios.bitCounter }}&ndash;&gt;-->
<!--&lt;!&ndash;            {{ scenarios.bits }}&ndash;&gt;-->
<!--             -&#45;&#45; {{ matchesForHistorical.length }} historical matches added-->
<!--        </div>-->
        <div class="mb-2" v-if="sortingMethods">
            Sorting methods: {{ sortingMethods.join(' / ') }}
        </div>


        <div class="n-nav mb-3 d-flex" v-if="matchGroups">
            <select name="match-group-selector" id="match-group-selector" v-model="activeMatchGroup">
                <option selected disabled value="null">Select a group</option>
                <option v-for="group in matchGroups" :value="group" :key="group">{{ group }}</option>
            </select>
            <div class="ml-2" v-if="activeMatchGroup">{{ matches?.length }} {{ matches?.length === 1 ? "match" : "matches"}}, {{ incompleteMatches?.length }} to play</div>
        </div>


        <table class="table-bordered text-light mb-3" v-if="counts && counts[0] && counts[0].positions">
            <tr v-if="counts" class="font-weight-bold">
                <th class="p-2 border-dark text-right" style="min-width: 8.5em">{{ showCountsAsPercentages ? `% of ${currentScenarioView.length} scenarios` : `/${currentScenarioView.length} scenarios`}}</th>
                <th class="p-2 border-dark" v-for="(x, i) in (counts[0].positions).slice(0, -1)" :key="i">
                    #{{ i + 1 }}
                </th>
                <th class="p-2 border-dark" v-b-tooltip:top="'Standings haven\'t converged into separate groups'">Incomplete</th>
            </tr>
            <tr v-for="team in counts" :key="team.code">
                <td class="p-2 border-dark text-right font-weight-bold">{{ team.code }}</td>
                <td class="p-2 border-dark cell-num" v-for="(pos, posi) in team.positions" :key="posi"
                    @click="() => showWhen(team.code, posi)"
                    :class="{ 'bg-info selected': manualScenarioFilters.find((f) => f.team === team.code && f.position === posi ), 'bg-warning text-dark': pos !== 0 && pos === currentScenarioView.length, 'text-muted': pos === 0 }"
                >
                    <span v-if="showCountsAsPercentages">{{ (pos / currentScenarioView.length) | perc }}</span>
                    <span v-else>{{ pos }}</span>
                </td>
            </tr>
        </table>

        <table class="table-bordered text-light mb-3 border-dark" v-if="scenarios">
            <tr>
                <th class="p-2 border-dark"></th>
                <th class="p-2 border-dark text-center" :key="scoreline" v-for="([scoreline]) in Object.entries(matchCounts?.[0]?.scorelines)">{{ scoreline }}</th>
                <th class="p-2 border-dark"></th>
                <th class="p-2 border-dark">Analysis</th>
            </tr>
            <tr v-for="match in matchCounts" :key="match.id">
                <td class="p-2 border-dark font-weight-bold text-right">{{ match.teams?.[0]?.code }}</td>
                <td class="p-2 border-dark text-center cell-num" @click="showMatchScoreline(match.id, scoreline)" :class="{'bg-info selected': scorelineFilterHas(match.id, scoreline), 'text-muted': count === 0}"
                    v-for="([scoreline, count]) in Object.entries(match.scorelines)" :key="scoreline">{{ count }}</td>
                <td class="p-2 border-dark font-weight-bold text-left">{{ match.teams?.[1]?.code }}</td>
                <td class="p-2 border-dark text-center" :class="{'text-muted': matchAnalysis(match) === 'No effect'}">{{ matchAnalysis(match) }} </td>
            </tr>
        </table>

        <table class="table text-white" v-if="scenarios">
            <tr class="sticky-top bg-dark">
                <td>#</td>
                <td class="text-center" v-for="match in incompleteMatches" :key="match.id">
                    {{ match.teams.map(t => t.code).join(' vs ') }}
                </td>
                <td class="text-center">Standings</td>
            </tr>
            <tr v-for="(scenario, i) in currentScenarioView" :key="i">
                <td>{{ scenario.i + 1 }}</td>
                <td v-for="(match, mi) in (scenario.outcomes?.filter(m => !m.completed))" :key="mi">
                    {{ match.scoreFirstWinner && match.scoreFirstWinner.join('-') }} {{ match.winner && match.winner.code }}
                </td>
<!--                <td>-->
<!--                    not sorted-->
<!--                    <ul>-->
<!--                        <li class="text-nowrap" v-for="team in scenario.teams" :key="team.id">-->
<!--                            {{ team.code }} ({{ team.wins }}-{{ team.losses }}) m({{ team.map_wins }}-{{ team.map_losses }})-->
<!--                        </li>-->
<!--                    </ul>-->
<!--                </td>-->
                <td class="text-nowrap">
<!--                    first round of sorting (match wins)-->
                    <ol class="mb-0 small">
                        <li v-for="(g, gi) in scenario.standings?.standings" :key="gi">
                            <div class="standings-entry" v-for="(team,ei) in g" :key="ei">{{ team.code?.padEnd(5, " ") }} {{ team.standings?.wins }}-{{ team.standings?.losses }} (m {{ team.standings?.map_wins.toString().padEnd(2, " ") }}-{{ team.standings?.map_losses.toString().padStart(2, " ") }}) ({{ sign(team.standings?.map_wins - team.standings?.map_losses)}})</div>
                        </li>
                    </ol>
                </td>
            </tr>
        </table>
    </div>
</template>

<script>
import { ReactiveArray } from "@/utils/reactive";
import { BitCounter, sortTeamsIntoStandings } from "@/utils/scenarios";
import { BFormCheckbox } from "bootstrap-vue";


function generateScoreline(firstTo) {
    const scorelines = [];
    for (let i = 0; i < firstTo; i++) {
        scorelines.splice(i, 0, `${firstTo}-${i}`);
        scorelines.splice(i + 1, 0, `${i}-${firstTo}`);
    }
    return scorelines;
}


export default {
    name: "EventScenarios2",
    props: ["event"],
    components: { BFormCheckbox },
    data: () => ({
        activeMatchGroup: "null", // this works for now
        activeScenarioView: "all",
        showCountsAsPercentages: false,
        showOnlyPossible: true,
        showOnlyIncomplete: false,
        manualScenarioFilters: [],
        manualScorelineFilters: []
    }),
    computed: {
        blocks() {
            if (!this.event?.blocks) return null;
            try {
                return JSON.parse(this.event.blocks);
                // if (!settings?.foldy?.use) return null;
            } catch (e) {
                return null;
            }
        },
        settings() {
            if (!this.blocks?.foldy) return null;
            return this.blocks.foldy;
        },
        currentScenarioView() {
            if (!this.scenarios) return [];
            let scenarios = this.scenarios.scenarios;
            if (!scenarios) return [];
            if (this.showOnlyIncomplete) scenarios = scenarios.filter(s => s.standings?.standings.length !== s.teams.length);
            if (this.showOnlyPossible) scenarios = scenarios.filter(s => !s.impossible);

            if (this.manualScenarioFilters?.length || this.manualScorelineFilters?.length) {
                scenarios = scenarios.filter(s => {
                    const scenarioFilter = this.manualScenarioFilters.some(({ team, position }) => {
                        return s.standings?.standings[position]?.some(t => t.code === team);
                    });
                    const scorelineFilter = this.manualScorelineFilters.some(({ matchID, scoreline }) => {
                        console.log("scoreline filter", s, matchID, scoreline);
                        return s.outcomes.find(outcome => outcome.id === matchID && outcome.scores.join("-") === scoreline);
                    });

                    if (this.manualScenarioFilters.length && this.manualScorelineFilters.length) {
                        return scenarioFilter && scorelineFilter;
                    }
                    return scenarioFilter || scorelineFilter;
                });
            }
            return scenarios;
        },
        matchGroups() {
            if (!this.settings) return null;
            if (this.settings.group) return null;
            return this.settings.groups || null;
        },
        settingMatchGroup() {
            if (!this.settings) return null;
            return this.settings.group || null;
        },
        matches() {
            if (!this.event?.matches) return [];
            return ReactiveArray("matches", {
                teams: ReactiveArray("teams")
            })(this.event).filter(match => {
                // if (!this._matchGroup || !this.activeMatchGroup) return true; - default to any
                if (this.activeMatchGroup) return match.match_group === this.activeMatchGroup;
                if (this._matchGroup) return match.match_group === this.settingMatchGroup;
                return !this._matchGroups;
            });
        },
        scenarioMatches() {
            if (!this.matches) return [];
            const matches = this.matches.filter(m => !!m.teams && m.teams.length === 2).map(m => {
                m.teams = m.teams.map(t => ({
                    code: t.code || t.name,
                    id: t.id
                }));


                return {
                    teams: m.teams,
                    first_to: m.first_to,
                    completed: [m.score_1, m.score_2].some(s => s === m.first_to),
                    liveWinner: (m.score_1 === m.first_to ? m.teams[0] : m.teams[1])?.code,
                    scores: [m.score_1, m.score_2],
                    week: m.week
                };
            });
            return matches;
        },
        matchesForScenarios() {
            if (this.settings?.week) return this.matches.filter(m => m.week && m.week >= this.settings.week);
            return this.matches;
            // .filter(m => {
            //     console.log("matches for scenarios", m.first_to, m.score_1, m.score_2, ([m.score_1, m.score_2]).includes(m.first_to));
            //     return !([m.score_1, m.score_2]).includes(m.first_to);
            // });
        },
        incompleteMatches() {
            return this.matches.filter(m => {
                console.log("matches for scenarios", m.first_to, m.score_1, m.score_2, ([m.score_1, m.score_2]).includes(m.first_to));
                return !([m.score_1, m.score_2]).includes(m.first_to);
            });
        },
        matchesForHistorical() {
            if (this.settings?.week) return this.matches.filter(m => !(m.week && m.week >= this.settings.week));
            return [];
        },
        historicalTeams() {
            const teams = this.scenarioTeams;

            this.matchesForHistorical.forEach(match => {
                const scores = [match.score_1, match.score_2];
                match.teams.forEach((_team, ti) => {
                    const team = teams.find(t => t.id === _team.id);
                    const otherTeam = teams.find(t => t.id === match.teams[+!ti].id);

                    const teamWonThisMatch = match.first_to === scores[ti];
                    if (teamWonThisMatch) {
                        team.standings.wins++;

                        if (!team.standings.h2h[otherTeam.id]) team.standings.h2h[otherTeam.id] = 0;
                        team.standings.h2h[otherTeam.id]++;
                    } else {
                        team.standings.losses++;
                        if (!team.standings.h2h[otherTeam.id]) team.standings.h2h[otherTeam.id] = 0;
                        team.standings.h2h[otherTeam.id]--;
                    }
                    team.standings.map_wins += scores[ti];
                    team.standings.map_losses += scores[+!ti];

                    if (!team.standings.h2h_maps[otherTeam.id]) team.standings.h2h_maps[otherTeam.id] = 0;
                    team.standings.h2h_maps[otherTeam.id] += scores[ti] - scores[+!ti];
                });
            });

            return teams;
        },
        scenarioMatchesWithOutcomes() {
            if (!this.matchesForScenarios) return [];
            return this.matchesForScenarios.map(m => {
                const outcomes = [];

                for (let i = 0; i < m.first_to * 2; i++) {
                    const score = [m.first_to, (i % m.first_to)];
                    let winner = m.teams[0];
                    if (i >= m.first_to) {
                        score.reverse();
                        winner = m.teams[1];
                    }
                    outcomes.push({ scores: score, winner, scoreFirstWinner: [m.first_to, (i % m.first_to)] });
                }
                return { ...m, outcomes };
            });
        },
        scenarioTeams() {
            const teams = [];
            this.matchesForScenarios.forEach(match => {
                match.teams.forEach(team => {
                    if (!teams.find(t => t.code === team.code)) {
                        const standings = {
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
                        teams.push({
                            id: team.id,
                            code: team.code,
                            extra_points: team.extra_points,
                            standings
                        });
                    }
                });
            });
            if (teams.some(t => !t.id || !t.code)) return [];
            return teams;
        },
        counts() {
            let teams = JSON.parse(JSON.stringify(this.scenarioTeams));
            const teamMap = {};
            teams.forEach((team, i) => {
                teamMap[team.code] = i;
            });
            const positions = [];
            teams.forEach(t => positions.push(0));
            positions.push(0);
            // positions.push(this.scenarios.incompleteScenarios.length); // last column is incompletes

            teams = teams.map(t => ({
                ...t,
                positions: [...positions]
            }));

            this.currentScenarioView.forEach(scenario => {
                // console.log("scenario", scenario);
                if (scenario.standings?.standings.length !== scenario.teams.length) {
                    // add to end
                    teams.forEach(t => t.positions[teams.length]++);
                } else {
                    scenario.standings?.standings.forEach((standing, i) => {
                        // console.log(standing, i, standing[0], teamMap[standing[0].code], teams[teamMap[standing[0].code]].positions[i]);
                        teams[teamMap[standing[0].code]].positions[i]++;
                    });
                }
            });


            return teams;
        },
        matchCounts() {
            const matchMap = {};
            this.incompleteMatches.forEach(match => {
                const scorelines = {};

                generateScoreline(match.first_to).forEach(line => {
                    scorelines[line] = 0;
                });

                matchMap[match.id] = {
                    id: match.id,
                    scorelines
                };
            });
            console.log(matchMap);
            this.currentScenarioView.forEach(scenario => {
                scenario.outcomes.forEach(match => {
                    if (!matchMap[match.id]) return;
                    matchMap[match.id].scorelines[match.scores.join("-")]++;
                    matchMap[match.id].teams = scenario.matches.find(m => m.id === match.id)?.teams;
                });
            });
            return Object.values(matchMap);
        },
        matchGroupData() {
            return (this.blocks?.standings || [])?.find(s => [s.group, s.key, s.title].map(e => e.toLowerCase()).includes(this.activeMatchGroup.toLowerCase()));
        },
        sortingMethods() {
            try {
                if (this.matchGroupData?.sort) return this.matchGroupData.sort;
                const sorters = this.blocks.standingsSort;
                if (sorters && sorters.length) {
                    const sorter = sorters.find(s => s.group === this.activeMatchGroup);
                    return sorter?.sort;
                }
            } catch (e) {
                return null;
            }
            return null;
        },
        scenarios() {
            if (!this.matchesForScenarios?.length) return null;
            if (!this.scenarioTeams?.length) return null;
            console.log("teams", this.scenarioTeams);
            const allMatches = this.scenarioMatchesWithOutcomes;
            const matches = allMatches.filter(m => ![m.score_1, m.score_2].includes(m.first_to));
            // const remainingMatches = JSON.stringify(allMatches.filter(m => [m.score_1, m.score_2].includes(m.first_to)));
            const maxBits = matches.map(m => m.first_to * 2);
            const scenarioCount = maxBits.reduce((last, curr) => last * curr, 1);
            // const scenarioCount = 1;
            const _json = { teams: JSON.stringify(this.historicalTeams), matches: JSON.stringify(this.matchesForScenarios) };
            const scenarios = [];


            if (scenarioCount > 2 ** 12) {
                console.warn({ error: "too many computations required", scenarioCount });
                return [];
            }

            // const bitCounter = maxBits.map(() => 0);
            const bitCounter = new BitCounter({ bits: maxBits });

            for (let i = 0; i < scenarioCount; i++) {
                const scenario = {
                    teams: JSON.parse(_json.teams),
                    matches: JSON.parse(_json.matches),
                    i,
                    impossible: false,
                    outcomes: []
                };

                // let outcomes = allMatches.forEach()

                // loop through all matches to add them
                // if they're complete then find the outcome that works (see below ↓)
                // if they're not complete then pop one off the bit counter (might need to copy it) and use that outcome instead
                const bits = [...bitCounter.bits];

                allMatches.forEach(match => {
                    if ([match.score_1, match.score_2].includes(match.first_to)) {
                        // if they're complete then find the outcome that works (see below ↓)
                        scenario.outcomes.push({
                            ...match.outcomes.find(outcome => JSON.stringify(outcome.scores) === JSON.stringify([match.score_1, match.score_2])),
                            completed: true,
                            id: match.id
                        });
                    } else {
                        // if they're not complete then pop one off the bit counter (might need to copy it) and use that outcome instead
                        scenario.outcomes.push({
                            ...match.outcomes[bits.shift()],
                            completed: false,
                            id: match.id
                        });
                    }
                });

                // scenario.outcomes = bitCounter.bits.map((bit, i) => {
                //     return matches[i].outcomes[bit];
                //     /*
                //     const match = scenario.matches[i];
                //     match.outcome = matches[i].outcomes[bit];
                //     delete match.outcomes;
                //     return match;
                //      */
                // });
                //
                // console.log("scenario creation", bitCounter.bits, i, scenario.outcomes, matches);
                // scenario.outcomes = [
                //     ...scenario.outcomes,
                //     // here ↓
                //     ...JSON.parse(remainingMatches)?.map(m => m.outcomes.find(outcome => JSON.stringify(outcome.scores) === JSON.stringify([m.score_1, m.score_2])))
                // ];

                console.log("scenario creation", bitCounter.bits, i, scenario.outcomes, matches);
                scenario.outcomes.forEach((outcome, i) => {
                    const match = scenario.matches[i];
                    // console.log("match", match, match.completed, match.scores, outcome.scores);
                    if (match.completed && (match.scores[0] !== outcome.scores[0] || match.scores[1] !== outcome.scores[1])) {
                        // if anything is incorrect
                        console.log("impossible match", match, match.completed, match.scores, outcome.scores);
                        scenario.impossible = true;
                    }


                    match.teams.forEach((_team, ti) => {
                        const team = scenario.teams.find(t => t.id === _team.id);
                        const otherTeam = scenario.teams.find(t => t.id === match.teams[+!ti].id);

                        // console.log(team, otherTeam);
                        // todo: error here when not all data is loaded properly

                        // const teamWonThisMatch = match.first_to === outcome.scores[ti];
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

                scenario.standings = [];

                /*
                scenario.teams.forEach(team => {
                    if (!scenario.standings.length) return scenario.standings.push([team]);

                    // first check match score

                    let isIn = false;
                    for (const [groupIndex, standingGroup] of scenario.standings.entries()) {
                        const groupTeam = standingGroup[0];

                        const sortResult = sortByMatch(team, groupTeam);

                        if (sortResult === 1) {
                            scenario.standings.splice(groupIndex, 0, [team]);
                            isIn = true;
                            break;
                        } else if (sortResult === 0) {
                            standingGroup.push(team);
                            isIn = true;
                            break;
                        }
                    }
                    if (!isIn) {
                        // console.log("last place so far", team.code, team.standings.wins);
                        scenario.standings.push([team]);
                    }
                });
                */

                scenario.sorts = 1;

                // sortMatches(scenario.i, sortByMatchWins, scenario.teams, scenario.standings);
                // console.log(scenario);

                // const sortFunction = (a, b) => {
                //     if (a.standings.points > b.standings.points) return -1;
                //     if (a.standings.points < b.standings.points) return 1;
                //
                //     if (a.standings.wins > b.standings.wins) return -1;
                //     if (a.standings.wins < b.standings.wins) return 1;
                //
                //     if (a.standings.losses > b.standings.losses) return 1;
                //     if (a.standings.losses < b.standings.losses) return -1;
                //
                //     if (a.standings.map_diff > b.standings.map_diff) return -1;
                //     if (a.standings.map_diff < b.standings.map_diff) return 1;
                //
                //
                //     if (a.standings.map_wins > b.standings.map_wins) return -1;
                //     if (a.standings.map_wins < b.standings.map_wins) return 1;
                //
                //     if (a.standings.map_losses > b.standings.map_losses) return 1;
                //     if (a.standings.map_losses < b.standings.map_losses) return -1;
                // };
                //
                // // quick default sort
                // scenario.teams.sort(sortFunction);

                // console.log("sort", i + 1, this.blocks.standingsSort);
                if (this.sortingMethods) {
                    scenario.standings = sortTeamsIntoStandings(scenario.teams, {
                        sort: this.sortingMethods
                    });
                } else {
                    scenario.standings = sortTeamsIntoStandings(scenario.teams);
                }
                // console.log(scenario.standings);
                //
                // scenario.standings = sortIntoGroups2(sortByMapWins, [scenario.teams]);
                // if (i === 4050) console.log(i, scenario.standings);
                // // sortMatches(sortByMatchWins, scenario.teams, scenario.standings);
                //
                //
                // if (!scenario.standings.every(s => s.length === 1)) {
                //     scenario.sorts++;
                //     // console.log(scenario.i + 1);
                //     scenario.standings = sortIntoGroups2(sortByMapWins, scenario.standings);
                //
                //     // console.log("sorting");
                //     // scenario.standings = scenario.standings.map(group => {
                //     //     group.sort((...a) => -sortByMapWins(...a));
                //     //     console.log("group", group);
                //     //     return group;
                //     // });
                // }
                //
                // if (!scenario.standings.every(s => s.length === 1)) {
                //     scenario.sorts++;
                //     scenario.standings = sortIntoGroups2(sortByHeadToHead, scenario.standings, 2);
                //     // sortIntoGroups2(scenario.i, sortByHeadToHead, scenario.standings, 2);
                // }
                //
                // if (!scenario.standings.every(s => s.length === 1)) {
                //     scenario.sorts++;
                // }
                scenarios.push(scenario);
                bitCounter.add();
            }

            console.log({
                scenarios: scenarios, // .filter(s => s.sorts >= 4),
                possibleScenarios: scenarios.filter(s => !s.impossible),
                incompleteScenarios: scenarios.filter(s => !s.impossible && s.standings.length !== s.teams.length)
            });

            return {
                maxBits,
                scenarioCount,
                bitCounter,
                scenarios: scenarios // .filter(s => s.sorts >= 4),
                // possibleScenarios: scenarios.filter(s => !s.impossible),
                // incompleteScenarios: scenarios.filter(s => s.standings.length !== s.teams.length),
                // possiblencompleteScenarios: scenarios.filter(s => s.standings.length !== s.teams.length)
            };
        }
    },
    filters: {
        perc(x) {
            // console.log(this);
            if (isNaN(x)) return "-";
            return (x * 100).toFixed(1) + "%";
            // console.log(x, this.currentScenarioView.length);
        }
    },
    methods: {
        sign(num) {
            if (num > 0) return "+" + num;
            return num;
        },
        showWhen(team, position) {
            if (this.filterHas(team, position)) return this.manualScenarioFilters.splice(this.filterIndex(team, position), 1);
            this.manualScenarioFilters.push({ team, position });
        },
        showMatchScoreline(matchID, scoreline) {
            const existingIndex = this.manualScorelineFilters.findIndex(filter => filter.matchID === matchID && filter.scoreline === scoreline);
            if (existingIndex !== -1) {
                return this.manualScorelineFilters.splice(existingIndex, 1);
            }
            this.manualScorelineFilters.push({ matchID, scoreline });
        },
        filterIndex(team, position) {
            return this.manualScenarioFilters.findIndex((f) => f.team === team && f.position === position);
        },
        filterHas(team, position) {
            return this.filterIndex(team, position) !== -1;
        },
        scorelineFilterHas(matchID, scoreline) {
            return this.manualScorelineFilters.find(filter => filter.matchID === matchID && filter.scoreline === scoreline);
        },
        matchAnalysis(match) {
            // TODO: Split this into must/better; must = non-0, better = higher probability
            const scorelines = Object.entries(match.scorelines);
            const nonZeroScorelines = scorelines.filter(([s, c]) => c !== 0);

            const nonZeroScorelineDirection = { direction: null, incorrect: false };

            let lastCount = null;
            nonZeroScorelines.forEach(([scoreline, count]) => {
                if (!lastCount) {
                    lastCount = count;
                    return;
                }
                if (nonZeroScorelineDirection?.direction) {
                    // check it's all good
                    if (nonZeroScorelineDirection.direction === "up" && count < lastCount) {
                        nonZeroScorelineDirection.incorrect = true;
                    } else if (nonZeroScorelineDirection.direction === "down" && count > lastCount) {
                        nonZeroScorelineDirection.incorrect = true;
                    }
                } else {
                    if (count > lastCount) {
                        nonZeroScorelineDirection.direction = "up";
                    } else if (count < lastCount) {
                        nonZeroScorelineDirection.direction = "down";
                    }
                }
                lastCount = count;
            });

            const teamCodes = (match.teams || []).map(t => t.code || t.name);

            const leftScores = scorelines.slice(0, (scorelines.length / 2));
            const rightScores = scorelines.slice((scorelines.length / 2), scorelines.length);

            console.log("analysis", { scorelines, leftScores, rightScores });
            if (scorelines.every(([scoreline, count]) => count === scorelines[0][1])) {
                // All the same
                return "No effect";
            }

            if (leftScores.every(([s, c]) => c) && !rightScores.some(([s, c]) => c)) {
                // ? ? ? - 0 0 0
                // return `${teamCodes[0]} must win`;

                if (leftScores.every(([s, c]) => c === leftScores[0][1])) {
                    // X X X - 0 0 0
                    return `${teamCodes[0]} must win`;
                } else {
                    // X Y Z - 0 0 0

                    const differenceMap = {};
                    leftScores.forEach(([c, s]) => {
                        if (differenceMap[s]) {
                            differenceMap[s].push(c);
                        } else {
                            differenceMap[s] = [c];
                        }
                    });
                    // const differences = Object.entries(differenceMap);
                    // const only = differences.find(([c, diffScorelines]) => diffScorelines.length === 1);

                    return `${teamCodes[0]} must win, not locked`;
                    // if (differences.length === 1) {
                    //     const other = differences.find(([c, diffScorelines]) => diffScorelines.length !== 1);
                    //     return `${teamCodes[0]} must win, ${JSON.stringify({ only, other })}`;
                    // } else {
                    //     return `${teamCodes[0]} must win, 3 different nums`;
                    // }
                }
            }
            if (rightScores.every(([s, c]) => c) && !leftScores.some(([s, c]) => c)) {
                // 0 0 0 - ? ? ?
                // return `${teamCodes[1]} must win`;

                if (rightScores.every(([s, c]) => c === rightScores[0][1])) {
                    // 0 0 0 - X X X
                    return `${teamCodes[1]} must win`;
                } else {
                    // 0 0 0 - X Y Z
                    return `${teamCodes[1]} must win, not locked`;
                }
            }
            if (scorelines.some(([s, c]) => c === 0)) {
                // at least one of the options is 0 - depends on an outcome

                const allZeroes = scorelines.filter(([c, s]) => s === 0).length;
                if (allZeroes === scorelines.length - 1) {
                    const scoreline = scorelines.find(([c, s]) => s !== 0);
                    if (scoreline[0].startsWith(scorelines[0][0].slice(0, 1))) {
                        // left win
                        return `${teamCodes[0]} must win ${scoreline[0]}`;
                    } else {
                        // right win
                        return `${teamCodes[1]} must win ${scoreline[0].split("-").reverse().join("-")}`;
                    }
                }

                let zeroGroups = 0;
                let last = -1;

                scorelines.forEach(([scoreline, count]) => {
                    if (last === count) {
                        // same as last
                    } else if (count === 0) {
                        zeroGroups++;
                    }
                    last = count;
                });

                console.log("analysis zero grouped", {
                    zeroGroups,
                    last
                });

                const validLeft = leftScores.filter(([c, s]) => s !== 0);
                const validRight = rightScores.filter(([c, s]) => s !== 0);

                if (validLeft.length === validRight.length) {
                    if (validLeft.length === 1 && validLeft[0][0].split("-").reverse().join("-") !== validRight[0][0]) {
                        const biggest = validLeft[0][0].split("-").map(e => parseInt(e)).reduce((a, c) => a + c, 0);
                        return `Game must go to ${biggest} maps`;
                    } else {
                        // range of maps - same # per side. make sure it's the same positions
                        let isValid = true;
                        validLeft.forEach(([scoreline, count], i) => {
                            const sameRight = validRight[validRight.length - 1 - i];
                            if (scoreline.split("-").reverse().join("-") !== sameRight[0]) {
                                isValid = false;
                            }
                        });

                        if (isValid) {
                            // scoreline is something like 0 X X - X X 0 or X X 0 - 0 X X
                            const smallest = validLeft[0][0].split("-").map(e => parseInt(e)).reduce((a, c) => a + c, 0);
                            const biggest = validLeft[validLeft.length - 1][0].split("-").map(e => parseInt(e)).reduce((a, c) => a + c, 0);
                            return `Game must go to ${smallest}-${biggest} maps`;
                        } else {
                            return "~ Something in the middle";
                        }
                    }
                } else {
                    if (zeroGroups === 1) {
                        // there is only one block of 0s
                        // i.e. there is a cut-off of map wins
                        if (scorelines[0][1] === 0) {
                            // 0 ? ? - ? ? ?
                            // starting from left side
                            if (leftScores.every(([c, s]) => s === 0)) {
                                // 0 0 0 - ? ? ? (more 0s on right side)
                                // Right must win, AND
                                return `${teamCodes[1]} must win ${scorelines.find(([s, c]) => c !== 0)[0].split("-").reverse().join("-")} or better`;
                            } else {
                                const zeroes = leftScores.filter(([c, s]) => s === 0).length;
                                return `${teamCodes[1]} must win ${zeroes} map${zeroes === 1 ? "" : "s"}`;
                            }
                        }
                        if (scorelines[scorelines.length - 1][1] === 0) {
                            // ? ? ? - ? ? 0
                            // starting from right side
                            if (rightScores.every(([c, s]) => s === 0)) {
                                // 0 0 0 - ? ? ? (more 0s on right side)
                                // Left must win, AND
                                return `${teamCodes[0]} must win ${[...scorelines].reverse().find(([s, c]) => c !== 0)[0]} or better`;
                            } else {
                                const zeroes = rightScores.filter(([c, s]) => s === 0).length;
                                return `${teamCodes[0]} must win ${allZeroes} map${zeroes === 1 ? "" : "s"}`;
                            }
                        }

                        // ? ? 0 - 0 ? ?  (unknown number of 0s or #s, just in the middle)
                    } else {
                        return "~ more than one group of 0s";
                    }
                }
            } else {
                if (leftScores.every(([s, c]) => c === leftScores[0][1]) && rightScores.every(([s, c]) => c === rightScores[0][1])) {
                    // no 0s but all sides are better
                    if (leftScores[0][1] > rightScores[0][1]) {
                        return `Mixed but ${teamCodes[0]} win is better`;
                    } else {
                        return `Mixed but ${teamCodes[1]} win is better`;
                    }
                }

                const differenceMap = {};
                nonZeroScorelines.forEach(([c, s]) => {
                    if (differenceMap[s]) {
                        differenceMap[s].push(c);
                    } else {
                        differenceMap[s] = [c];
                    }
                });
                const differences = Object.entries(differenceMap);

                if (differences.length === 2) {
                    const only = differences.find(([c, diffScorelines]) => diffScorelines.length === 1);
                    if (only) {
                        const other = differences.find(([c, diffScorelines]) => diffScorelines.length !== 1);
                        return `Mixed but ${parseInt(other[0]) > parseInt(only[0]) ? "worse" : "better"} if ${only[1]}`;
                    }
                    if (nonZeroScorelineDirection.direction && !nonZeroScorelineDirection.incorrect) {
                        return `Direction is ${nonZeroScorelineDirection.direction === "down" ? teamCodes[0] : teamCodes[1]}, ${differences}`;
                    }
                } else {
                    if (nonZeroScorelineDirection.direction && !nonZeroScorelineDirection.incorrect) {
                        return `Mixed but prefer ${nonZeroScorelineDirection.direction === "down" ? teamCodes[0] : teamCodes[1]} success`;
                    }
                }
            }


            return "Mixed effect";
        }
    },
    watch: {
        activeMatchGroup(key) {
            this.manualScenarioFilters = [];
            this.manualScorelineFilters = [];
        }
    }
};
</script>

<style scoped>
    td {
        border-bottom: 1px solid #555;
    }
    .cell-num {
        min-width: 3em;
        text-align: center;
        cursor: pointer;
        user-select: none;
    }
    .cell-num.selected {
        background-color: var(--info) !important;
        color: var(--light) !important;
    }
    .standings-entry {
        white-space: pre;
        font-family: monospace;
        line-height: 1;
    }
</style>

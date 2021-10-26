<template>
    <div class="event-scenarios container">
        <h1>Scenarios 2.0</h1>


        <div class="form-inline mb-2">
<!--            <select name="" id="" v-model="activeScenarioView" class="mr-2 form-control">-->
<!--                <option value="all" selected>All</option>-->
<!--                <option value="possible">Possible</option>-->
<!--                <option value="incomplete">Incomplete</option>-->
<!--            </select>-->

            <BFormCheckbox class="mr-3" v-model="showOnlyPossible">Show only possible</BFormCheckbox>
            <BFormCheckbox class="mr-3" v-model="showOnlyIncomplete">Show only incomplete</BFormCheckbox>
            <BFormCheckbox class="mr-3" v-model="showCountsAsPercentages">Show counts as percentages</BFormCheckbox>

<!--            <div class="btn btn-secondary" v-if="showCountsAsPercentages" @click="showCountsAsPercentages = false">View as numbers</div>-->
<!--            <div class="btn btn-secondary" v-if="!showCountsAsPercentages" @click="showCountsAsPercentages = true">View as percentages</div>-->
        </div>


        <div v-if="scenarios" class="mb-2">
            {{ currentScenarioView && currentScenarioView.length }} view ~ {{ scenarios.scenarios && scenarios.scenarios.length }} / {{ scenarios.scenarioCount }}
<!--            {{ scenarios.maxBits }}-->
<!--            {{ scenarios.bitCounter }}-->
<!--            {{ scenarios.bits }}-->
        </div>


        <div class="n-nav" v-if="matchGroups">
            <select name="match-group-selector" id="match-group-selector" v-model="activeMatchGroup">
                <option selected disabled value="null">Select a group</option>
                <option v-for="group in matchGroups" :value="group" v-bind:key="group">{{ group }}</option>
            </select>
        </div>

        <table class="table-bordered text-light mb-3" v-if="counts && counts[0] && counts[0].positions">
            <tr v-if="counts" class="font-weight-bold">
                <th class="p-2 border-dark text-right">{{ showCountsAsPercentages ? `% of ${currentScenarioView.length} scenarios` : `/${currentScenarioView.length} scenarios`}}</th>
                <th class="p-2 border-dark" v-for="(x, i) in (counts[0].positions).slice(0, -1)" v-bind:key="i">
                    #{{ i + 1 }}
                </th>
                <th class="p-2 border-dark">Incomplete</th>
            </tr>
            <tr v-for="team in counts" v-bind:key="team.code">
                <td class="p-2 border-dark text-right font-weight-bold">{{ team.code }}</td>
                <td class="p-2 border-dark" v-for="(pos, posi) in team.positions" v-bind:key="posi">
                    <span v-if="showCountsAsPercentages">{{ (pos / currentScenarioView.length) | perc }}</span>
                    <span v-else>{{ pos }}</span>
                </td>
            </tr>
        </table>

        <table class="table text-white" v-if="scenarios">
            <tr class="sticky-top bg-dark">
                <td>#</td>
                <td class="text-center" v-for="match in scenarioMatches" v-bind:key="match.id">
                    {{ match.teams.map(t => t.code).join(' vs ') }}
                </td>
                <td class="text-center">Standings</td>
            </tr>
            <tr v-for="(scenario, i) in currentScenarioView" v-bind:key="i">
                <td>{{ scenario.i + 1 }}</td>
                <td v-for="(match, mi) in scenario.outcomes" v-bind:key="mi">
                    {{ match.scoreFirstWinner && match.scoreFirstWinner.join('-') }} {{ match.winner && match.winner.code }}
                </td>
<!--                <td>-->
<!--                    not sorted-->
<!--                    <ul>-->
<!--                        <li class="text-nowrap" v-for="team in scenario.teams" v-bind:key="team.id">-->
<!--                            {{ team.code }} ({{ team.wins }}-{{ team.losses }}) m({{ team.map_wins }}-{{ team.map_losses }})-->
<!--                        </li>-->
<!--                    </ul>-->
<!--                </td>-->
                <td class="text-nowrap">
<!--                    first round of sorting (match wins)-->
                    <ol class="mb-0 small">
                        <li v-for="(g, gi) in scenario.standings" v-bind:key="gi">
                            <div v-for="(team,ei) in g" v-bind:key="ei">{{ team.code }} ({{ team.wins }}-{{ team.losses }}) (m{{ team.map_wins }}-{{ team.map_losses }})</div>
                        </li>
                    </ol>
                </td>
            </tr>
        </table>
    </div>
</template>

<script>
import { ReactiveArray } from "@/utils/reactive";
import {
    BitCounter, sortTeamsIntoStandings
} from "@/utils/scenarios";
import { BFormCheckbox } from "bootstrap-vue";


export default {
    name: "EventScenarios2.vue",
    props: ["event"],
    components: { BFormCheckbox },
    data: () => ({
        activeMatchGroup: "Groups Stage", // todo: return this to null
        activeScenarioView: "all",
        showCountsAsPercentages: true,
        showOnlyPossible: true,
        showOnlyIncomplete: false
    }),
    computed: {
        settings() {
            if (!this.event?.blocks) return null;
            try {
                const settings = JSON.parse(this.event.blocks);
                if (!settings?.foldy?.use) return null;
                return settings.foldy;
            } catch (e) {
                return null;
            }
        },
        currentScenarioView() {
            if (!this.scenarios) return [];
            let scenarios = this.scenarios.scenarios;
            if (this.showOnlyIncomplete) scenarios = scenarios.filter(s => s.standings.length !== s.teams.length);
            if (this.showOnlyPossible) scenarios = scenarios.filter(s => !s.impossible);
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
            return this.matches.filter(m => !!m.teams && m.teams.length === 2).map(m => {
                m.teams = m.teams.map(t => ({
                    code: t.code || t.name,
                    id: t.id
                }));


                return {
                    teams: m.teams,
                    first_to: m.first_to,
                    completed: [m.score_1, m.score_2].some(s => s === m.first_to),
                    liveWinner: (m.score_1 === m.first_to ? m.teams[0] : m.teams[1])?.code,
                    scores: [m.score_1, m.score_2]
                };
            });
        },
        scenarioMatchesWithOutcomes() {
            if (!this.scenarioMatches) return [];
            return this.scenarioMatches.map(m => {
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
            this.scenarioMatches.forEach(match => {
                match.teams.forEach(team => {
                    if (!teams.find(t => t.code === team.code)) {
                        teams.push({ id: team.id, code: team.code, wins: 0, losses: 0, map_wins: 0, map_losses: 0, h2h: {} });
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
                if (scenario.standings.length !== scenario.teams.length) {
                    // add to end
                    teams.forEach(t => t.positions[teams.length]++);
                } else {
                    scenario.standings.forEach((standing, i) => {
                        // console.log(standing, i, standing[0], teamMap[standing[0].code], teams[teamMap[standing[0].code]].positions[i]);
                        teams[teamMap[standing[0].code]].positions[i]++;
                    });
                }
            });


            return teams;
        },
        scenarios() {
            if (!this.scenarioMatches?.length) return null;
            if (!this.scenarioTeams?.length) return null;
            console.log("teams", this.scenarioTeams);
            const matches = this.scenarioMatchesWithOutcomes;
            const maxBits = matches.map(m => m.first_to * 2);
            const scenarioCount = maxBits.reduce((last, curr) => last * curr, 1);
            // const scenarioCount = 65;
            const _json = { teams: JSON.stringify(this.scenarioTeams), matches: JSON.stringify(this.scenarioMatches) };
            const scenarios = [];

            if (scenarioCount > 2 ** 16) {
                // return { error: "too many computations required" };
            }

            // const bitCounter = maxBits.map(() => 0);
            const bitCounter = new BitCounter({ bits: maxBits });

            for (let i = 0; i < scenarioCount; i++) {
                const scenario = {
                    teams: JSON.parse(_json.teams),
                    matches: JSON.parse(_json.matches),
                    i,
                    impossible: false
                };
                scenario.outcomes = bitCounter.bits.map((bit, i) => {
                    return matches[i].outcomes[bit];
                    /*
                    const match = scenario.matches[i];
                    match.outcome = matches[i].outcomes[bit];
                    delete match.outcomes;
                    return match;
                     */
                });
                scenario.outcomes.forEach((outcome, i) => {
                    const match = scenario.matches[i];
                    // console.log("match", match, outcome.scores);
                    if (match.completed && (match.scores[0] !== outcome.scores[0] || match.scores[1] !== outcome.scores[1])) {
                        // if anything is incorrect
                        scenario.impossible = true;
                    }


                    match.teams.forEach((_team, ti) => {
                        const team = scenario.teams.find(t => t.id === _team.id);
                        const otherTeam = scenario.teams.find(t => t.id === match.teams[+!ti].id);

                        // console.log(team, otherTeam);
                        // todo: error here when not all data is loaded properly

                        const teamWonThisMatch = match.first_to === outcome.scores[ti];
                        if (teamWonThisMatch) {
                            team.wins++;

                            if (!team.h2h[otherTeam.id]) team.h2h[otherTeam.id] = 0;
                            team.h2h[otherTeam.id]--;
                        } else {
                            team.losses++;
                            if (!team.h2h[otherTeam.id]) team.h2h[otherTeam.id] = 0;
                            team.h2h[otherTeam.id]++;
                        }
                        team.map_wins += outcome.scores[ti];
                        team.map_losses += outcome.scores[+!ti];
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
                        // console.log("last place so far", team.code, team.wins);
                        scenario.standings.push([team]);
                    }
                });
                */

                scenario.sorts = 1;

                // sortMatches(scenario.i, sortByMatchWins, scenario.teams, scenario.standings);
                // console.log(scenario);

                scenario.standings = sortTeamsIntoStandings(scenario.teams);
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
    }
};
</script>

<style scoped>
    td {
        border-bottom: 1px solid #555;
    }
</style>

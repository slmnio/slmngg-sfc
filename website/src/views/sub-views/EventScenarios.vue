<template>
    <div class="container">

        <h2 class="text-center mb-3">Foldy Sheet</h2>

        <div class="n-nav mb-2" v-if="_matchGroups">
            <select name="match-group-selector" id="match-group-selector" v-model="activeMatchGroup">
                <option selected disabled value="null">Select a group</option>
                <option v-for="group in _matchGroups" :value="group" :key="group">{{ group }}</option>
            </select>
        </div>

        <div>
            <p class="mb-1">A foldy sheet runs all potential scenarios to show you the remaining results of a groups stage. Please note:</p>
            <ul>
                <li>The simulation does not know how to handle more than a 2-team tie (so a 3-way tie may be broken incorrectly). It will detect when a 3-way tie occurs and remove it from scenario counts.</li>
                <li>The simulation only deals in binary (win/loss) and doesn't take map scores into account yet.</li>
                <li>You can choose live scenarios (any remaining possible scenario) or all scenarios (all possible scenarios from the start of the tournament).</li>
                <li>You can click on matchups to override the winner and force new calculations. You can click on the match title to reset.</li>
            </ul>

        </div>

        <div class="btn btn-dark mb-3" v-if="showAll" @click="showAll = false">Show live scenarios</div>
        <div class="btn btn-dark mb-3" v-if="!showAll" @click="showAll = true">Show all scenarios</div>

        <div class="d-flex">
            <table class="table table-dark table-sm w-auto mr-3" v-for="calc in calculations" :key="calc.title">
                <thead>
                    <tr>
                        <th colspan="3" class="text-center">{{ calc.title }}</th>
                    </tr>
                    <tr>
                        <th>Team</th>
                        <th colspan="2">Scenarios (/{{ scenarios.length }})</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="team in calc.counts" :key="team.code">
                        <td>{{ team.code }}</td>
                        <td>{{ team.num }}</td>
                        <td>{{ perc(team.perc) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="padder">
            <table class="table table-dark table-hover table-sm">
                <thead>
                <tr>
                    <th></th>
                    <th :colspan="scenarioMatches.length" class="text-center">Matchups</th>
                    <th :colspan="scenarioTeams.length" class="text-center">Placement</th>
                    <th></th>
                </tr>
                <tr>
                    <td class="text-center">#</td>
                    <td v-for="(match, i) in scenarioMatches" :key="`m-${i}`" :class="{ 'locked': match.completed }"
                        @click="setOverride(i, null)">
                        {{ match.teams.map((t, ti) => overrides[i] === ti ? `[${t}]` : t).join(" vs ") }}
                    </td>
                    <td v-for="(team, ti) in scenarioTeams" :key="`t2-${ti}`" class="text-center">
                        #{{ ti+1 }}
                    </td>
                    <td class="text-center">Info</td>
                </tr>
                </thead>

                <tbody>
                <tr v-for="(scenario, i) in scenarios" :key="`scenario-${i}`" :class="{'impossible': scenario.impossible, 'tie-l': scenario.flags.includes('3-WAY-LAST'), 'tie-f': scenario.flags.includes('3-WAY-FIRST')}">
                    <td class="text-center">{{ scenario.i + 1 }}</td>
                    <td v-for="(winner, wi) in scenario.winners" :key="`w-${wi}`"
                        :class="{ 'locked': scenarioMatches[wi].completed && !scenario.impossible, 'overridden': overrides[wi] === scenario.bits[wi] }"
                        @click="setOverride(wi, scenario.bits[wi])">
                        {{ winner }}
                    </td>
                    <td v-for="(team, ti) in scenario.standings" :key="`t-${ti}`" class="no-wrap">
                        {{ team.code }}

                        <span class="badge badge-pill bg-info">{{ team.wins }}-{{ team.losses }}</span>
                    </td>
                    <td class="text-end">
                        <span class="badge" v-if="scenario.flags.includes('3-WAY-LAST')">3-way L</span>
                        <span class="badge" v-if="scenario.flags.includes('3-WAY-FIRST')">3-way F</span>
                        <i class="fas fa-info-circle" v-if="scenario.notes.length" :title="scenario.notes.join(', ')"></i>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import { ReactiveArray } from "@/utils/reactive";

export default {
    name: "EventScenarios",
    props: ["event"],
    data: () => ({
        highlighted: null,
        showAll: false,
        activeMatchGroup: null,
        overrides: {}
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
        _matchGroups() {
            if (!this.settings) return null;
            if (this.settings.group) return null;
            return this.settings.groups || null;
        },
        _matchGroup() {
            if (!this.settings) return null;
            return this.settings.group || null;
        },
        matches() {
            if (!this.event?.matches) return [];
            return ReactiveArray("matches", {
                teams: ReactiveArray("teams")
            })(this.event).filter(match => {
                // if (!this._matchGroup || !this.activeMatchGroup) return true;
                if (this.activeMatchGroup) return match.match_group === this.activeMatchGroup;
                if (this._matchGroup) return match.match_group === this._matchGroup;
                return !this._matchGroups;
            });
        },
        scenarioMatches() {
            if (!this.matches) return [];
            return this.matches.filter(m => !!m.teams && m.teams.length === 2).map(m => ({
                teams: m.teams.map(t => t.code || t.name),
                first_to: m.first_to,
                completed: [m.score_1, m.score_2].some(s => s === m.first_to),
                liveWinner: (m.score_1 === m.first_to ? m.teams[0] : m.teams[1])?.code
            }));
        },
        scenarioTeams() {
            const teams = [];
            this.scenarioMatches.forEach(match => {
                match.teams.forEach(teamCode => {
                    if (!teams.find(t => t.code === teamCode)) {
                        teams.push({ code: teamCode, wins: 0, losses: 0 });
                    }
                });
            });
            console.log(teams);
            return teams;
        },
        scenarios() {
            if (!this.matches || !this.scenarioTeams || !this.scenarioTeams.length) return [];
            const matches = this.scenarioMatches;
            const teams = this.scenarioTeams;
            const scenarioCount = Math.pow(2, matches.length);
            console.log("scenarios", scenarioCount);
            const scenarios = [];
            const mask = (scenarioCount - 1).toString(2).length;


            for (let i = 0; i < scenarioCount; i++) {
                const bits = i.toString(2).padStart(mask, "0").split("").map(e => parseInt(e));
                const scenario = {
                    bits,
                    i,
                    winners: [],
                    teams: JSON.parse(JSON.stringify(teams)),
                    matches: JSON.parse(JSON.stringify(matches))
                };

                scenario.matches.forEach((match, mi) => {
                    scenario.winners.push(match.teams[bits[mi]]);
                    if (match.completed) {
                        // match.winner = match.liveWinner;
                        // match.loser = match.teams.find(team => team !== match.liveWinner);

                        if (match.liveWinner === match.teams[bits[mi]]) {
                            // console.log("match pred won", bits[mi]);
                        } else {
                            // console.log("match pred lost");
                            scenario.impossible = true;
                        }
                    } else {
                    }
                    match.winner = match.teams[bits[mi]];
                    match.loser = match.teams[+!bits[mi]];


                    scenario.teams.find(t => t.code === match.winner).wins++;
                    scenario.teams.find(t => t.code === match.loser).losses++;

                    if (this.overrides[mi] !== undefined && this.overrides[mi] !== null) {
                        // override for this match
                        if (this.overrides[mi] !== bits[mi]) scenario.impossible = true;
                    }
                });

                scenario.notes = [];
                scenario.flags = [];

                scenario.standings = scenario.teams.sort((a, b) => {
                    if (a.wins > b.wins) return -1;
                    if (b.wins > a.wins) return 1;

                    const h2h = scenario.matches.find(match => match.teams.every(t => [a.code, b.code].includes(t)));
                    // if (!h2h) return 0;
                    if (h2h && h2h.winner === a.code) { scenario.notes.push(`[${h2h.winner} > ${h2h.loser}] broken by h2h`); return -1; }
                    if (h2h && h2h.winner === b.code) { scenario.notes.push(`[${h2h.winner} > ${h2h.loser}] broken by h2h`); return 1; }

                    console.warn("still tied", a, b);
                    if (!h2h) { scenario.notes.push(`[${a.code} - ${b.code}] no h2h to break the tie`); return 0; }
                    return 0;
                });

                // Check for 3-way ties
                if (scenario.standings.length === 4 && scenario.standings[0].losses === 0) {
                    const tiedScoreline = scenario.standings[1];
                    if (scenario.standings.slice(2).every(s => s.wins === tiedScoreline.wins && s.losses === tiedScoreline.losses)) {
                        scenario.notes.push("3-way tie for last detected");
                        scenario.flags.push("3-WAY-LAST");
                        console.warn("3-way tie", scenario);
                    }
                }
                if (scenario.standings.length === 4 && scenario.standings[3].wins === 0) {
                    const tiedScoreline = scenario.standings[0];
                    if (scenario.standings.slice(0, 3).every(s => s.wins === tiedScoreline.wins && s.losses === tiedScoreline.losses)) {
                        scenario.notes.push("3-way tie for first detected");
                        scenario.flags.push("3-WAY-FIRST");
                        console.warn("3-way tie (first)", scenario);
                    }
                }

                scenarios.push(scenario);
            }

            if (this.showAll) {
                return scenarios;
            } else {
                return scenarios.filter(s => !s.impossible);
            }
        },
        calculations() {
            if (!this.settings?.calculate) return [];

            return this.settings.calculate.map(calc => {
                if (calc.top) {
                    const counts = {};
                    this.scenarioTeams.forEach(t => {
                        counts[t.code] = 0;
                    });
                    counts["3-way tie"] = 0;

                    this.scenarios.forEach(scenario => {
                        if (scenario.flags.includes("3-WAY-LAST") && calc.top > 1 && scenario.standings.length === 4) {
                            console.log(`cannot count this scenario for top ${calc.top} since it has a 3-way tie (lower)`);
                            counts["3-way tie"]++;
                        } else if (scenario.flags.includes("3-WAY-FIRST") && calc.top < 3) {
                            console.log(`cannot count this scenario for top ${calc.top} since it has a 3-way tie (higher)`);
                            counts["3-way tie"]++;
                        } else {
                            for (let i = 0; i < calc.top; i++) {
                                const team = scenario.standings[i];
                                if (team) counts[team.code]++;
                            }
                        }
                    });

                    const sortedCounts = Object.entries((counts)).map(([code, num]) => ({ code, num, perc: num / this.scenarios.length })).sort((a, b) => b.num - a.num);

                    return {
                        title: `Scenarios teams are top ${calc.top}`,
                        counts: sortedCounts
                    };
                }
                if (calc.bottom) {
                    const counts = {};
                    this.scenarioTeams.forEach(t => {
                        counts[t.code] = 0;
                    });
                    counts["3-way tie"] = 0;

                    this.scenarios.forEach(scenario => {
                        if (scenario.flags.includes("3-WAY-LAST") && calc.bottom < 3) {
                            console.log(`cannot count this scenario for bottom ${calc.bottom} since it has a 3-way tie`);
                            counts["3-way tie"]++;
                        } else if (scenario.flags.includes("3-WAY-FIRST") && (scenario.standings.length === 4 && [2, 3].includes(calc.bottom))) {
                            console.log(`cannot count this scenario for bottom ${calc.bottom} since it has a 3-way tie (higher)`);
                            counts["3-way tie"]++;
                        } else {
                            for (let i = 0; i < calc.bottom; i++) {
                                // bottom 1, 2
                                const team = scenario.standings[scenario.standings.length - 1 - i];
                                if (team) counts[team.code]++;
                            }
                        }
                    });

                    const sortedCounts = Object.entries((counts)).map(([code, num]) => ({ code, num, perc: num / this.scenarios.length })).sort((a, b) => a.num - b.num);

                    return {
                        title: `Scenarios teams are bottom ${calc.bottom}`,
                        counts: sortedCounts
                    };
                }
            });
        }
    },
    methods: {
        perc(num) {
            if (isNaN(num)) return "-";
            return (num * 100).toFixed(1) + "%";
        },
        setOverride(index, num) {
            console.log("override", index, num);
            if (this.overrides[index] === num) {
                // unset
                // this.overrides[index] = null;
                this.$set(this.overrides, index, null);
            } else {
                // this.overrides[index] = num;
                this.$set(this.overrides, index, num);
            }
        }
    }
};
</script>

<style scoped>
    .locked {
        background-color: #524223;
    }
    .overridden {
        background-color: #887e30;
    }
    .tie-f {
        background-color: #23523e;
    }
    .tie-l {
        background-color: #234952;
    }
    .impossible {
        background-color: #931a26
    }
    .no-wrap {
        white-space: nowrap;
    }
    .padder {
        min-height: 100vh;
    }
</style>

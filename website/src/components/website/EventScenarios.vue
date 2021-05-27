<template>
    <div class="container">

        <div class="btn btn-dark mb-3" v-if="showAll" @click="showAll = false">Show live scenarios</div>
        <div class="btn btn-dark mb-3" v-if="!showAll" @click="showAll = true">Show all scenarios</div>

        <div class="d-flex">
            <table class="table table-dark table-sm w-auto mr-3" v-for="calc in calculations" v-bind:key="calc.title">
                <tr>
                    <th colspan="3" class="text-center">{{ calc.title }}</th>
                </tr>
                <tr>
                    <th>Team</th>
                    <th colspan="2">Scenarios (/{{ scenarios.length }})</th>
                </tr>
                <tr v-for="team in calc.counts" v-bind:key="team.code">
                    <td>{{ team.code }}</td>
                    <td>{{ team.num }}</td>
                    <td>{{ team.perc | perc}}</td>
                </tr>
            </table>
        </div>


        <table class="table table-dark table-hover table-sm">
            <thead>
            <tr>
                <td></td>
                <th :colspan="scenarioMatches.length" class="text-center">Matchups</th>
                <th :colspan="scenarioTeams.length" class="text-center">Placement</th>
            </tr>
            <tr>
                <td class="text-center">#</td>
                <td v-for="(match, i) in scenarioMatches" v-bind:key="`m-${i}`" v-bind:class="{ 'locked': match.completed }">
                    {{ match.teams.join(" vs ") }}
                </td>
                <td v-for="(team, ti) in scenarioTeams" v-bind:key="`t2-${ti}`" class="text-center">
                    #{{ ti+1 }}
                </td>
            </tr>
            </thead>

            <tbody>
            <tr v-for="(scenario, i) in scenarios" v-bind:key="`scenario-${i}`" v-bind:class="{'impossible': scenario.impossible}">
                <td class="text-center">{{ scenario.i + 1 }}</td>
                <td v-for="(winner, wi) in scenario.winners" v-bind:key="`w-${wi}`" v-bind:class="{ 'locked': scenarioMatches[wi].completed && !scenario.impossible }">
                    {{ winner }}
                </td>
                <td v-for="(team, ti) in scenario.standings" v-bind:key="`t-${ti}`">
                    {{ team.code }}

                    <span class="badge badge-pill bg-info">{{ team.wins }}-{{ team.losses }}</span>
                </td>
            </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { ReactiveArray } from "@/utils/reactive";

export default {
    name: "EventScenarios",
    props: ["event"],
    data: () => ({
        highlighted: null,
        showAll: false
    }),
    filters: {
        perc(num) {
            return (num * 100).toFixed(1) + "%";
        }
    },
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
        matches() {
            if (!this.event?.matches) return [];
            return ReactiveArray("matches", {
                teams: ReactiveArray("teams")
            })(this.event).filter(match => {
                if (!this.settings.group) return true;
                return match.match_group === this.settings.group;
            });
        },
        scenarioMatches() {
            if (!this.matches) return [];
            return this.matches.map(m => ({
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
                        match.winner = match.liveWinner;
                        match.loser = match.teams.find(team => team !== match.liveWinner);

                        if (match.winner === match.teams[bits[mi]]) {
                            // console.log("match pred won", bits[mi]);
                        } else {
                            // console.log("match pred lost");
                            scenario.impossible = true;
                        }
                    } else {
                        match.winner = match.teams[bits[mi]];
                        match.loser = match.teams[+!bits[mi]];
                    }


                    scenario.teams.find(t => t.code === match.winner).wins++;
                    scenario.teams.find(t => t.code === match.loser).losses++;
                });


                scenario.standings = scenario.teams.sort((a, b) => {
                    if (a.wins > b.wins) return -1;
                    if (b.wins > a.wins) return 1;

                    const h2h = scenario.matches.find(match => match.teams.every(t => [a.code, b.code].includes(t)));
                    // if (!h2h) return 0;
                    if (h2h.winner === a.code) return -1;
                    if (h2h.winner === b.code) return 1;

                    console.warn("still tied", a, b);
                    return 0;
                });

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

                    this.scenarios.forEach(scenario => {
                        for (let i = 0; i < calc.top; i++) {
                            const team = scenario.standings[i];
                            counts[team.code]++;
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

                    this.scenarios.forEach(scenario => {
                        for (let i = 0; i < calc.bottom; i++) {
                            // bottom 1, 2
                            const team = scenario.standings[scenario.standings.length - 1 - i];
                            counts[team.code]++;
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
    }
};
</script>

<style scoped>
    .locked {
        background-color: #524223;
    }
    .impossible {
        background-color: #931a26
    }
</style>

<template>
    <div class="standings" v-if="standings && standings.length">
<!--        <div>{{ event.name }} / {{ stage }} / {{ allMatches.length }} -> {{ stageMatches.length }} ({{ teams.length }} teams)</div>-->
        <h3 class="top-standings-name text-center d-md-none">{{ title || stage || 'Team' }}</h3>
        <div class="standings-header d-flex align-items-center">
            <div class="team-name flex-grow-1 text-left d-none d-md-flex">{{ title || stage || 'Team' }}</div>
            <div class="team-name team-code flex-grow-1 text-left d-md-none"></div>
            <div class="team-stats d-flex">
                <div class="team-stat text-center">Matches</div>
                <div class="team-stat text-center">Maps</div>
                <div class="team-stat text-center">Map Diff</div>
                <div v-if="useOMW" class="team-stat text-center d-none d-md-block" v-b-tooltip:top="'Opponent Match Winrate'">OMW</div>
<!--                <div class="team-stat text-center">Points</div>-->
            </div>
        </div>
        <div class="teams">
            <div class="team-group" v-for="(group, i) in standings" v-bind:key="i">
                <div class="team" v-for="team in group" v-bind:key="team.id">
                    <StandingsTeam :team="team" :tie-text="tieText" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import StandingsTeam from "@/components/broadcast/StandingsTeam";
import { sortTeamsIntoStandings } from "@/utils/scenarios";


function avg(arr) {
    if (!arr?.length) return null;
    const sum = arr.reduce((a, b) => a + b, 0);
    const avg = (sum / arr.length) || 0;
    return avg;
}


export default {
    name: "Standings",
    props: {
        event: Object,
        stage: String,
        title: String,
        tieText: String,
        showMapDiff: Boolean
    },
    components: { StandingsTeam },
    computed: {
        allMatches() {
            if (!this.event || !this.event.matches) return [];
            return ReactiveArray("matches", {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                })
            })(this.event);
        },
        stageMatches() {
            if (!this.allMatches || !this.allMatches.length || !this.stage) return [];
            if (!this.stage) return this.allMatches;
            return this.allMatches.filter(match => match.match_group && match.match_group.toLowerCase() === this.stage.toLowerCase());
        },
        blocks() {
            if (!this.event || !this.event.blocks) return null;
            try {
                const blocks = JSON.parse(this.event.blocks);
                return blocks || null;
            } catch (e) {
                return null;
            }
        },
        settings() {
            if (!this.blocks) return null;
            return this.blocks?.settings || null;
        },
        useOMW() {
            return this.settings?.useOMW && this.stageMatches.every(m => [m.score_1, m.score_2].some(s => s === m.first_to));
        },
        standingsSort() {
            try {
                const sorters = this.blocks.standingsSort;
                if (sorters && sorters.length) {
                    const sorter = sorters.find(s => s.group === this.stage);
                    return sorter?.sort;
                }
            } catch (e) {
                return null;
            }
            return null;
        },
        standings() {
            if (!this.stageMatches || !this.event) return [];
            if (!this.stageMatches.some(m => m.match_group)) return []; // make sure there's matches to analyse

            const teamMap = new Map();
            this.stageMatches.forEach(match => {
                match.teams && match.teams.forEach(team => {
                    teamMap.set(team.id, team);
                });
            });
            let teams = [];
            if (teamMap.size === 0) {
                teams = this.event.teams;
            } else {
                teams = [...teamMap.values()];
            }

            if (!teams) return [];

            // console.log(this.settings);

            teams.map(team => {
                team.standings = {
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
                if (this.settings && this.settings.points) team.standings.points = team.extra_points || 0;
                // get matches here
                this.stageMatches.forEach(match => {
                    if (!match.teams) return;
                    if (!match.teams.some(t => t.id === team.id)) return;
                    // one of the teams is current loop team
                    const scores = [match.score_1, match.score_2];
                    if (!scores.some(score => score === match.first_to)) return; // not finished

                    const opponent = match.teams.find(t => t.id !== team.id);

                    team.standings.played++;
                    if (match.maps) {

                    } else {
                        team.standings.maps_played += match.score_1 + match.score_2;
                    }

                    const teamIndex = match.teams[0].id === team.id ? 0 : 1;
                    team.standings.map_wins += scores[teamIndex];
                    team.standings.map_losses += scores[+!teamIndex];
                    team.standings.map_diff += (scores[teamIndex] - scores[+!teamIndex]);

                    if (this.settings && this.settings.points) team.standings.points += (this.settings.points.map_wins * team.standings.map_wins);
                    if (this.settings && this.settings.points) team.standings.points += (this.settings.points.map_losses * team.standings.map_losses);

                    const winIndex = match.score_1 === match.first_to ? 0 : 1;
                    const winner = match.teams[winIndex];

                    if (!team.standings.h2h[opponent.id]) team.standings.h2h[opponent.id] = 0;

                    if (winner.id === team.id) {
                        team.standings.wins++;
                        if (this.settings && this.settings.points) team.standings.points += this.settings.points.wins;

                        // update win/loss h2h against opponent
                        team.standings.h2h[opponent.id]++;
                    } else {
                        team.standings.losses++;
                        if (this.settings && this.settings.points) team.standings.points += this.settings.points.losses;
                        team.standings.h2h[opponent.id]--;
                    }
                    if (!team.standings.h2h_maps[opponent.id]) team.standings.h2h_maps[opponent.id] = 0;
                    team.standings.h2h_maps[opponent.id] += scores[teamIndex] - scores[+!teamIndex];
                });

                team.standings.winrate = team.standings.wins / team.standings.played;

                return team;
            });


            if (this.useOMW) {
                teams.map(team => {
                    team.standings.opponentWinrates = [];

                    this.stageMatches.forEach(match => {
                        if (!(match.teams || []).some(t => t.code === team.code)) return;
                        const scores = [match.score_1, match.score_2];
                        if (!scores.some(score => score === match.first_to)) return; // not finished
                        const opponent = match.teams.find(t => t.code !== team.code);
                        if (!opponent) return null;
                        const localOpponent = teams.find(t => t.code === opponent.code);
                        const opponentWinrate = localOpponent.standings.winrate;
                        team.standings.opponentWinrates.push(opponentWinrate);
                    });

                    // console.log(team.standings.opponentWinrates, avg(team.standings.opponentWinrates));
                    team.standings.omw = avg(team.standings.opponentWinrates);
                    return team;
                });
            }

            const sortFunction = (a, b) => {
                if (a.standings.points > b.standings.points) return -1;
                if (a.standings.points < b.standings.points) return 1;

                if (a.standings.wins > b.standings.wins) return -1;
                if (a.standings.wins < b.standings.wins) return 1;

                if (a.standings.losses > b.standings.losses) return 1;
                if (a.standings.losses < b.standings.losses) return -1;

                if (a.standings.map_diff > b.standings.map_diff) return -1;
                if (a.standings.map_diff < b.standings.map_diff) return 1;


                if (a.standings.map_wins > b.standings.map_wins) return -1;
                if (a.standings.map_wins < b.standings.map_wins) return 1;

                if (a.standings.map_losses > b.standings.map_losses) return 1;
                if (a.standings.map_losses < b.standings.map_losses) return -1;
            };

            teams = teams.sort(sortFunction);

            // console.log("[standings teams]", teams);
            const standings = sortTeamsIntoStandings(teams.map(t => ({ ...t, ...t.standings })), {
                useOMW: this.useOMW,
                sort: this.standingsSort
            });
            // console.log("[new standings]", standings);

            let rank = 1; let display = 1;
            standings.forEach(group => {
                group.forEach((team, i) => {
                    team.standings.rank = display;
                    team.standings.tie_show_number = i === 0;
                    rank++;
                });
                display = rank;
            });

            return standings;


            // let standingRank = 1;
            // teams.forEach((team, i) => {
            //     if (i === 0) {
            //         team.standings.rank = standingRank;
            //         return;
            //     }
            //     if (sortFunction(team, teams[i - 1]) !== 0) {
            //         team.standings.rank = i + 1;
            //     } else {
            //         team.standings.rank = standingRank;
            //     }
            //     standingRank = team.standings.rank;
            // });
            //
            //
            // return teams;
        }
    }
};
</script>

<style scoped>
    .standings {
        font-size: 46px;
        width: 100%;
    }

    .team-stat {
        width: 5.3333em;
        font-size: .75em;
    }

    .standings-header, .top-standings-name {
        font-weight: bold;
        text-transform: uppercase;
    }
    .team-name {
        margin-left: 2em;
    }
</style>

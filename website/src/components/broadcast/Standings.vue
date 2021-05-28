<template>
    <div class="standings">
<!--        <div>{{ event.name }} / {{ stage }} / {{ allMatches.length }} -> {{ stageMatches.length }} ({{ teams.length }} teams)</div>-->
        <div class="standings-header d-flex align-items-center">
            <div class="team-name flex-grow-1 text-left">Team</div>
            <div class="team-stats d-flex">
                <div class="team-stat text-center">Matches</div>
                <div class="team-stat text-center">Maps</div>
<!--                <div class="team-stat text-center">Points</div>-->
            </div>
        </div>
        <div class="teams">
            <div class="team" v-for="team in teams" v-bind:key="team.id">
                <StandingsTeam :team="team" />
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import StandingsTeam from "@/components/broadcast/StandingsTeam";

export default {
    name: "Standings",
    props: ["event", "stage"],
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
            return this.allMatches.filter(match => match.match_group === this.stage);
        },
        settings() {
            if (!this.event || !this.event.blocks) return null;
            try {
                const blocks = JSON.parse(this.event.blocks);
                return blocks.settings || null;
            } catch (e) {
                return null;
            }
        },
        teams() {
            if (!this.stageMatches || !this.event) return [];
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

            console.log(this.settings);

            teams.map(team => {
                team.standings = {
                    wins: 0,
                    losses: 0,
                    played: 0,

                    map_wins: 0,
                    map_losses: 0,
                    maps_played: 0,
                    rank: null
                };
                if (this.settings && this.settings.points) team.standings.points = team.extra_points || 0;
                // get matches here
                this.stageMatches.forEach(match => {
                    if (!match.teams) return;
                    if (!match.teams.some(t => t.id === team.id)) return;
                    // one of the teams is current loop team
                    const scores = [match.score_1, match.score_2];
                    if (!scores.some(score => score === match.first_to)) return; // not finished

                    team.standings.played++;
                    if (match.maps) {

                    } else {
                        team.standings.maps_played += match.score_1 + match.score_2;
                    }

                    const teamIndex = match.teams[0].id === team.id ? 0 : 1;
                    team.standings.map_wins += scores[teamIndex];
                    team.standings.map_losses += scores[+!teamIndex];

                    if (this.settings && this.settings.points) team.standings.points += (this.settings.points.map_wins * team.standings.map_wins);
                    if (this.settings && this.settings.points) team.standings.points += (this.settings.points.map_losses * team.standings.map_losses);

                    const winIndex = match.score_1 === match.first_to ? 0 : 1;
                    const winner = match.teams[winIndex];

                    if (winner.id === team.id) {
                        team.standings.wins++;
                        if (this.settings && this.settings.points) team.standings.points += this.settings.points.wins;
                    } else {
                        team.standings.losses++;
                        if (this.settings && this.settings.points) team.standings.points += this.settings.points.losses;
                    }
                });

                return team;
            });

            const sortFunction = (a, b) => {
                if (a.standings.points > b.standings.points) return -1;
                if (a.standings.points < b.standings.points) return 1;

                if (a.standings.wins > b.standings.wins) return -1;
                if (a.standings.wins < b.standings.wins) return 1;

                if (a.standings.losses > b.standings.losses) return 1;
                if (a.standings.losses < b.standings.losses) return -1;

                if (a.standings.map_wins > b.standings.map_wins) return -1;
                if (a.standings.map_wins < b.standings.map_wins) return 1;

                if (a.standings.map_losses > b.standings.map_losses) return 1;
                if (a.standings.map_losses < b.standings.map_losses) return -1;
            };

            teams = teams.sort(sortFunction);

            let standingRank = 1;
            teams.forEach((team, i) => {
                if (i === 0) {
                    team.standings.rank = standingRank;
                    return;
                }
                if (sortFunction(team, teams[i - 1]) !== 0) {
                    team.standings.rank = i + 1;
                } else {
                    team.standings.rank = standingRank;
                }
                standingRank = team.standings.rank;
            });


            return teams;
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

    .standings-header {
        font-weight: bold;
        text-transform: uppercase;
    }
    .team-name {
        margin-left: 2em;
    }
</style>

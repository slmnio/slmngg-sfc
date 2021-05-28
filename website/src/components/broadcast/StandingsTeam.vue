<template>
    <div class="standings-team d-flex">
        <div class="team-rank">{{ teamStats["rank"] }}</div>
        <ThemeLogo class="team-logo" :theme="team.theme" icon-padding="6" border-width="6" />
        <div class="team-name flex-grow-1 text-left">{{ team.name }}</div>
        <div class="team-stats d-flex">
            <div class="team-stat text-center" v-for="stat in stats" v-bind:key="stat">
                {{ teamStats[stat] }}
            </div>
        </div>
    </div>
</template>

<script>
import ThemeLogo from "@/components/website/ThemeLogo";
export default {
    name: "StandingsTeam",
    components: { ThemeLogo },
    props: ["team"],
    data: () => ({
        stats: ["map_diff", "diff"/*, "points" */]
    }),
    computed: {
        teamStats() {
            return {
                diff: `${this.team.standings.wins}-${this.team.standings.losses}`,
                map_diff: `${this.team.standings.map_wins}-${this.team.standings.map_losses}`,
                // points: this.team.standings.points,
                rank: this.team.standings.rank
            };
        }
    }
};
</script>

<style scoped>
    .team-stat {
        width: 4em;
    }
    .standings-team {
        align-items: center;
    }
    .team-logo {
        width: 1.25em;
        height: 1.1em;
        border-width: 2px;
        margin-right: .33em;
    }
    .team-logo>.icon {
        width: calc(100% - 4px);
        height: calc(100% - 4px);
    }
    .team-rank {
        width: 2em;
        text-align: center;
    }
</style>

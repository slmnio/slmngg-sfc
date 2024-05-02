<template>
    <td class="team-map-stats" :class="{'has-played': stats.played > 0}">
        <div class="d-flex flex-grow-1 w-100">
            <!--        <div class="stat team">{{ team.code }}</div>-->
            <ThemeLogo logo-size="w-50" class="team-icon" :theme="team.theme" border-width="4" icon-padding="4" />
            <div class="stat scoreline">{{ scoreline }}</div>
            <div class="stat unplayed" v-if="showUnplayedMaps && stats.unplayed">Unplayed: {{ stats.unplayed }}</div>
            <div class="stat recent" v-if="stats.played_recently"><i class="far fa-clock fa-fw" v-b-tooltip.top="'Played in their last match'"></i></div>
            <!--        <div class="stat played">{{ stats.played }}</div>-->
        </div>
    </td>
</template>

<script>
import ThemeLogo from "@/components/website/ThemeLogo";
export default {
    name: "TeamMapStats",
    components: { ThemeLogo },
    props: ["data", "showUnplayedMaps"],
    computed: {
        stats() {
            return this.data.stats;
        },
        team() {
            return this.data.team;
        },
        scoreline() {
            return `${this.stats.wins} - ${this.stats.losses}${this.stats.draws ? ` - ${this.stats.draws}` : ""}`;
        }
    }
};
</script>

<style scoped>
    .team-icon {
        width: 2em;
        height: 2em;
    }
    .team-map-stats:not(.has-played) {
        opacity: 0.33;
    }
    .stat {
        margin: 0 0.5em;
    }
    .scoreline {
        min-width: 2.5em;
        text-align: center;
    }
    .recent {
        margin: 0 0.2em;
    }
    .stat.unplayed {
        min-width: 6em;
        text-align: center;
    }
</style>

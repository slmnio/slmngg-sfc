<template>
    <div class="map-stats-bar">
        <div v-for="(win, i) in wins" :key="teams[i].id" class="bar-segment" :style="{ width: `${(win / total) * 100}%`, ...themeBackground(teams[i].theme) }"></div>
    </div>
</template>

<script>
import { themeBackground } from "@/utils/theme-styles";

export default {
    name: "MapStatsBar",
    props: ["stats"],
    computed: {
        wins() {
            return this.stats.map(({ stats, team }) => stats.wins);
        },
        teams() {
            return this.stats.map(({ stats, team }) => team);
        },
        total() {
            return this.wins.reduce((c, v) => c + v, 0);
        }
    },
    methods: {
        themeBackground
    }
};
</script>

<style scoped>
    .map-stats-bar {
        display: flex;
        background-color: #555;
    }
    .bar-segment {
        height: 100%;
    }
</style>

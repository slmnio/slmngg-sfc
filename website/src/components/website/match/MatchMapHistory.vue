<template>
    <tr class="match-map-history" :class="{ 'scheduled': isScheduled }">
        <td class="map-name" style="width: 200px">
            {{ map.name }}
            <i v-if="isScheduled" v-b-tooltip.top="'Scheduled for this match'" class="fa fa-fw fa-check"></i>
        </td>
        <TeamMapStats
            v-for="(data, ti) in data.stats"
            :key="ti"
            class="map-team-stats"
            :show-unplayed-maps="showUnplayedMaps"
            :data="data" />
    </tr>
</template>

<script>
import TeamMapStats from "@/components/website/match/TeamMapStats";

export default {
    name: "MatchMapHistory",
    components: { TeamMapStats },
    props: ["data", "map", "showUnplayedMaps"],
    computed: {
        isScheduled() {
            return this.data?.meta?.scheduledForMatch;
        }
    }
};
</script>

<style scoped>
    .team-map-stats:last-of-type:deep(div)  {
        flex-direction: row-reverse;
    }
    .match-map-history.scheduled .map-name {
        font-weight: bold;
        text-shadow: 0 0 4px rgba(255,255,255,0.34);
    }
</style>

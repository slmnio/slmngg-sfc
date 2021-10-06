<template>
    <tr class="match-map-history">
        <td style="width: 200px">{{ map.name }}</td>
        <TeamMapStats class="map-team-stats" v-for="(data, ti) in data.stats"
                      v-bind:key="ti" :data="data"/>
    </tr>
</template>

<script>
import TeamMapStats from "@/components/website/TeamMapStats";

export default {
    name: "MatchMapHistory",
    components: { TeamMapStats },
    props: ["data", "map"]
};
</script>

<style scoped>
    .team-map-stats:last-of-type >>> div {
        flex-direction: row-reverse;
    }
</style>

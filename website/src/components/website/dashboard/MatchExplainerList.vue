<template>
    <div class="edit-list-container">
        <div v-if="editedMatchData?.score_1 || editedMatchData?.score_2">
            <div><b>Match score:</b> {{ teams[0]?.name }} <b>{{ editedMatchData?.score_1 || 0 }}-{{ editedMatchData?.score_2 || 0 }}</b> {{ teams[1]?.name }}</div>
            <div><b>Match winner:</b> {{ teams[(editedMatchData?.score_1 || 0) > (editedMatchData?.score_2 || 0) ? 0 : 1]?.name }}</div>
            <div><b>Match loser:</b> {{ teams[(editedMatchData?.score_1 || 0) > (editedMatchData?.score_2 || 0) ? 1 : 0]?.name }}</div>
        </div>
        <div v-if="editedMatchData?.forfeit">
            <b>Match forfeit</b> {{ editedMatchData?.forfeit_reason || '' }}
        </div>

        <ol class="edit-list mb-0">
            <li v-for="(map, i) in hydratedData" :key="i">
                <div>{{ map?.map?.name }}</div>
                <div v-if="map.score_1 > map.score_2">
                    Score: {{ teams[0]?.name }} <b>{{ map.score_1 }}-{{
                        map.score_2
                    }}</b> {{ teams[1]?.name }}
                </div>
                <div v-else>
                    Score: {{ teams[1]?.name }} <b>{{ map.score_2 }}-{{ map.score_1 }}</b> {{ teams[0]?.name }}
                </div>
                <div>
                    <div v-if="map.winner?.name">Winner: <b>{{ map.winner.name }}</b></div>
                    <div v-if="map.picker?.name">Picked by: <b>{{ map.picker.name }}</b></div>
                    <div v-if="map.banner?.name">Banned by: <b>{{ map.banner.name }}</b></div>
                    <div v-if="map.draw">Draw</div>
                </div>
            </li>
        </ol>
    </div>
</template>

<script>
import { ReactiveRoot } from "@/utils/reactive.js";

export default {
    name: "MatchExplainerList",
    props: ["editedMapData", "match", "editedMatchData"],
    computed: {
        teams() {
            return this.match.teams;
        },
        hydratedData() {
            return (this.editedMapData || []).map(mapData => {
                console.log(Object.values(mapData).filter(Boolean), mapData);
                return ({
                    ...mapData,
                    map: ReactiveRoot(mapData.map),
                    existingID: ReactiveRoot(mapData.existingID),
                    winner: ReactiveRoot(mapData.winner),
                    picker: ReactiveRoot(mapData.picker),
                    banner: ReactiveRoot(mapData.banner),
                });
            });
        },
    },
};
</script>

<style scoped>
    ol.edit-list {
        padding-left: 1em;
    }
</style>

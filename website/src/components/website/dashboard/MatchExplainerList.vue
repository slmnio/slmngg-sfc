<template>
    <div class="edit-list-container">
        <div v-if="editedMatchData?.score_1 || editedMatchData?.score_2" class="mb-2">
            <div><b>Match score:</b> {{ teams[0]?.name }} <b>{{ editedMatchData?.score_1 || 0 }}-{{ editedMatchData?.score_2 || 0 }}</b> {{ teams[1]?.name }}</div>
            <div><b>Match winner:</b> {{ teams[(editedMatchData?.score_1 || 0) > (editedMatchData?.score_2 || 0) ? 0 : 1]?.name }}</div>
            <div><b>Match loser:</b> {{ teams[(editedMatchData?.score_1 || 0) > (editedMatchData?.score_2 || 0) ? 1 : 0]?.name }}</div>
        </div>
        <div v-if="editedMatchData?.forfeit" class="mb-2">
            <b>Match forfeit</b> {{ editedMatchData?.forfeit_reason || '' }}
        </div>

        <ol class="edit-list mb-0">
            <li v-for="(map, i) in hydratedData" :key="i" class="mb-3">
                <div v-if="map?.map?.name" class="fw-bold" :class="{'text-danger': map.banner?.id}">{{ map?.map?.name }}</div>
                <div v-if="map.score_1 > map.score_2">
                    Score: {{ teams[0]?.name }} <b>{{ map.score_1 }}-{{
                        map.score_2
                    }}</b> {{ teams[1]?.name }}
                </div>
                <div v-else-if="map.score_1 || map.score_2">
                    Score: {{ teams[1]?.name }} <b>{{ map.score_2 }}-{{ map.score_1 }}</b> {{ teams[0]?.name }}
                </div>
                <div>
                    <div v-if="map.winner?.name">Winner: <b>{{ map.winner.name }}</b></div>
                    <div v-if="map.picker?.name">Picked by: <b>{{ map.picker.name }}</b></div>
                    <div v-if="map.banner?.name">Banned by: <b>{{ map.banner.name }}</b></div>
                    <div v-if="map.draw">Draw</div>
                    <div v-if="map.replay_code">Replay code: <b>{{ map.replay_code }}</b></div>
                </div>
                <div v-if="map?.team_1_picks?.length || map?.team_2_picks?.length || map?.team_1_bans?.length || map?.team_2_bans?.length" class="mt-1">
                    <div v-if="(map.team_1_picks || [])?.length || (map.team_2_picks || [])?.length" class="mt-1 p-1 rounded" style="border: 1px solid var(--primary);">
                        <div><b>Hero picks</b></div>
                        <div v-if="map?.team_1_picks?.length">
                            <span>By {{ teams[0]?.name }}:</span>
                            <span class="fw-bold ml-1">{{ map.team_1_picks.map(h => h.name).join(", ") }}</span>
                        </div>
                        <div v-if="map?.team_2_picks?.length">
                            <span>By {{ teams[1]?.name }}:</span>
                            <span class="fw-bold ml-1">{{ map.team_2_picks.map(h => h.name).join(", ") }}</span>
                        </div>
                    </div>
                    <div v-if="(map.team_1_bans || [])?.length || (map.team_2_bans || [])?.length" class="mt-1 p-1 rounded" style="border: 1px solid var(--danger);">
                        <div><b>Hero bans</b></div>
                        <div v-if="map?.team_1_bans?.length">
                            <span>By {{ teams[0]?.name }}:</span>
                            <span class="fw-bold ml-1">{{ map.team_1_bans.map(h => h.name).join(", ") }}</span>
                        </div>
                        <div v-if="map?.team_2_bans?.length">
                            <span>By {{ teams[1]?.name }}:</span>
                            <span class="fw-bold ml-1">{{ map.team_2_bans.map(h => h.name).join(", ") }}</span>
                        </div>
                    </div>
                </div>
            </li>
        </ol>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot } from "@/utils/reactive.js";

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
                    team_1_picks: ReactiveArray("team_1_picks")(mapData),
                    team_2_picks: ReactiveArray("team_2_picks")(mapData),
                    team_1_bans: ReactiveArray("team_1_bans")(mapData),
                    team_2_bans: ReactiveArray("team_2_bans")(mapData),
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
    .ban-style {
        background-color: color-mix(in srgb,  var(--danger) 20%, transparent)
    }

    .pick-style {
        background-color: color-mix(in srgb,  var(--primary) 20%, transparent)
    }
</style>

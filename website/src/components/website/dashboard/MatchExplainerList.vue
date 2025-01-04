<template>
    <div class="edit-list-container" :class="{'comparison-alt': comparisonMode === 'alt'}">
        <div v-if="editedMatchData?.score_1 || editedMatchData?.score_2" class="mb-2">
            <div>
                <b class="space-after">Match score:</b>
                <span class="space-after">{{ teams[0]?.code || teams[0]?.name }}</span>
                <b
                    class="space-after"
                    :class="{
                        'difference': comparisonData && (
                            editedMatchData?.score_1 !== comparisonData?.matchData?.score_1 ||
                            editedMatchData?.score_2 !== comparisonData?.matchData?.score_2
                        )
                    }">
                    <span>{{ editedMatchData?.score_1 || 0 }}</span>
                    <span>-</span>
                    <span>{{ editedMatchData?.score_2 || 0 }}</span>
                </b>
                <span class="space-after">{{ teams[1]?.code || teams[1]?.name }}</span>
            </div>
            <div
                :class="{
                    'difference': comparisonData && ((editedMatchData?.score_1 || 0) > (editedMatchData?.score_2 || 0)) && ((comparisonData?.matchData?.score_1 || 0) <= (comparisonData?.matchData?.score_2 || 0))
                }">
                <div><b>Match winner:</b> {{ teams[(editedMatchData?.score_1 || 0) > (editedMatchData?.score_2 || 0) ? 0 : 1]?.name }}</div>
                <div><b>Match loser:</b> {{ teams[(editedMatchData?.score_1 || 0) > (editedMatchData?.score_2 || 0) ? 1 : 0]?.name }}</div>
            </div>
        </div>
        <div v-if="editedMatchData?.forfeit" class="mb-2 text-danger">
            <b>Match forfeit</b> {{ editedMatchData?.forfeit_reason || '' }}
        </div>

        <ol v-if="hydratedData?.length" class="edit-list">
            <li v-for="(map, i) in hydratedData" :key="i" class="edit-item">
                <div
                    v-if="map?.map?.name"
                    class="fw-bold"
                    :class="{
                        'text-danger': map.banner?.id,
                        'difference': hydratedComparisonData && map?.map?.name !== hydratedComparisonData?.[i]?.map?.name
                    }">
                    {{ map?.map?.name }}
                </div>
                <div v-if="map.score_1 > map.score_2">
                    <span class="space-after">Score: {{ teams[0]?.name }}</span>
                    <b
                        class="space-after"
                        :class="{
                            'difference': hydratedComparisonData && (
                                map?.score_1 !== hydratedComparisonData?.[i]?.score_1 ||
                                map?.score_2 !== hydratedComparisonData?.[i]?.score_2
                            )
                        }">
                        <span>{{ map.score_1 }}</span>
                        <span>-</span>
                        <span>{{ map.score_2 }}</span>
                    </b>
                    <span>{{ teams[1]?.name }}</span>
                </div>
                <div v-else-if="map.score_1 || map.score_2">
                    <span class="space-after">Score: {{ teams[1]?.name }}</span>
                    <b
                        class="space-after"
                        :class="{
                            'difference': hydratedComparisonData && (
                                map?.score_1 !== hydratedComparisonData?.[i]?.score_1 ||
                                map?.score_2 !== hydratedComparisonData?.[i]?.score_2
                            )
                        }">
                        <span>{{ map.score_2 }}</span>
                        <span>-</span>
                        <span>{{ map.score_1 }}</span>
                    </b>
                    <span>{{ teams[0]?.name }}</span>
                </div>
                <div>
                    <div
                        v-if="map.winner?.name">
                        <span class="space-after">Winner:</span>
                        <b
                            :class="{
                                'difference': hydratedComparisonData && map?.winner?.id !== hydratedComparisonData?.[i]?.winner?.id
                            }">{{ map.winner.name }}</b>
                    </div>
                    <div
                        v-if="map.picker?.name">
                        <span class="space-after">Picked by:</span>
                        <b
                            :class="{
                                'difference': hydratedComparisonData && map?.picker?.id !== hydratedComparisonData?.[i]?.picker?.id
                            }">{{ map.picker.name }}</b>
                    </div>
                    <div
                        v-if="map.banner?.name">
                        <span class="space-after">Banned by:</span>
                        <b
                            :class="{
                                'difference': hydratedComparisonData && map?.banner?.id !== hydratedComparisonData?.[i]?.banner?.id
                            }">{{ map.banner.name }}</b>
                    </div>
                    <div
                        v-if="map.draw"
                        :class="{ 'difference': hydratedComparisonData && map?.draw !== hydratedComparisonData?.[i]?.draw }">
                        Draw
                    </div>
                    <div
                        v-if="map.replay_code"
                        :class="{ 'difference': hydratedComparisonData && map?.replay_code !== hydratedComparisonData?.[i]?.replay_code }">
                        Replay code: <b>{{ map.replay_code }}</b>
                    </div>
                </div>
                <div v-if="map?.team_1_picks?.length || map?.team_2_picks?.length || map?.team_1_bans?.length || map?.team_2_bans?.length" class="mt-1">
                    <div v-if="(map.team_1_picks || [])?.length || (map.team_2_picks || [])?.length" class="mt-1 p-1 rounded" style="border: 1px solid var(--primary);">
                        <div><b>Hero picks</b></div>
                        <div v-if="map?.team_1_picks?.length">
                            <span>By {{ teams[0]?.name }}:</span>
                            <span
                                class="fw-bold ml-1"
                                :class="{
                                    'difference': hydratedComparisonData &&
                                        (map?.team_1_picks || [])?.map(h => h.name).join(',') !== (hydratedComparisonData?.[i]?.team_1_picks || [])?.map(h => h.name).join(',')
                                }">{{ map.team_1_picks.map(h => h.name).join(", ") }}</span>
                        </div>
                        <div v-if="map?.team_2_picks?.length">
                            <span>By {{ teams[1]?.name }}:</span>
                            <span
                                class="fw-bold ml-1"
                                :class="{
                                    'difference': hydratedComparisonData &&
                                        (map?.team_2_picks || [])?.map(h => h.name).join(',') !== (hydratedComparisonData?.[i]?.team_2_picks || [])?.map(h => h.name).join(',')
                                }">{{ map.team_2_picks.map(h => h.name).join(", ") }}</span>
                        </div>
                    </div>
                    <div v-if="(map.team_1_bans || [])?.length || (map.team_2_bans || [])?.length" class="mt-1 p-1 rounded" style="border: 1px solid var(--danger);">
                        <div><b>Hero bans</b></div>
                        <div v-if="map?.team_1_bans?.length">
                            <span>By {{ teams[0]?.name }}:</span>
                            <span
                                class="fw-bold ml-1"
                                :class="{
                                    'difference': hydratedComparisonData &&
                                        (map?.team_1_bans || [])?.map(h => h.name).join(',') !== (hydratedComparisonData?.[i]?.team_1_bans || [])?.map(h => h.name).join(',')
                                }">{{ map.team_1_bans.map(h => h.name).join(", ") }}</span>
                        </div>
                        <div v-if="map?.team_2_bans?.length">
                            <span>By {{ teams[1]?.name }}:</span>
                            <span
                                class="fw-bold ml-1"
                                :class="{
                                    'difference': hydratedComparisonData &&
                                        (map?.team_2_bans || [])?.map(h => h.name).join(',') !== (hydratedComparisonData?.[i]?.team_2_bans || [])?.map(h => h.name).join(',')
                                }">{{ map.team_2_bans.map(h => h.name).join(", ") }}</span>
                        </div>
                    </div>
                </div>
            </li>
        </ol>
        <div v-if="hydratedComparisonData" class="text-muted mt-4">
            <span class="x">Highlighted</span> sections show differences to the original report.
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot } from "@/utils/reactive.js";

export default {
    name: "MatchExplainerList",
    props: ["editedMapData", "match", "editedMatchData", "comparisonData", "comparisonMode"],
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
        hydratedComparisonData() {
            if (!this.comparisonData) return null;
            return (this.comparisonData?.mapData || []).map(mapData => {
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
        border-top: 1px solid rgba(0,0,0,0.25);
        padding-top: .5em;
        margin-top: .75em;
        margin-bottom: .5em;
    }
    .edit-item:not(:last-child) {
        margin-bottom: .75em;
    }
    .ban-style {
        background-color: color-mix(in srgb,  var(--danger) 20%, transparent)
    }

    .pick-style {
        background-color: color-mix(in srgb,  var(--primary) 20%, transparent)
    }

    .difference {
        outline: 2px solid var(--warning);
        background-color: color-mix(in srgb,  var(--warning) 20%, transparent);
        outline-offset: 2px;
        border-radius: .25em;
    }

    /*.comparison-alt .difference {*/
    /*    outline: 2px solid var(--primary)*/
    /*}*/

    .space-after {
        margin-right: .5ex;
    }
</style>

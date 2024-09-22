<template>
    <BModal
        :model-value="modelValue"
        title="Reporting Score"
        ok-variant="success"
        :ok-title="successMethod"
        @ok="$emit('ok')"
        @update:model-value="(val) => $emit('update:modelValue', val)">
        <div class="match-explainer-modal">
            <b>Ready to submit?</b>
            <br>
            <p>This is the data that you're submitting:</p>
            <ol class="edit-list">
                <li v-for="(map, i) in hydratedData" :key="i">
                    <div>{{ map?.map?.name }}</div>
                    <div v-if="map.score_1 > map.score_2">Score: {{ teams[0]?.name }} <b>{{ map.score_1 }}-{{ map.score_2 }}</b> {{ teams[1]?.name }}</div>
                    <div v-else>Score: {{ teams[1]?.name }} <b>{{ map.score_2 }}-{{ map.score_1 }}</b> {{ teams[0]?.name }}</div>
                    <div>
                        <div v-if="map.winner?.name">Winner: <b>{{ map.winner.name }}</b></div>
                        <div v-if="map.picked?.name">Picked by: <b>{{ map.picked.name }}</b></div>
                        <div v-if="map.banner?.name">Banned by: <b>{{ map.banner.name }}</b></div>
                        <div v-if="map.draw">Draw</div>
                    </div>
                </li>
            </ol>
        </div>
    </BModal>
</template>

<script>
import { ReactiveRoot } from "@/utils/reactive";

export default {
    name: "MatchExplainerModal",
    props: ["editedMapData", "match", "modelValue"],
    emits: ["update:modelValue", "ok"],
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
        eventSettings() {
            if (!this.match?.event?.blocks) return null;
            return JSON.parse(this.match.event.blocks);
        },
        successMethod() {
            if (this.eventSettings?.reporting?.score?.opponentApprove || this.eventSettings?.reporting?.score?.staffApprove) {
                return "Submit for approval";
            } else {
                return "Submit match data";
            }
        }
    },
};
</script>

<style scoped>
    .edit-list li {
        margin-bottom: .75em
    }
</style>

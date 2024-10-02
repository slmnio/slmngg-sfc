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
            <MatchExplainerList :edited-map-data="editedMapData" :edited-match-data="editedMatchData" :match="match" />
        </div>
    </BModal>
</template>

<script>
import MatchExplainerList from "@/components/website/dashboard/MatchExplainerList.vue";

export default {
    name: "MatchExplainerModal",
    components: { MatchExplainerList },
    props: ["editedMapData", "match", "modelValue", "editedMatchData"],
    emits: ["update:modelValue", "ok"],
    computed: {
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

<template>
    <div class="map-score-editor d-flex" :class="{'flex-row-reverse': reverse}">
        <div v-if="showCodes" class="team-slice team-slice-codes flex-center" :style="teamSliceBackground">
            {{ team.code }}
        </div>
        <div v-else class="team-slice" :style="teamSliceBackground"></div>
        <b-form-input
            class="score-input no-arrows"
            autocomplete="off"
            :model-value="modelValue"
            type="number"
            min="0"
            step="1"
            @update:model-value="(n) => this.$emit('update:modelValue', parseInt(n))" />
    </div>
</template>

<script>
import { themeBackground1 } from "@/utils/theme-styles";

export default {
    name: "MapScoreEditor",
    props: ["team", "modelValue", "reverse", "showCodes"],
    emits: ["update:modelValue"],
    computed: {
        teamSliceBackground() {
            return themeBackground1(this.team);
        }
    }
};
</script>

<style scoped>
    .team-slice {
        width: .5em;
        height: 100%;
        border-radius: .125em;
        margin: 0 .125em;
    }
    .team-slice-codes {
        width: 3em;
        flex-shrink: 0;
        border-radius: .25em;
    }
    .score-input {
        min-width: 3em;
        text-align: center;
    }
</style>

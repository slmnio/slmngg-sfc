<template>
    <div class="map-score-editor d-flex" :class="{'flex-row-reverse': reverse}">
        <div class="team-slice" :style="teamSliceBackground"></div>
        <b-form-input
            class="score-input no-arrows"
            autocomplete="off"
            :value="score"
            type="number"
            min="0"
            step="1"
            @input="(n) => this.$emit('input', parseInt(n))" />
    </div>
</template>

<script>
import { themeBackground1 } from "@/utils/theme-styles";

export default {
    name: "MapScoreEditor",
    model: {
        prop: "score",
        event: "input"
    },
    props: ["team", "score", "reverse"],
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
    .score-input {
        min-width: 3em;
        text-align: center;
    }
</style>

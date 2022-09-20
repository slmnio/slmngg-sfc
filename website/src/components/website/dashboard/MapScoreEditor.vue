<template>
    <div class="map-score-editor d-flex" :class="{'flex-row-reverse': reverse}">
        <div class="team-slice" :style="teamSliceBackground"></div>
        <b-form-input class="score-input no-arrows" :value="score" @input="(n) => this.$emit('input', parseInt(n))" type="number"></b-form-input>
    </div>
</template>

<script>
import { BFormInput } from "bootstrap-vue";
import { themeBackground1 } from "@/utils/theme-styles";

export default {
    name: "MapScoreEditor",
    components: { BFormInput },
    props: ["team", "score", "reverse"],
    model: {
        prop: "score",
        event: "input"
    },
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

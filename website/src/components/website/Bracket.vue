<template>
    <div class="bracket row" :style="winVars">
        <div class="internal-bracket d-flex" v-for="(bracket, i) in brackets" v-bind:key="i">
            <div class="column" v-for="(column, ci) in bracket.columns" v-bind:key="ci">
                <div class="header text-center mb-2" :style="logoBackground1(event)" v-if="showHeaders && column.header">{{ column.header }}</div>
                <div class="column-matches flex-grow-1">
                    <BracketMatch v-for="matchNum in column.games" :match="getMatch(matchNum)" v-bind:key="matchNum"/>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import BracketMatch from "@/components/website/BracketMatch";
import { logoBackground1, themeBackground1 } from "@/utils/theme-styles";

export default {
    name: "Bracket",
    components: { BracketMatch },
    props: ["bracket", "event", "fontSize"],
    computed: {
        matches() {
            if (!this.bracket || !this.bracket.ordered_matches) return null;
            return this.bracket.ordered_matches;
        },
        layout() {
            if (!this.bracket || !this.bracket.bracket_layout) return null;
            return JSON.parse(this.bracket.bracket_layout);
        },
        brackets() {
            if (!this.layout || !this.layout.brackets) return null;
            return this.layout.brackets;
        },
        showHeaders() {
            return true;
        },
        winVars() {
            const css = themeBackground1(this.event);

            let fontSize = 16;
            if (this.fontSize && this.fontSize > 10) fontSize = this.fontSize;

            return {
                "--win-background-color": css.backgroundColor,
                "--win-color": css.color,
                "font-size": `${fontSize}px`
            };
        }
    },
    methods: {
        getMatch(num) {
            if (num === null) return null;
            if (!this.matches) return null;
            return this.matches[num - 1]; // stored as a 1-based number
        },
        logoBackground1
    }
};
</script>

<style scoped>
    .column {
        width: 12.5em;
        margin: 0 1em;
        display: flex;
        flex-direction: column;
    }
    .column-matches {
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .internal-bracket + .internal-bracket {
        margin-top: 1.5em;
    }


</style>

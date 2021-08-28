<template>
    <div class="bracket row" :style="winVars" v-bind:class="{ 'small': small || (useOverlayScale && fontSize < 15) }">
        <div class="internal-bracket d-flex" v-for="(bracket, i) in brackets" v-bind:key="i">
            <div class="column" v-for="(column, ci) in bracket.columns" v-bind:key="ci">
                <div class="header text-center mb-3" :style="logoBackground1(event)" v-if="showHeaders && column.header">{{ column.header }}</div>
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
    props: {
        bracket: {},
        event: {},
        useOverlayScale: Boolean,
        small: Boolean,
        scale: Number
    },
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
        connections() {
            if (!this.layout || !this.layout.connections) return null;
            return this.layout.connections;
        },
        showHeaders() {
            return !this.small;
        },
        fontSize() {
            let fontSize = 16;
            if (this.useOverlayScale && this.bracket && this.bracket.overlay_scale > 10) fontSize = this.bracket.overlay_scale;
            if (this.scale) fontSize *= this.scale;
            return fontSize;
        },
        winVars() {
            const css = themeBackground1(this.event);

            return {
                "--win-background-color": css.backgroundColor,
                "--win-color": css.color,
                "font-size": `${this.fontSize}px`
            };
        }
    },
    methods: {
        getConnectionMatch(num) {
            num = parseFloat(num);
            if (num / 10 !== 0) {
                // num = 2.1 2.2
                return {
                    ...this.matches[Math.floor(num) - 1],
                    side: parseInt(num.toString().split(".")[1])
                };
            } else {
                // num = 2
                return this.matches[num - 1];
            }
        },
        getBracketData(num) {
            if (!this.connections) return {};
            const connections = this.connections[num];
            if (!connections) return {};
            console.log("connections", connections);
            const cons = {
                winner: this.getConnectionMatch(connections.win),
                loser: this.getConnectionMatch(connections.lose)
            };
            const feederMatches = [];
            Object.entries(this.connections).forEach(([_n, connection]) => {
                if (connection.win && Math.floor(connection.win) === parseInt(num)) {
                    feederMatches.push({ ...this.getConnectionMatch(_n), _m: "Winner" });
                }
                if (connection.lose && Math.floor(connection.lose) === parseInt(num)) {
                    feederMatches.push({ ...this.getConnectionMatch(_n), _m: "Loser" });
                }
            });
            console.log("feeder matches", feederMatches);
            if (feederMatches) cons.feederMatches = feederMatches;

            return {
                connections: cons
            };
        },
        getMatch(num) {
            if (num === null) return null;
            if (!this.matches) return null;
            return {
                ...this.matches[num - 1],
                _bracket_data: {
                    num,
                    ...this.getBracketData(num)
                }
            }; // stored as a 1-based number
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


    .bracket.small >>> .inner .short {
        display: initial;
        font-size: 1.75em;
    }
    .bracket.small >>> .inner .text {
        display: none;
    }
    .bracket.small >>> .match-number {
        display: none
    }
</style>

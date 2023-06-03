<template>
    <div class="bracket row flex-column" :style="winVars" :class="{ 'small': small || (useOverlayScale && fontSize < 15) }">
        <div class="connections" ref="connections-holder">
            <div class="connection" v-for="bug in connectionBugs" :key="bug.key" :data-key="bug.key" :class="connectionBugClass(bug)" :style="bug.style"
                :data-column-num="bug.column">
                <div class="c-top" v-if="bug.type === 'normal'"></div><div class="c-middle"></div><div class="c-bottom"></div>
                <div class="c-text" :title="bug.title" v-if="bug.type === 'loser-drops'">{{ bug.text }}</div>
            </div>
        </div>
        <v-style>
            .bracket {
                --bracket-columns: {{ bracketCols || 0 }};
            }
            .bracket .connections {
                --b-width: {{ connectionWidth }}px !important;
            }
        </v-style>
        <div class="internal-bracket d-flex" v-for="(_bracket, i) in brackets" :key="i">
            <div class="column" v-for="(column, ci) in _bracket.columns" :key="ci">
                <div class="header text-center mb-3" :style="logoBackground1(event)" v-if="showHeaders && column.header">{{ column.header }}</div>
                <div class="column-matches flex-grow-1">
                    <BracketMatch v-for="matchNum in column.games" :key="matchNum" :ref="`match-${matchNum}`" :custom-timezone="customTimezone"
                                  :show-times="bracket.show_times" :show-broadcasts="bracket.show_broadcasts" :match="getMatch(matchNum)"/>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import BracketMatch from "@/components/website/bracket/BracketMatch";
import { logoBackground1, themeBackground1 } from "@/utils/theme-styles";
import Store from "@/thing-store";

export default {
    name: "Bracket",
    components: { BracketMatch },
    props: {
        bracket: {},
        event: {},
        useOverlayScale: Boolean,
        small: Boolean,
        scale: Number,
        extended: Boolean,
        broadcastHighlightMatch: {},
        broadcastHighlightTeam: {},
        customTimezone: String
    },
    data: () => ({
        connectionElements: [],
        connectionBugs: []
    }),
    computed: {
        matches() {
            if (!this.bracket || !this.bracket.ordered_matches) return [];
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
        bracketCols() {
            return Math.max(...(this.brackets || []).map(b => b.columns.length));
        },
        showHeaders() {
            return !this.small;
        },
        fontSize() {
            let fontSize = 16;
            if (this.useOverlayScale && this.bracket && this.bracket.overlay_scale > 4) fontSize = this.bracket.overlay_scale;
            if (this.scale) fontSize *= this.scale;
            if (this.extended) fontSize *= 1.5;
            return fontSize;
        },
        connectionWidth() {
            let width = 2;
            if (this.scale) width *= this.scale;
            if (this.extended) width *= 1.5;
            return Math.max(1, Math.floor(width));
        },
        winVars() {
            const css = themeBackground1(this.event);

            return {
                "--win-background-color": css.backgroundColor,
                "--win-color": css.color,
                "font-size": `${this.fontSize}px`
            };
        },
        highlightedTeam() {
            return this.$store.state.highlighted_team || this.broadcastHighlightTeam || null;
        },
        highlightedMatch() {
            return this.getOrderedMatchNum(this.$store.getters.highlightedMatch());
        },
        connectionsToHighlight() {
            // If a team is highlighted: highlight their path
            // If an empty match is highlighted: highlight the connections it touches
            if (this.highlightedTeam) {
                const teamMatches = this.matches.filter(match => {
                    return (match.teams || []).some(t => t.id === this.highlightedTeam);
                }).map(match => this.getOrderedMatchNum(match.id));
                return {
                    focus: "team",
                    matches: teamMatches
                };
            }
            if (this.highlightedMatch) {
                return {
                    focus: "match",
                    matches: [this.highlightedMatch]
                };
            }
            if (this.broadcastHighlightMatch) {
                return {
                    focus: "match",
                    matches: [this.getOrderedMatchNum(this.broadcastHighlightMatch.id)]
                };
            }
            return {};
        }
    },
    methods: {
        getConnectionMatch(num) {
            num = parseFloat(num);
            if (num / 10 !== 0) {
                // num = 2.1 2.2
                return {
                    ...this.matches[Math.floor(num) - 1],
                    side: parseInt(num.toString().split(".").pop())
                };
            } else {
                // num = 2
                return this.matches[num - 1];
            }
        },
        getMatchColumnNum(matchNum) {
            let columnNum = 0;
            (this.brackets || []).forEach(bracket => {
                bracket.columns.forEach((col, colI) => {
                    if ((col.games || []).includes(parseInt(matchNum))) {
                        columnNum = colI + 1;
                    }
                });
            });
            return columnNum;
        },
        connectionBugClass(bug) {
            const classes = [`dir-${bug.direction}`];
            let highlight = null;

            if (this.connectionsToHighlight?.matches) {
                // console.log("bug highlight", bug, this.connectionsToHighlight);
                const bugMatches = bug.key.split("->").map(e => e.split(".").shift());

                // TODO: make sure the connection (11 -> 14.1) is what the team did
                //  (ie upper finals -> lower finals -> grand finals shouldn't highlight upper -> grands connection)

                this.connectionsToHighlight.matches = this.connectionsToHighlight.matches.filter(m => m); // no nulls/0s

                if (this.connectionsToHighlight.focus === "match") {
                    // highlight either end of the connection
                    this.connectionsToHighlight.matches.forEach(matchNum => {
                        if (bugMatches.includes(matchNum.toString())) highlight = true;
                    });
                }
                if (this.connectionsToHighlight.focus === "team") {
                    // highlight if both ends of the connection are part of the team's history
                    if (bugMatches.every(bNum => this.connectionsToHighlight.matches.includes(parseInt(bNum)))) {
                        highlight = true;
                    }
                }

                if (!highlight) highlight = false;
            }
            if (highlight === true) {
                classes.push("bug-highlight");
            } else if (highlight === false) {
                classes.push("bug-lowlight");
            }
            // classes.push(`debug--key-${bug.key}`);
            // console.log(bug.key, classes);
            return classes;
        },
        getOrderedMatchNum(matchID) {
            if (!matchID) return null;
            const idx = this.matches.findIndex(match => match.id === matchID);
            if (idx === -1) return null;
            return idx + 1;
        },
        getBracketData(num) {
            if (!this.connections) return {};
            const connections = this.connections[num];
            if (!connections) return {};
            // console.log("connections", connections);
            const cons = {
                winner: this.getConnectionMatch(connections.win),
                loser: this.getConnectionMatch(connections.lose)
            };
            const feederMatches = {
                1: null,
                2: null
            };
            Object.entries(this.connections).forEach(([_n, connection]) => {
                if (connection.win && Math.floor(connection.win) === parseInt(num)) {
                    feederMatches[connection.win.split(".").pop()] = { ...this.getConnectionMatch(_n), _m: "Winner" };
                }
                if (connection.lose && Math.floor(connection.lose) === parseInt(num)) {
                    feederMatches[connection.lose.split(".").pop()] = { ...this.getConnectionMatch(_n), _m: "Loser" };
                }
            });
            // console.log(`feeder matches n=${num}`, feederMatches);
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
        logoBackground1,
        createConnections() {
            // console.log("creating connections");
            this.connectionElements.forEach(el => el.remove());
            this.connectionBugs = [];

            if (!this.connections) return;

            Object.entries(this.connections).forEach(([matchNum, connectionData]) => {
                const matchRef = this.getMatchRef(matchNum);
                if (!matchRef) return;

                if (connectionData.win) {
                    const [otherMatchNum, destNum] = connectionData.win.toString().split(".");
                    this.createConnectionBetweenRefs(matchRef, this.getMatchRef(otherMatchNum), matchNum, otherMatchNum, parseInt(destNum || "0"));
                }
                if (connectionData.lose) {
                    const [otherMatchNum, destNum] = connectionData.lose.toString().split(".");
                    this.createLoserDropsConnection(this.getMatchRef(otherMatchNum), matchNum, otherMatchNum, parseInt(destNum || "0"));
                }
            });
        },
        getMatchRef(matchNum) {
            // console.log(this.$refs);
            return this.$refs[`match-${matchNum}`];
        },
        createConnectionBetweenRefs(source, dest, sourceNum, destNum, destSide) {
            if (!source || !dest || !destSide) return;
            const container = this.$refs["connections-holder"];
            // console.log({ container });

            // console.log("connection between", { source, dest });
            const [sourceBox, destBox] = [source, dest].map(c => c[0].$el.getBoundingClientRect());
            // console.log({ sourceBox, destBox });

            const connection = document.createElement("div");
            connection.className = "connection";
            // connection.dataset.data = JSON.stringify(data);

            const HalfLine = 1;

            const coord = {};
            coord.leftSide = sourceBox.right;
            coord.rightSide = destBox.left;

            const sourcePoint = (sourceBox.bottom - (sourceBox.height / 2));
            let destPoint = (destBox.bottom - (destBox.height / 2));

            if (destSide) {
                const quarterHeight = destBox.height / 4;
                if (destSide === 1) {
                    destPoint -= quarterHeight;
                } else if (destSide === 2) {
                    destPoint += quarterHeight;
                }
            }

            connection.dataset.points = JSON.stringify({ sourcePoint, destPoint });

            const alignmentDiff = container.getBoundingClientRect();


            coord.topSide = Math.min(sourcePoint, destPoint);
            coord.bottomSide = Math.max(sourcePoint, destPoint);

            coord.direction = sourcePoint > destPoint ? "up" : "down";

            if (coord.direction === "up") {
                coord.topSide -= (HalfLine * 2);
                coord.bottomSide += HalfLine;
            } else {
                coord.topSide -= HalfLine;
                coord.bottomSide += HalfLine * 2;
            }

            connection.classList.add(`dir-${coord.direction}`);


            connection.style.left = `${coord.leftSide - alignmentDiff.left}px`;
            connection.style.top = `${coord.topSide - alignmentDiff.bottom}px`;

            connection.style.height = `${coord.bottomSide - coord.topSide}px`;
            connection.style.width = `${coord.rightSide - coord.leftSide}px`;


            connection.innerHTML = "<div class=\"c-top\"></div><div class=\"c-middle\"></div><div class=\"c-bottom\"></div>";


            this.connectionBugs.push({
                type: "normal",
                key: `${sourceNum}->${destNum}`,
                column: Math.max(this.getMatchColumnNum(sourceNum), this.getMatchColumnNum(destNum)),
                direction: coord.direction,
                style: {
                    left: `${coord.leftSide - alignmentDiff.left}px`,
                    top: `${coord.topSide - alignmentDiff.bottom}px`,
                    height: `${coord.bottomSide - coord.topSide}px`,
                    width: `${coord.rightSide - coord.leftSide}px`
                }
            });

            // container.appendChild(connection);
            this.connectionElements.push(connection);
        },
        createLoserDropsConnection(dest, sourceNum, destNum, destSide) {
            if (!dest || !destSide) return; // console.log("No destination for loser drops from", sourceNum, "to", destSide);
            // console.log(dest, sourceNum, destSide);

            const destBox = dest?.[0].$el.getBoundingClientRect();
            const container = this.$refs["connections-holder"];

            const coord = {};
            coord.leftSide = destBox.left;
            coord.rightSide = destBox.left;

            const sourcePoint = (destBox.bottom - (destBox.height / 2));
            let destPoint = (destBox.bottom - (destBox.height / 2));


            const quarterHeight = destBox.height / 4;
            if (destSide) {
                if (destSide === 1) {
                    destPoint -= quarterHeight * 2;
                } else if (destSide === 2) {
                    destPoint += quarterHeight;
                }
            }

            const alignmentDiff = container.getBoundingClientRect();


            coord.topSide = Math.min(sourcePoint, destPoint);
            coord.bottomSide = Math.max(sourcePoint, destPoint);

            coord.direction = sourcePoint > destPoint ? "up" : "down";

            const HalfLine = 1;
            if (coord.direction === "up") {
                coord.topSide -= (HalfLine * 2);
                coord.bottomSide += HalfLine;
            } else {
                coord.topSide -= HalfLine;
                coord.bottomSide += HalfLine * 2;
            }

            this.connectionBugs.push({
                type: "loser-drops",
                direction: "loser-drops",
                key: `${sourceNum}->${destNum}.${destSide}`,
                text: this.getMatch(sourceNum)?.match_number || sourceNum,
                title: `Loser of match ${sourceNum}`,
                column: this.getMatchColumnNum(destNum),
                style: {
                    left: `${coord.leftSide - alignmentDiff.left - (quarterHeight)}px`,
                    top: `${coord.topSide - alignmentDiff.bottom}px`,
                    height: `${quarterHeight}px`,
                    width: `${(quarterHeight)}px`
                }
            });
        }
    },
    beforeDestroy() {
        Store.commit("setHighlightedTeam", null);
        Store.commit("setHighlightedMatch", null);
    },
    beforeUpdate() {
        // console.log("[bracket rerender]");
        // this.createConnections();
    },
    watch: {
        layout: {
            deep: true,
            handler() {
                // console.log("[layout data update]");
                this.$nextTick(() => this.createConnections());
            }
        },
        bracket: {
            deep: true,
            handler() {
                // console.log("[bracket data update]");
                this.$nextTick(() => this.createConnections());
            }
        }
    },
    mounted() {
        // console.log("[bracket mounted]");
        this.$nextTick(() => this.createConnections());
    }
};
</script>

<style scoped>
    .bracket {
        position: relative;
    }
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

    .internal-bracket {
        padding: 0 6px;
    }

    .internal-bracket + .internal-bracket {
        margin-top: 1.5em;
    }


    .bracket.small >>> .inner .short {
        display: initial;
        font-size: 1.75em;
    }
    .bracket.small >>> .inner .text,
    .bracket.small >>> .match-number,
    .bracket.small >>> .match-extra-info {
        display: none
    }
    .bracket >>> .connection {
        /*background-color: rgba(255,0,0,0.25);*/
        position: absolute;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        transition: opacity 150ms ease, border-color 150ms ease, background-color 150ms ease;
        overflow: hidden;
    }
    /*.bracket >>> .connection.dir-up { background-color: rgba(255,255,0,0.25); }*/
    /*.bracket >>> .connection.dir-down { background-color: rgba(0, 255,255,0.25); }*/
    .connections {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
    }


    .bracket {
        z-index: 2;
    }
    .connections {
        z-index: 1;
    }

    .bracket >>> .connections {
        --b-width: 2px;
        --b-color: rgba(255,255,255,0.75);
        --b-curve: 4px;
    }
    .bracket >>> .connection.dir-down .c-top { border-top-right-radius: var(--b-curve); }
    .bracket >>> .connection.dir-down .c-bottom { border-bottom-left-radius: var(--b-curve); }
    .bracket >>> .connection.dir-up .c-top { border-top-left-radius: var(--b-curve); }
    .bracket >>> .connection.dir-up .c-bottom { border-bottom-right-radius: var(--b-curve); }

    .bracket >>> .connection.bug-lowlight {
        opacity: 0.2;
    }
    .bracket >>> .connection.bug-highlight {
        --b-color: rgba(255,255,255,1);
    }

    .bracket >>> .connection .c-top {
        width: calc(50% + var(--b-width));
        height: 32px;
        margin-right: 50%;
        border-top: var(--b-width) solid var(--b-color);
        border-right: var(--b-width) solid var(--b-color);
    }

    .bracket >>> .connection .c-middle {
        width: var(--b-width);
        background-color: var(--b-color);
        flex-grow: 1;
    }

    .bracket >>> .connection .c-bottom {
        width: calc(50% + var(--b-width));
        height: 32px;
        margin-left: 50%;
        border-bottom: var(--b-width) solid var(--b-color);
        border-left: var(--b-width) solid var(--b-color);
    }

    .bracket >>> .connection.dir-up .c-top {
        margin-right: 0;
        margin-left: 50%;
        border: none;
        border-top: var(--b-width) solid var(--b-color);
        border-left: var(--b-width) solid var(--b-color);
    }
    .bracket >>> .connection.dir-up .c-bottom {
        margin-left: 0;
        margin-right: 50%;
        border: none;
        border-bottom: var(--b-width) solid var(--b-color);
        border-right: var(--b-width) solid var(--b-color);
    }

    .bracket >>> .connection.dir-loser-drops .c-bottom {
        margin-left: 0;
        width: 100%;
        border-bottom-left-radius: var(--b-curve);
    }
    .bracket >>> .c-text {
        position: absolute;
        font-size: 0.8em;
        width: 100%;
        text-align: center;
        margin-bottom: .2em;
        margin-left: var(--b-width);
        color: var(--b-color);
    }

</style>

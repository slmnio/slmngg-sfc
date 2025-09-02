<template>
    <div class="bracket-creator">
        <div class="container">
            <LearnTitleChip title="Tools" subtitle="Bracket Creator" />


            <div class="presets mb-3">
                <b-button-toolbar class="d-flex gap-2">
                    <b-form-select v-model="selectedPreset" class="w-auto" :options="presetOptions" />
                    <b-button variant="success" :disabled="!selectedPreset" @click="applyPreset">
                        Apply preset
                    </b-button>
                </b-button-toolbar>
            </div>

            <div class="button flex w-100 d-flex mb-2 buttons">
                <b-button
                    variant="danger"
                    size="sm"
                    :disabled="!activeConnection"
                    @click="endConnectionSpecial('eliminated')">
                    <i class="fas fa-skull fa-fw"></i> Eliminated
                </b-button>
                <div class="spacer flex-grow-1"></div>
                <b-button variant="danger" size="sm" :disabled="!!activeConnection" @click="setAllEliminations()">
                    <i class="fas fa-skull fa-fw"></i> Set all remaining losses as eliminations
                </b-button>
                <div class="spacer flex-grow-1"></div>
                <b-button
                    variant="warning"
                    size="sm"
                    :disabled="!activeConnection"
                    @click="endConnectionSpecial('champion')">
                    <i class="fas fa-crown fa-fw"></i> Champion
                </b-button>
            </div>
        </div>
        <div class="container-fluid">
            <div class="bracket-controls w-100 flex-center mb-3 flex-column">
                <div v-for="(bracket, bi) in brackets" :key="bi" class="bracket flex-center flex-column mb-3">
                    <div class="columns my-2">
                        <div
                            v-for="(column, ci) in bracket.columns"
                            :key="'col-buttons-' + ci"
                            class="column col-buttons">
                            <div class="buttons flex-wrap flex-center">
                                <b-button variant="secondary" size="sm" @click="column.games.push({ empty: false })">
                                    <i class="fas fa-plus fa-fw"></i> Game
                                </b-button>
                                <b-button variant="info" size="sm" @click="column.games.push({ empty: true })">
                                    <i class="fas fa-plus fa-fw"></i> Empty
                                </b-button>
                                <b-button variant="danger" size="sm" @click="bracket.columns.splice(ci, 1)">
                                    <i class="fas fa-trash fa-fw"></i> Delete Column
                                </b-button>
                            </div>
                        </div>
                    </div>
                    <div class="columns">
                        <div v-for="(column, ci) in bracket.columns" :key="'col-' + ci" class="column">
                            <input v-model="column.header" class="mt-2 header">
                            <div class="game-area">
                                <div
                                    v-for="(game, mi) in column.games"
                                    :key="mi"
                                    class="game"
                                    :class="{'empty': game.empty}">
                                    <div class="game-row">
                                        <div class="game-teams">
                                            <div
                                                class="game-team"
                                                :class="{
                                                    'highlight': activeConnection,
                                                    'hover-active': highlightConnectionMatches(bi, ci, mi, 1),
                                                    'has-lose-connection': getReverseConnection(bi, ci, mi, 1)?.mode === 'lose',
                                                    'has-win-connection': getReverseConnection(bi, ci, mi, 1)?.mode === 'win'
                                                }"
                                                @mouseup="endConnection(bi, ci, mi, 1)">
                                                {{ getReverseConnectionText(bi, ci, mi, 1) }}
                                            </div>
                                            <div v-if="!game.empty" class="match-number">
                                                {{
                                                    getMatchNum(bi, ci, mi)
                                                }}
                                            </div>
                                            <div
                                                class="game-team"
                                                :class="{
                                                    'highlight': activeConnection,
                                                    'hover-active': highlightConnectionMatches(bi, ci, mi, 2),
                                                    'has-lose-connection': getReverseConnection(bi, ci, mi, 2)?.mode === 'lose',
                                                    'has-win-connection': getReverseConnection(bi, ci, mi, 2)?.mode === 'win'
                                                }"
                                                @mouseup="endConnection(bi, ci, mi, 2)">
                                                {{ getReverseConnectionText(bi, ci, mi, 2) }}
                                            </div>
                                        </div>
                                        <div class="game-buttons">
                                            <div class="game-button remove" @click="column.games.splice(mi,1)">
                                                <i class="fas fa-trash"></i>
                                            </div>
                                        </div>
                                        <div class="connection-buttons">
                                            <div
                                                class="connection-button"
                                                :class="{
                                                    'active': activeConnectionMatches(bi, ci, mi, 'win') || getConnection(bi, ci, mi, 'win'),
                                                    'champion':getConnection(bi, ci, mi, 'win') === 'champion'
                                                }"
                                                @mouseenter="showConnection(bi, ci, mi, 'win')"
                                                @mouseleave="hideConnection()"
                                                @mousedown="startConnection(bi, ci, mi, 'win')"
                                            >
                                                W
                                            </div>
                                            <div
                                                class="connection-button"
                                                :class="{
                                                    'active': activeConnectionMatches(bi, ci, mi, 'lose') || getConnection(bi, ci, mi, 'lose'),
                                                    'eliminated':getConnection(bi, ci, mi, 'lose') === 'eliminated'
                                                }"
                                                @mouseenter="showConnection(bi, ci, mi, 'lose')"
                                                @mouseleave="hideConnection()"
                                                @mousedown="startConnection(bi, ci, mi, 'lose')"
                                            >
                                                L
                                            </div>
                                        </div>
                                    </div>

                                    <div v-if="calculateRankings && !game.empty && ranking[(getMatchNum(bi,ci,mi)).toString()]" class="game-row game-ranking">
                                        <div v-if="ranking[(getMatchNum(bi,ci,mi)).toString()]?.winnerRank?.text" class="rank-text rank-text-win">Win: {{ ranking[(getMatchNum(bi,ci,mi)).toString()]?.winnerRank?.text }}</div>
                                        <div v-if="ranking[(getMatchNum(bi,ci,mi)).toString()]?.loserRank?.text" class="rank-text rank-text-lose">Lose: {{ ranking[(getMatchNum(bi,ci,mi)).toString()]?.loserRank?.text }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="extra-column buttons w-100 mt-3 mb-1">
                        <b-button variant="warning" size="sm" @click="bracket.columns.push({ games: [] })">
                            <i class="fas fa-plus fa-fw"></i> Column
                        </b-button>
                        <b-button variant="danger" size="sm" @click="brackets.splice(bi, 1)">
                            <i class="fas fa-trash fa-fw"></i> Delete Bracket
                        </b-button>
                    </div>
                </div>
                <div class="extra-bracket mb-3">
                    <b-button variant="secondary" size="sm" @click="brackets.push({ columns: [{ games: [] }]})">
                        <i class="fas fa-plus fa-fw"></i> Bracket
                    </b-button>
                </div>
            </div>
        </div>
        <div class="container">
            <textarea
                v-model="customFormat"
                type="text"
                rows="3"
                class="autogen w-100"
                style="white-space: normal;"
                contenteditable
                @keydown.ctrl.enter="updateCustomFormat()"></textarea>
            <div class="button flex w-100 d-flex flex-row-reverse mb-3 gap-1">
                <b-button variant="success" size="sm" @click="updateCustomFormat()">
                    <i class="fas fa-save fa-fw"></i> Update data
                </b-button>
                <b-form-checkbox v-model="calculateRankings" switch class="p-1 px-2">Calculate rankings</b-form-checkbox>
            </div>

            <h3>Bracket Preview</h3>
        </div>
        <div class="container-fluid flex-center">
            <Bracket class="py-3 row" :bracket="bracketData" />
        </div>
    </div>
</template>

<script>
import Bracket from "@/components/website/bracket/Bracket.vue";
import LearnTitleChip from "@/components/website/guide/LearnTitleChip.vue";

export default {
    name: "BracketCreator",
    components: { LearnTitleChip, Bracket },
    data: () => ({
        brackets: [
            {
                columns: [
                    {
                        games: [{ empty: false }, { empty: false }, { empty: false }, { empty: false }]
                    },
                    { games: [] }, { games: [] }, { games: [] }
                ]
            }
        ],
        activeConnection: null,
        connections: {},
        highlightedConnection: null,
        customFormat: "",
        selectedPreset: null,
        calculateRankings: true,
        presetOptions: [
            {
                value: null,
                text: "Choose a preset",
                disabled: true,
            },
            {
                value: {"brackets":[{"columns":[{"games":[]},{"games":[]},{"games":[]},{"games":[]}]}],"connections":{}},
                text: "Empty"
            },
            {
                value: {"brackets":[{"columns":[{"games":[1,2,3,4],"header":"Quarterfinals"},{"games":[5,null,6],"header":"Semifinals"},{"games":[7],"header":"Finals"}]}],"connections":{"1":{"win":"5.1","lose":"eliminated"},"2":{"win":"5.2","lose":"eliminated"},"3":{"win":"6.1","lose":"eliminated"},"4":{"win":"6.2","lose":"eliminated"},"5":{"win":"7.1","lose":"eliminated"},"6":{"win":"7.2","lose":"eliminated"},"7":{"win":"champion","lose":"eliminated"}}},
                text: "8-team single elimination"
            },
            {
                value: {"brackets":[{"columns":[{"games":[1,2,3,4],"header":"Round 1"},{"games":[5,6,7,8],"header":"Round 2"},{"games":[9,null,10],"header":"Semifinals"},{"games":[11],"header":"Final"}]}],"connections":{"1":{"win":"5.2","lose":"eliminated"},"2":{"win":"6.2","lose":"eliminated"},"3":{"win":"7.2","lose":"eliminated"},"4":{"win":"8.2","lose":"eliminated"},"5":{"win":"9.1","lose":"eliminated"},"6":{"win":"9.2","lose":"eliminated"},"7":{"win":"10.1","lose":"eliminated"},"8":{"win":"10.2","lose":"eliminated"},"9":{"win":"11.1","lose":"eliminated"},"10":{"win":"11.2","lose":"eliminated"},"11":{"lose":"eliminated","win":"champion"}}},
                text: "12-team single elimination"
            },
            {
                value: {"brackets":[{"columns":[{"games":[1,2,3,4,5,6,7,8]},{"games":[9,null,10,null,11,null,12]},{"games":[13,null,null,14]},{"games":[15]}]}],"connections":{"1":{"win":"9.1","lose":"eliminated"},"2":{"win":"9.2","lose":"eliminated"},"3":{"win":"10.1","lose":"eliminated"},"4":{"win":"10.2","lose":"eliminated"},"5":{"win":"11.1","lose":"eliminated"},"6":{"win":"11.2","lose":"eliminated"},"7":{"win":"12.1","lose":"eliminated"},"8":{"win":"12.2","lose":"eliminated"},"9":{"win":"13.1","lose":"eliminated"},"10":{"win":"13.2","lose":"eliminated"},"11":{"win":"14.1","lose":"eliminated"},"12":{"win":"14.2","lose":"eliminated"},"13":{"win":"15.1","lose":"eliminated"},"14":{"win":"15.2","lose":"eliminated"},"15":{"win":"champion","lose":"eliminated"}}},
                text: "16-team single elimination"
            },
            {
                value: {"brackets":[{"columns":[{"games":[1,2,3,4,5,6,7,8],"header":"Round of 16"},{"games":[9,null,10,null,11,null,12],"header":"Quarterfinals"},{"games":[13,null,null,null,14],"header":"Semifinals"},{"games":[null,null,null,15,null,null,16],"header":"Finals"}]}],"connections":{"1":{"win":"9.1","lose":"eliminated"},"2":{"win":"9.2","lose":"eliminated"},"3":{"win":"10.1","lose":"eliminated"},"4":{"win":"10.2","lose":"eliminated"},"5":{"win":"11.1","lose":"eliminated"},"6":{"win":"11.2","lose":"eliminated"},"7":{"win":"12.1","lose":"eliminated"},"8":{"win":"12.2","lose":"eliminated"},"9":{"win":"13.1","lose":"eliminated"},"10":{"win":"13.2","lose":"eliminated"},"11":{"win":"14.1","lose":"eliminated"},"12":{"win":"14.2","lose":"eliminated"},"13":{"win":"15.1","lose":"16.1"},"14":{"win":"15.2","lose":"16.2"},"15":{"win":"champion","lose":"advance"},"16":{"win":"advance","lose":"eliminated"}}},
                text: "16-team single elimination with 3rd place match"
            },
            {
                value: {"brackets":[{"columns":[{"games":[1,2,null]},{"games":[3,null,4]},{"games":[5]}]}],"connections":{"1":{"win":"3.1","lose":"4.1"},"2":{"lose":"4.2","win":"3.2"},"3":{"win":"5.1"},"4":{"win":"5.2"}}},
                text: "4-team double elimination (GSL)"
            },
            {
                value: {"brackets":[{"columns":[{"games":[1,2,3,4],"header":"Round 1"},{"games":[7,null,8],"header":"Semifinals"},{"games":[11],"header":"Upper Finals"},{"games":[]},{"games":[14],"header":"Grand Finals"}]},{"columns":[{"games":[5,6],"header":"LB Round 1"},{"games":[9,10],"header":"LB Round 2"},{"games":[12],"header":"Lower Semifinals"},{"games":[13],"header":"Lower Finals"},{"games":[]}]}],"connections":{"1":{"win":"7.1","lose":"5.1"},"2":{"win":"7.2","lose":"5.2"},"3":{"win":"8.1","lose":"6.1"},"4":{"win":"8.2","lose":"6.2"},"5":{"win":"9.2","lose":"eliminated"},"6":{"win":"10.2","lose":"eliminated"},"7":{"win":"11.1","lose":"10.1"},"8":{"win":"11.2","lose":"9.1"},"9":{"win":"12.1","lose":"eliminated"},"10":{"win":"12.2","lose":"eliminated"},"11":{"win":"14.1","lose":"13.1"},"12":{"win":"13.2","lose":"eliminated"},"13":{"win":"14.2","lose":"eliminated"},"14":{"win":"champion","lose":"eliminated"}}},
                text: "8-team double elimination"
            },
            {
                value: {"brackets":[{"name":"Upper Bracket","columns":[{"header":"UB Round 1","games":[1,2,3,4]},{"header":"UB Round 2","games":[5,6,7,8]},{"games":[]},{"header":"UB Semifinals","games":[15,null,16]},{"header":"UB Finals","games":[19]},{"games":[]},{"header":"Grand Finals","games":[22]}]},{"name":"Lower Bracket","columns":[{"games":[]},{"header":"LB Round 1","games":[9,10,11,12]},{"header":"LB Round 2","games":[13,null,14]},{"header":"LB Round 3","games":[17,18]},{"header":"LB Semifinals","games":[20]},{"header":"LB Finals","games":[21]},{"games":[]}]}],"connections":{"1":{"win":"5.2","lose":"12.2"},"2":{"win":"6.2","lose":"11.2"},"3":{"win":"7.2","lose":"10.2"},"4":{"win":"8.2","lose":"9.2"},"5":{"win":"15.1","lose":"9.1"},"6":{"win":"15.2","lose":"10.1"},"7":{"win":"16.1","lose":"11.1"},"8":{"win":"16.2","lose":"12.1"},"9":{"win":"13.1","lose":"eliminated"},"10":{"win":"13.2","lose":"eliminated"},"11":{"win":"14.1","lose":"eliminated"},"12":{"win":"14.2","lose":"eliminated"},"13":{"win":"17.2","lose":"eliminated"},"14":{"win":"18.2","lose":"eliminated"},"15":{"win":"19.1","lose":"18.1"},"16":{"win":"19.2","lose":"17.1"},"17":{"win":"20.1","lose":"eliminated"},"18":{"win":"20.2","lose":"eliminated"},"19":{"win":"22.1","lose":"21.1"},"20":{"win":"21.2","lose":"eliminated"},"21":{"win":"22.2","lose":"eliminated"},"22":{"win":"champion","lose":"eliminated"}}},
                text: "12-team double elimination"
            }
        ]
    }),
    computed: {
        bracketData() {
            return {
                bracket_layout: JSON.stringify({
                    brackets: this.numberedBrackets,
                    connections: this.rankedNumberedConnections
                }),
                ordered_matches: []
            };
        },
        ranking() {
            const nums = [...Object.entries(this.numberedConnections)].reverse();

            // need to group elimination matches by column
            console.log([...this.numberedBrackets]);

            const eliminations = nums.filter(([num, cons]) => cons.win === "champion" || cons.lose === "eliminated");
            let eliminationGroups = [];

            [...this.numberedBrackets].forEach((bracket, bi) => {
                bracket.columns.forEach((column, ci) => {
                    console.log(bi, column, ci);
                    const elimsInColumn = [...column.games].map(num => eliminations.find(([n, c]) => num === parseInt(n))).filter(Boolean);
                    console.log("column", column.games, elimsInColumn);
                    if (elimsInColumn.length > 0) {
                        eliminationGroups.push({
                            games: elimsInColumn,
                            bracket: bi,
                            column: ci,
                        });
                    }
                });
            });

            eliminationGroups = eliminationGroups.sort((a,b) => Math.max(...b.games.map(([num, cons]) => parseInt(num))) - Math.max(...a.games.map(([num, cons]) => parseInt(num))));

            const matchRankings = [];

            let resultCounter = 1;
            eliminationGroups.forEach(group => {
                let groupEliminationCount = group.games.filter(([numString, cons]) => cons.lose === "eliminated")?.length;
                console.log("eliminationGroup", group, { groupEliminationCount });
                group.games.forEach(([numString, cons]) => {
                    if (cons.win === "champion") {
                        if (!matchRankings[numString]) matchRankings[numString] = {};
                        matchRankings[numString].winnerRank = {
                            sort: resultCounter++,
                            text: "#1"
                        };
                    }
                    if (cons.lose === "eliminated") {
                        if (!matchRankings[numString]) matchRankings[numString] = {};
                        matchRankings[numString].loserRank = {
                            sort: resultCounter,
                            text: `#${resultCounter}${groupEliminationCount > 2 ? "-" : (groupEliminationCount > 1 ? "/" : "")}${groupEliminationCount > 1 ? resultCounter + (groupEliminationCount - 1) : ""}`
                        };
                    }
                });
                resultCounter += groupEliminationCount;
            });

            console.log("elims", eliminations, eliminationGroups);

            return matchRankings;
        },
        numberedBrackets() {
            let gameNum = 1;
            const brackets = JSON.parse(JSON.stringify(this.brackets));
            const maxColumns = Math.max(...brackets.map(b => b?.columns?.length || 0));
            console.log(maxColumns);
            for (let i = 0; i < maxColumns; i++) {
                brackets.forEach(bracket => {
                    if (bracket.columns?.[i]) {
                        const column = bracket.columns[i];
                        const games = [];
                        (column?.games || []).forEach(game => {
                            if (game.empty) {
                                games.push(null);
                            } else {
                                games.push(gameNum++);
                            }
                        });
                        column.games = games;
                    }
                });
            }
            return brackets;
        },
        numberedConnections() {
            const connections = {};
            Object.entries(this.connections).forEach(([start, end]) => {
                // console.log({ start, end });
                let [bracketNum, columnNum, gameNum, mode] = start.split("-");
                [bracketNum, columnNum, gameNum] = [bracketNum, columnNum, gameNum].map(e => parseInt(e));

                const startingMatchNum = this.getMatchNum(bracketNum, columnNum, gameNum);
                if (typeof end === "string") {
                    if (!connections[startingMatchNum]) connections[startingMatchNum] = {};
                    connections[startingMatchNum][mode] = end;
                } else {
                    const endingMatchNum = this.getMatchNum(end.bracketNum, end.columnNum, end.gameNum);
                    if (startingMatchNum && endingMatchNum) {
                        if (!connections[startingMatchNum]) connections[startingMatchNum] = {};
                        connections[startingMatchNum][mode] = [endingMatchNum, end.position].join(".");
                    }
                    console.log({ startingMatchNum, endingMatchNum });
                }
                return 0;
            });
            return connections;
        },
        rankedNumberedConnections() {
            if (!this.calculateRankings) return this.numberedConnections;
            return Object.fromEntries(Object.entries(this.numberedConnections).map(([matchNum, connections]) => {
                return [matchNum, {
                    ...connections,
                    ...(this.ranking[parseInt(matchNum)] || {})
                }];
            }));
        }
    },
    methods: {
        applyPreset() {
            if (!this.selectedPreset) return;
            if (!confirm("Are you sure you want to apply this preset?\nAny changes will be lost.")) return;
            this.customFormat = JSON.stringify(this.selectedPreset);
            this.selectedPreset = null;
            this.updateCustomFormat();
        },
        handleDrag(dir, bracketNum, columnNum, gameNum) {
        },
        startConnection(bracketNum, columnNum, gameNum, mode) {
            if (this.activeConnectionMatches(bracketNum, columnNum, gameNum, mode)) {
                this.activeConnection = null;
                return;
            }
            this.activeConnection = { bracketNum, columnNum, gameNum, mode };
            // this.connections.push(this.activeConnection);
            // console.log(bracketNum, columnNum, gameNum, mode, this.numberedBrackets?.[bracketNum].columns?.[columnNum]);
            // const numberedGame = this.numberedBrackets?.[bracketNum].columns?.[columnNum].games?.[gameNum];
            // console.log(numberedGame, mode);
        },
        endConnection(bracketNum, columnNum, gameNum, position) {
            if (!this.activeConnection) return;
            console.log({ bracketNum, columnNum, gameNum, position });
            const key = [
                this.activeConnection.bracketNum,
                this.activeConnection.columnNum,
                this.activeConnection.gameNum,
                this.activeConnection.mode
            ].join("-");
            this.connections[key] = { bracketNum, columnNum, gameNum, position };
            this.activeConnection = null;
        },
        endConnectionSpecial(special) {
            if (!this.activeConnection) return;
            const key = [
                this.activeConnection.bracketNum,
                this.activeConnection.columnNum,
                this.activeConnection.gameNum,
                this.activeConnection.mode
            ].join("-");
            this.connections[key] = special;
            this.activeConnection = null;
        },
        setAllEliminations() {
            this.brackets.forEach((bracket, bi) => {
                bracket.columns.forEach((column, ci) => {
                    column.games.forEach((game, gi) => {
                        const connection = this.getConnection(bi, ci, gi, "lose");
                        if (!connection) {
                            this.connections[[bi, ci, gi, "lose"].join("-")] = "eliminated";
                        }
                    });
                });
            });
        },
        activeConnectionMatches(bracketNum, columnNum, gameNum, mode) {
            if (!this.activeConnection) return;
            return this.activeConnection.bracketNum === bracketNum &&
                this.activeConnection.columnNum === columnNum &&
                this.activeConnection.gameNum === gameNum &&
                this.activeConnection.mode === mode;
        },
        highlightConnectionMatches(bracketNum, columnNum, gameNum, position) {
            if (!this.highlightedConnection) return;
            return this.highlightedConnection.bracketNum === bracketNum &&
                this.highlightedConnection.columnNum === columnNum &&
                this.highlightedConnection.gameNum === gameNum &&
                this.highlightedConnection.position === position;
        },
        getConnection(bracketNum, columnNum, gameNum, mode) {
            return this.connections[[
                bracketNum,
                columnNum,
                gameNum,
                mode
            ].join("-")];
        },
        getReverseConnection(bracketNum, columnNum, gameNum, position) {
            for (const [cKey, cVal] of Object.entries(this.connections)) {
                let [b, c, g, m] = cKey.split("-");
                [b, c, g] = [b, c, g].map(e => parseInt(e));

                if (cVal.bracketNum === bracketNum &&
                    cVal.columnNum === columnNum &&
                    cVal.gameNum === gameNum &&
                    cVal.position === position) {
                    return { bracketNum: b, columnNum: c, gameNum: g, mode: m };
                }
            }
            return {};
        },
        getReverseConnectionText(bracketNum, columnNum, gameNum, position) {
            const connection = this.getReverseConnection(bracketNum, columnNum, gameNum, position);
            if (!connection?.mode) return "";
            return `${connection.mode.slice(0, 1).toUpperCase()} M${this.getMatchNum(connection.bracketNum, connection.columnNum, connection.gameNum)}`;
        },
        getMatchNum(bracketNum, columnNum, gameNum) {
            return this.numberedBrackets?.[bracketNum]?.columns?.[columnNum]?.games?.[gameNum];
        },
        showConnection(bracketNum, columnNum, gameNum, mode) {
            this.highlightedConnection = this.getConnection(bracketNum, columnNum, gameNum, mode);
        },
        hideConnection() {
            this.highlightedConnection = null;
        },
        updateCustomFormat() {
            try {
                const { brackets, connections } = JSON.parse(this.customFormat.trim());
                const numberMap = new Map();
                this.brackets = brackets.map((bracket, bi) => ({
                    ...bracket,
                    columns: bracket.columns.map((column, ci) => ({
                        ...column,
                        games: column.games.map((game, gi) => {
                            if (game) numberMap.set(game, { bracketNum: bi, columnNum: ci, gameNum: gi });
                            return game === null ? { empty: true } : { empty: false };
                        })
                    }))
                }));
                console.log(connections);
                const newConnections = {};
                Object.entries(connections || {}).forEach(([sourceMatchNum, sourceMatchConnections]) => {
                    const sourceMatchKey = numberMap.get(parseInt(sourceMatchNum));
                    console.log("source match key", numberMap, sourceMatchKey, sourceMatchNum);

                    Object.entries(sourceMatchConnections).forEach(([mode, destinationMatch]) => {
                        if (!["win", "lose"].includes(mode)) return;
                        if (!destinationMatch.includes(".")) {
                            // text specific
                            if (sourceMatchNum === "null" || !sourceMatchNum) return;
                            console.log("d1", destinationMatch, sourceMatchNum, sourceMatchKey, mode);
                            newConnections[[
                                ...Object.values(sourceMatchKey), mode
                            ].join("-")] = destinationMatch;
                        } else {
                            const [destNum, destPosition] = destinationMatch.split(".");
                            const destMatchKey = numberMap.get(parseInt(destNum));
                            newConnections[[
                                ...Object.values(sourceMatchKey), mode
                            ].join("-")] = {
                                ...destMatchKey, position: parseInt(destPosition)
                            };
                        }
                    });
                });
                console.log(newConnections);
                this.connections = newConnections;
            } catch (e) {
                console.error(e);
                this.$notyf.error("Couldn't parse that format.");
            }
        }
    },
    watch: {
        bracketData: {
            immediate: true,
            deep: true,
            handler(newData) {
                this.customFormat = newData?.bracket_layout;
            }
        }
    }
};
</script>

<style scoped>
    .bracket, .column, .game-area, .game {

    }
    .buttons {
        display: flex;
        gap: 4px;
    }

    .column {
        width: 160px;
        margin: 0 10px;
        background-color: rgba(0,0,0,0.1);
    }

    .columns {
        display: flex;
    }

    .bracket {
        margin-bottom: 4px;
        background-color: rgba(0,0,0,0.1);
        width: fit-content;
    }

    .extra-column {
        margin-top: 4px;
        display: flex;
        flex-direction: row-reverse;
    }

    .game {
        width: 100%;
        outline: 1px solid rgba(255,255,255,0.2);
        margin: 10px 0;
        min-height: 40px;
        background-color: rgba(0,0,0,1);
        display: flex;
        flex-direction: column;
    }
    .game.empty {
        background-color: rgba(0,0,0,0.25);
        outline: none;
    }
    .game-row {
        display: flex;
        width: 100%;
    }
    .game-area {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding-bottom: 20px;
    }

    .game {
        display: flex;
    }
    .game-button {
        width: 40px;
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 20px;
        cursor: pointer;
        outline: 1px solid rgba(255,255,255,0.2);
    }
    .game-button:hover {
        background-color: rgba(255,255,255,0.1);
    }

    .game-buttons {
        display: flex;
    }

    .game-teams {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }

    .game-team {
        height: 100%;
        width: 100%;
        outline: 1px solid rgba(255,255,255,0.2);
        font-size: 1em;
        line-height: 19px;
        padding-left: .2em;
        font-weight: bold;
    }
    .game.empty .game-team,
    .game.empty .connection-button {
        display: none;
    }
    .connection-button {
        outline: 1px solid white;
        height: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 14px;
        width: 20px;
        line-height: 1;
        user-select: none;
        cursor: pointer;
    }
    .connection-button:hover {
        background-color: rgba(255,255,255,0.1);
    }
    .connection-button.active {
        background-color: white;
        color: black;
        font-weight: bold;
    }
    .connection-button.active.eliminated {
        background-color: darkred;
        color: white;
    }
    .connection-button.active.champion {
        background-color: darkgoldenrod;
        color: white;
    }
    .game-team.highlight {
        background-color: rgba(0,255,0,0.5);
        cursor: pointer;
    }
    .game-team.highlight:hover {
        background-color: rgba(0,255,0,0.75);
    }
    .game-team.has-win-connection {
        background-color: rgba(0,255,255,0.25);
        cursor: pointer;
    }
    .game-team.has-lose-connection {
        background-color: rgba(255,0,0,0.25);
        cursor: pointer;
    }
    .game-team.hover-active {
        background-color: rgba(255,255,255,1);
        cursor: pointer;
        color: black;
    }
    textarea.autogen {
        width: 100%;
        background-color: var(--dark);
        color: var(--light);
    }
    input.header {
        width: 100%;
        background-color: rgba(0,0,0,0.25);
        color: white;
        font-size: 0.9em;
        text-align: center;
        border: none;
        min-height: 2em;
    }
    .match-number {
        position: absolute;
        right: 0;
        font-weight: bold;
        font-size: 12px;
        border: 1px solid rgba(255,255,255,0.5);
        line-height: 1.2em;
        padding: 0 .2em;
        top: 11px;
        background-color: black;
        font-family: monospace;
    }

    .game-teams {
        position: relative;
    }


    .game-ranking {
        font-size: 0.75em;
        display: flex;
        justify-content: center;
        text-align: center;
        align-items: center;
        white-space: nowrap;
        gap: 1.5em;
    }

</style>

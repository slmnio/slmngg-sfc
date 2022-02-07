<template>
    <div class="solo-overlay flex-center">
        <div class="solo-part solo--ingame">
            <transition-group name="fade" mode="out-in">
                <IngameTeam :key="`${team.name}-${i}`" v-for="(team, i) in teams"
                            :team="team" :right="i === 1" :score="scores[i]"/>
            </transition-group>
            <!--  :score="scores[i]" :hideScores="broadcast.hide_scores"
                        :width="teamWidth" :codes="codes" -->

            <transition name="mid" mode="out-in">
                <Middle v-if="middle" :text="middle" :key="middle" />
            </transition>
        </div>


        <div class="solo-part solo--controls">
            <div class="control-group" v-if="controlMode === 'default'">
                <SoloControlButton noclick left rotate>SLMN.GG</SoloControlButton>
                <SoloControlButton icon="fas fa-exchange" color="#f22cf2" :click="() => flipTeams()">Flip teams</SoloControlButton>
                <SoloControlButton icon="fas fa-users" :color="teams[0] && teams[0].id ? '#2cd1f2' : ''" :click="() => controlMode = 'set-team-1'">Set Team 1</SoloControlButton>
                <SoloControlButton icon="far fa-users" :color="teams[1] && teams[1].id ? '#2cd1f2' : ''" :click="() => controlMode = 'set-team-2'">Set Team 2</SoloControlButton>
                <SoloControlButton icon="fas fa-medal" color="#f22cf2" :click="() => controlMode = 'set-scores'">Set Scores</SoloControlButton>
                <SoloControlButton icon="fas fa-align-center" :color="middle ? '#2cd1f2' : ''" :click="() => controlMode = 'set-middle'">Set Middle</SoloControlButton>
                <SoloControlButton v-if="showModule('break')" icon="far fa-snooze" :click="() => controlMode = 'set-break'">Break</SoloControlButton>

                <SoloControlButton icon="fas fa-map-marked-alt" color="#f22cf2" :click="() => controlMode = 'set-maps'" v-if="showModule('overview')">Set Maps</SoloControlButton>

                <div class="spacer"></div>
<!--                <SoloControlButton icon="fas fa-wrench" color="#f22cf2" :click="() => controlMode = 'set-options'">Match Options</SoloControlButton>-->
                <SoloControlButton icon="fas fa-desktop" noclick style="font-size: 2.75em">Overlay height: {{ pageHeight }}<small>px</small></SoloControlButton>
                <SoloControlButton noclick right rotate>SLMN.GG</SoloControlButton>
            </div>
            <div class="control-group" v-if="controlMode === 'set-team-1'">
                <SoloControlButton left rotate :click="() => controlMode = 'default'">Menu</SoloControlButton>
                <SoloTeamControlButton v-for="team in currentChunk" v-bind:key="team.id" :team="team"
                 :click="() => setTeam(0, team)"/>
                <div class="spacer"></div>
                <SoloControlButton color="#2cf22c" right rotate :click="() => nextPage()">Next</SoloControlButton>
            </div>

            <div class="control-group" v-if="controlMode === 'set-team-2'">
                <SoloControlButton left rotate :click="() => controlMode = 'default'">Menu</SoloControlButton>
                <SoloTeamControlButton v-for="team in currentChunk" v-bind:key="team.id" :team="team"
                 :click="() => setTeam(1, team)"/>
                <div class="spacer"></div>
                <SoloControlButton color="#2cf22c" right rotate :click="() => nextPage()">Next</SoloControlButton>
            </div>

            <div class="control-group" v-if="controlMode === 'set-scores'">
                <SoloControlButton left rotate :click="() => controlMode = 'default'">Menu</SoloControlButton>
                <div class="spacer"></div>

                <SoloControlButton v-bind:class="{'is-score': scores[0] === score}" class="score" v-for="score in [...scoreArray].reverse()" v-bind:key="'team-1-' + score"
                                   :click="() => setScore(0, score)">{{ score }}</SoloControlButton>


                <SoloTeamControlButton noclick v-for="team in teams" v-bind:key="team.id" :team="team"/>

                <SoloControlButton v-bind:class="{'is-score': scores[1] === score}" class="score" v-for="score in scoreArray" v-bind:key="'team-2-' + score"
                                   :click="() => setScore(1, score)">{{ score }}</SoloControlButton>

                <div class="spacer"></div>
                <SoloControlButton noclick right rotate>SLMN.GG</SoloControlButton>
            </div>

            <div class="control-group" v-if="controlMode === 'set-middle'">
                <SoloControlButton left rotate :click="() => controlMode = 'default'">Menu</SoloControlButton>

                <div class="solo-input-wrapper flex-center w-100">
                    <input type="text" v-model="tempMiddle" class="solo-text-input">
                </div>
                <SoloControlButton color="#f22cf2" :click="() => setMiddle()">Set</SoloControlButton>
                <div class="spacer"></div>
                <SoloControlButton noclick right rotate>SLMN.GG</SoloControlButton>
            </div>
            <div class="control-group" v-if="controlMode === 'set-options'">
                <SoloControlButton left rotate :click="() => controlMode = 'default'">Menu</SoloControlButton>

                <SoloControlButton icon="fas fa-stopwatch" :click="() => controlMode = 'set-first-to'">First to</SoloControlButton>

                <div class="spacer"></div>
                <SoloControlButton noclick right rotate>SLMN.GG</SoloControlButton>
            </div>
            <div class="control-group" v-if="controlMode === 'set-maps'">
                <SoloControlButton left rotate :click="() => controlMode = 'default'">Menu</SoloControlButton>

                <SoloControlButton v-for="num in mapNums" :key="num" :click="() => controlMap(num)">Map {{ num + 1}}</SoloControlButton>

                <div class="spacer"></div>
                <SoloControlButton noclick right rotate>SLMN.GG</SoloControlButton>
            </div>
            <div class="control-group" v-if="controlMode === 'set-map'">
                <SoloControlButton left rotate :click="() => controlMode = 'default'">Menu</SoloControlButton>

                <SoloControlButton noclick>Map {{ controllingMapNum + 1}}</SoloControlButton>
                <SoloMapButton :map="maps[controllingMapNum].map" :click="() => chooseMap()">Click to change</SoloMapButton>

                <div class="spacer"></div>
                <SoloControlButton noclick right rotate>SLMN.GG</SoloControlButton>
            </div>

            <div class="control-group" v-if="controlMode === 'choose-map'">
                <SoloControlButton left rotate :click="() => controlMode = 'default'">Menu</SoloControlButton>
                <SoloControlButton noclick>Map {{ controllingMapNum + 1 }} <small>{{ maps[controllingMapNum]._type || '' }}</small></SoloControlButton>

                <SoloMapButton v-for="map in currentMapChunk" v-bind:key="map.id" :map="map"
                                       :click="() => setMap(controllingMapNum, map)"/>


                <div class="spacer"></div>
                <SoloControlButton color="#2cf22c" right rotate :click="() => nextPage()">Next</SoloControlButton>
            </div>
            <div class="control-group" v-if="controlMode === 'set-break'">
                <SoloControlButton left rotate :click="() => controlMode = 'default'">Menu</SoloControlButton>

                <SoloControlButton icon="fas fa-stopwatch" :click="() => setBreak(1)">1:00</SoloControlButton>
                <SoloControlButton icon="fas fa-stopwatch" :click="() => setBreak(3)">3:00</SoloControlButton>
                <SoloControlButton icon="fas fa-stopwatch" :click="() => setBreak(5)">5:00</SoloControlButton>
                <SoloControlButton icon="fas fa-stopwatch" :click="() => setBreak(10)">10:00</SoloControlButton>
                <SoloControlButton icon="fas fa-stopwatch" :click="() => setBreak(15)">15:00</SoloControlButton>
                <SoloControlButton icon="fas fa-stopwatch" :click="() => setBreak(null)">Empty</SoloControlButton>

                <div class="spacer"></div>
                <SoloControlButton noclick right rotate>SLMN.GG</SoloControlButton>
            </div>
        </div>


        <div class="solo-part solo--desk flex-center" v-if="showModule('desk')">
            <DeskMatch class="w-100" :_match="virtualMatch" />
        </div>

        <div class="solo-part solo--rosters" v-if="showModule('rosters')">
            <RosterOverlay :virtual-match="virtualMatch" :broadcast="broadcast" :client="client" :title="title" />
        </div>
        <div class="solo-part solo--break" v-if="showModule('break')">
            <BreakOverlay :virtual-match="virtualMatch" :broadcast="broadcast" :client="client" :title="title" :animation-active="true" />
        </div>
        <div class="solo-part solo--overview" v-if="showModule('overview')">
            <OverviewOverlay :broadcast="broadcast" :virtual-match="virtualMatch" />
        </div>
        <div class="solo-loader d-none">
            {{ event && event.name }}
        </div>
    </div>
</template>

<script>
import IngameTeam from "@/components/broadcast/IngameTeam";
import SoloControlButton from "@/components/broadcast/SoloControlButton";
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import SoloTeamControlButton from "@/components/broadcast/SoloTeamControlButton";
import DeskMatch from "@/components/broadcast/desk/DeskMatch";
import Middle from "@/components/broadcast/Middle";
import RosterOverlay from "@/components/broadcast/roots/RosterOverlay";
import BreakOverlay from "@/components/broadcast/break/BreakOverlay";
import OverviewOverlay from "@/components/broadcast/roots/OverviewOverlay";
import SoloMapButton from "@/components/broadcast/SoloMapButton";

export default {
    name: "SoloOverlay",
    props: ["broadcast", "client", "title", "modules"],
    components: {
        SoloMapButton,
        OverviewOverlay,
        RosterOverlay,
        BreakOverlay,
        SoloControlButton,
        SoloTeamControlButton,
        IngameTeam,
        DeskMatch,
        Middle
    },
    data: () => ({
        controlMode: "default",
        controlPage: 0,
        middle: "",
        tempMiddle: "",
        controllingMapNum: null,

        teams: [
            { name: "Team 1", has_theme: 0 },
            { name: "Team 2", has_theme: 0 }
        ],
        scores: [0, 0],
        breakEnd: null,
        maps: []
    }),
    methods: {
        flipTeams() {
            this.teams = this.teams.reverse();
            this.scores = this.scores.reverse();
        },
        nextPage() {
            this.controlPage++;
            if (["set-team-1", "set-team-2"].includes(this.controlMode) && this.currentChunk.length === 0) this.controlPage = 0;
            if (["choose-map"].includes(this.controlMode) && this.currentMapChunk.length === 0) this.controlPage = 0;
        },
        setTeam(index, team) {
            this.$set(this.teams, index, team);
            this.controlMode = "default";
        },
        setMap(index, map) {
            this.$set(this.maps, index, {
                ...map,
                map: map,
                big_image: map.map_big_image,
                image: map.map_image,
                name: [map.name] // this emulates the lookup from Airtable
            });
            this.controlMode = "set-maps"; // TODO: change to "set-map" so other things can be done with it
        },
        setScore(index, score) {
            this.$set(this.scores, index, score);
        },
        setMiddle() {
            this.middle = this.tempMiddle.toUpperCase();
            this.controlMode = "default";
        },
        showModule(module) {
            return (this.modules || []).includes(module);
        },
        setBreak(minutes) {
            if (minutes) {
                this.breakEnd = new Date(new Date()).getTime() + (minutes * 1000 * 60);
            } else {
                this.breakEnd = null;
            }
            this.controlMode = "default";
        },
        controlMap(num) {
            this.controllingMapNum = num;
            console.log(this.allMaps, this.maps);
            if (!this.maps[num]) {
                this.maps[num] = {
                    map: null,
                    winner: null,
                    _type: this.mapTypes[num]
                };
            }
            this.controlMode = "set-map";
        },
        chooseMap() {
            this.controlPage = 0;
            this.controlMode = "choose-map";
            console.log(this.chunkedMaps, this.currentMapChunk);
        }
    },
    watch: {
        controlMode(newMode) {
            this.controlPage = 0;
        }
    },
    computed: {
        mapTypes() {
            if (!this.broadcast?.map_set) return [];
            return this.broadcast.map_set.split(",");
        },
        likelyNeededMaps() {
            return (this.virtualMatch.first_to * 2) - 1;
        },
        mapNums() {
            const nums = [];
            for (let i = 0; i < this.likelyNeededMaps + 1; i++) {
                nums.push(i);
            }
            console.log("likely needed", this.likelyNeededMaps, nums);
            return nums;
        },
        event() {
            return ReactiveThing("event", {
                theme: ReactiveThing("theme"),
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme"),
                    players: ReactiveArray("players")
                }),
                map_pool: ReactiveArray("map_pool")
            })(this.broadcast);
        },
        allMaps() {
            return this.event.map_pool;
        },
        chunkedTeams() {
            if (!this.event?.teams) return [];
            let i, j;
            const chunkLength = 9;
            const array = [...this.event.teams].sort((a, b) => a.team_category < b.team_category ? 1 : -1);
            const chunked = [];

            for (i = 0, j = array.length; i < j; i += chunkLength) {
                chunked.push(array.slice(i, i + chunkLength));

                // do whatever
            }
            console.log(chunked);
            return chunked;
        },
        currentChunk() {
            if (!this.chunkedTeams?.[this.controlPage]) return [];
            return this.chunkedTeams[this.controlPage];
        },
        chunkedMaps() {
            if (!this.allMaps?.length) return [];
            let i, j;
            let maps = [...this.allMaps];
            if (this.mapTypes?.length && this.mapTypes[this.controllingMapNum]) {
                maps = maps.filter(m => m.type === this.mapTypes[this.controllingMapNum]);
            }
            const chunkLength = 8;
            const array = maps.sort((a, b) => a.type < b.type ? 1 : -1);
            const chunked = [];
            for (i = 0, j = array.length; i < j; i += chunkLength) { chunked.push(array.slice(i, i + chunkLength)); }
            return chunked;
        },
        currentMapChunk() {
            if (!this.chunkedMaps?.[this.controlPage]) return [];
            return this.chunkedMaps[this.controlPage];
        },
        virtualMatch() {
            return {
                teams: this.teams,
                score_1: this.scores[0],
                score_2: this.scores[1],
                show_on_overlays: true,
                id: "virtual",
                _virtual_match_category: this.matchCategory,
                _virtual_break_end: this.breakEnd,
                first_to: 3,
                maps: this.maps
            };
        },
        scoreArray() {
            return [0, 1, 2, 3];
        },
        pageHeight() {
            let height = 0;

            // defaults
            height += 200; // control panel
            height += 200; // ingame
            if (this.showModule("desk")) height += 200; // full
            if (this.showModule("rosters")) height += 1080; // full
            if (this.showModule("break")) height += 1080; // full
            if (this.showModule("overview")) height += 1080; // full

            return height;
        },
        matchCategory() {
            // assuming match category matches team category
            if (this.teams[0]?.team_category) {
                // B League or 3;B League
                const data = this.teams[0]?.team_category.split(";");
                return data[data.length - 1];
            }
            return null;
        }
    }
};
</script>

<style scoped>
    .solo-overlay {
        flex-direction: column;
        font-family: "Industry", "SLMN-Industry", sans-serif;
        color: black;
    }
    .solo-part {
        height: 200px;
        width: 100%;
        overflow: hidden;
        position: relative;
        /* TODO: remove dev */ border: 2px solid red;
    }
    .solo-part.solo--rosters,
    .solo-part.solo--overview,
    .solo-part.solo--break {
        height: 1080px;
    }

    .solo--controls {
        background-color: #222;
    }

    .solo--ingame {
        position: relative;
    }

    .control-group {
        display: flex;
    }
    .spacer {
        width: 0;
        flex-grow: 1;
    }

    .solo--desk {
        padding: 0 10vw;
    }

    .solo-input-wrapper {
        background-color: #f12c2c;
        opacity: 0.8;
        padding: 0 2em;
    }

    .solo-text-input {
        font-size: 5em;
        height: 150px;
        width: 100%;
        text-transform: uppercase;
    }
</style>

<template>
    <div class="solo-overlay flex-center" :class="{'show-guides': showGuides}">
        <div class="solo-part solo--ingame">
            <div class="solo-pixel-info">200px</div>
            <transition-group name="fade" mode="out-in">
                <IngameTeam :key="`${team.name}-${i}`" v-for="(team, i) in teams" :color-logo-holder="colorLogoHolder"
                            :team="team" :right="i === 1" :score="scores[i]" :active="true"/>
            </transition-group>
            <!--  :score="scores[i]" :hideScores="broadcast.hide_scores"
                        :width="teamWidth" :codes="codes" -->

            <transition name="mid" mode="out-in">
                <Middle v-if="autoMiddle" :text="autoMiddle" :key="autoMiddle" :active="true" :tiny="true" />
            </transition>
        </div>


        <div class="solo-part solo--controls">
            <div class="solo-pixel-info">200px / {{ controlMode }}</div>
<!--            <div class="solo-pixel-info d-flex">{{ controlMode }}</div>-->
            <div class="control-group" v-if="controlMode === 'default'">
                <SoloControlButton noclick left rotate>SLMN.GG</SoloControlButton>
                <SoloControlButton icon="fas fa-exchange" color="#f22cf2" :click="() => flipTeams()">Flip teams</SoloControlButton>
                <SoloControlButton icon="fas fa-users" :color="teams[0] && teams[0].id ? '#2cd1f2' : ''" :click="() => controlMode = 'set-team-1'">Set Team 1</SoloControlButton>
                <SoloControlButton icon="far fa-users" :color="teams[1] && teams[1].id ? '#2cd1f2' : ''" :click="() => controlMode = 'set-team-2'">Set Team 2</SoloControlButton>
                <SoloControlButton icon="fas fa-align-center" :color="middle ? '#2cd1f2' : ''" :click="() => controlMode = 'set-middle'">Middle</SoloControlButton>
                <SoloControlButton icon="fas fa-medal" color="#f22cf2" :click="() => controlMode = 'set-scores'">Scores</SoloControlButton>
                <SoloControlButton icon="fas fa-map-marked-alt" color="#f22cf2" :click="() => controlMode = 'set-maps'" v-if="showModule('overview')">Maps & Winners</SoloControlButton>
                <SoloControlButton v-if="showModule('break')" :color="!breakEnd ? '#f22cf2' : '#2cd1f2'" icon="far fa-snooze" :click="() => controlMode = 'set-break'">Break</SoloControlButton>


                <div class="spacer"></div>
<!--                <SoloControlButton icon="fas fa-wrench" color="#f22cf2" :click="() => controlMode = 'set-options'">Match Options</SoloControlButton>-->
                <SoloControlButton icon="fas fa-border-outer" :color="showGuides ? '#2cd1f2' : ''" :click="() => showGuides = !showGuides" style="font-size: 2.75em">{{ showGuides ? 'Hide' : 'Show' }} guides</SoloControlButton>
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


                <SoloTeamControlButton noclick :team="teams[0]"/>
                <SoloControlButton icon="fas fa-trophy" color="#f22cf2" :click="() => controlMode = 'set-first-to'">First<br>To {{ firstTo }}</SoloControlButton>
                <SoloTeamControlButton noclick :team="teams[1]"/>

                <SoloControlButton v-bind:class="{'is-score': scores[1] === score}" class="score" v-for="score in scoreArray" v-bind:key="'team-2-' + score"
                                   :click="() => setScore(1, score)">{{ score }}</SoloControlButton>

                <div class="spacer"></div>
                <SoloControlButton noclick right rotate>SLMN.GG</SoloControlButton>
            </div>

            <div class="control-group" v-if="controlMode === 'set-first-to'">
                <SoloControlButton left rotate :click="() => controlMode = 'default'">Menu</SoloControlButton>
                <SoloControlButton icon="fas fa-trophy" color="#f22cf2" noclick>First<br>To</SoloControlButton>


                <SoloControlButton v-bind:class="{'is-score': firstTo === num}" class="score" v-for="num in [1,2,3,4,5]" v-bind:key="'first-to' + num"
                                   :click="() => setFirstTo(num)">{{ num }}</SoloControlButton>


                <div class="spacer"></div>
                <SoloControlButton noclick right rotate>SLMN.GG</SoloControlButton>
            </div>

            <div class="control-group" v-if="controlMode === 'set-middle'">
                <SoloControlButton left rotate :click="() => controlMode = 'default'">Menu</SoloControlButton>

                <div class="solo-input-wrapper flex-center w-100">
                    <input type="text" v-model="tempMiddle" class="solo-text-input" @keydown.enter="() => setMiddle()">
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

                <SoloMapButton v-for="num in mapNums" :key="num" :click="() => chooseMap(num)" :noclick="num !== 0 && !maps[Math.max(0,num - 1)]?.name"
                               :map="maps[num]" :top-text="`Map ${num + 1}`" :team-gel="mapWinners[num] === 'team-1' ? teams[0]?.theme : (mapWinners[num] === 'team-2'? teams[1]?.theme : null)"></SoloMapButton>

                <div class="spacer"></div>
                <SoloControlButton icon="fas fa-trophy" style="font-size: 2.5em" color="#f17a2c" :click="() => controlMode = 'set-map-winners'">Set Winners</SoloControlButton>
                <SoloControlButton noclick right rotate>SLMN.GG</SoloControlButton>
            </div>
            <div class="control-group" v-if="controlMode === 'set-map-winners'">
                <SoloControlButton left rotate :click="() => controlMode = 'default'">Menu</SoloControlButton>

                <SoloMapToggleButton v-for="num in mapNums" :key="num" :click="() => toggleMapWinner(num)"
                                     :teams="teams" :map="maps[num]" :noclick="num !== 0 && !maps[Math.max(0,num - 1)]?.name"
                                     :top-text="maps[num]?.short_name || `Map ${num + 1}`" :current="mapWinners[num]">
                </SoloMapToggleButton>

                <div class="spacer"></div>
                <SoloControlButton icon="fas fa-map-marked-alt" style="font-size: 2.5em" :click="() => controlMode = 'set-maps'">Set<br>Maps</SoloControlButton>
                <SoloControlButton noclick right rotate>SLMN.GG</SoloControlButton>
            </div>
            <div class="control-group" v-if="controlMode === 'set-map'">
                <SoloControlButton left rotate :click="() => controlMode = 'default'">Menu</SoloControlButton>

                <SoloControlButton noclick>Map {{ controllingMapNum + 1 }} <small>{{ maps[controllingMapNum]._type || maps[controllingMapNum].type || '' }}</small></SoloControlButton>
                <SoloMapButton :map="maps[controllingMapNum].map" :click="() => chooseMap()">Click to change</SoloMapButton>

                <div class="spacer"></div>
                <SoloControlButton noclick right rotate>SLMN.GG</SoloControlButton>
            </div>

            <div class="control-group" v-if="controlMode === 'choose-map'">
                <SoloControlButton left rotate :click="() => controlMode = 'set-maps'" color="#f0a02c">Maps</SoloControlButton>
                <SoloControlButton noclick>Map {{ controllingMapNum + 1 }} <small>{{ maps[controllingMapNum]._type || maps[controllingMapNum].type || '' }}</small></SoloControlButton>

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
            <div class="solo-pixel-info">200px</div>
            <DeskMatch class="w-100" :_match="virtualMatch" />
        </div>

        <div class="solo-part solo--rosters" v-if="showModule('rosters')">
            <div class="solo-pixel-info">1080px</div>
            <RosterOverlay :virtual-match="virtualMatch" :broadcast="broadcast" :client="client" :title="title" :animation-active="true"
                           :show-roles="rosterOptions.includes('roles')" :sort="rosterOptions.includes('sort')" :show-badges="rosterOptions.includes('badges')" />
        </div>
        <div class="solo-part solo--break" v-if="showModule('break')">
            <div class="solo-pixel-info">1080px</div>
            <BreakOverlay :virtual-match="virtualMatch" :broadcast="broadcast" :client="client" :title="title" :animation-active="true"
                          :custom-break-automation="breakAutomation"/>
        </div>
        <div class="solo-part solo--overview" v-if="showModule('overview')">
            <div class="solo-pixel-info">1080px</div>
            <OverviewOverlay :broadcast="broadcast" :virtual-match="virtualMatch" :no-map-videos="!showMapVideos" />
        </div>
        <div class="solo-loader d-none">
            {{ event && event.name }}
        </div>
    </div>
</template>

<script>
import IngameTeam from "@/components/broadcast/IngameTeam";
import SoloControlButton from "@/components/broadcast/SoloControlButton";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import SoloTeamControlButton from "@/components/broadcast/SoloTeamControlButton";
import DeskMatch from "@/components/broadcast/desk/DeskMatch";
import Middle from "@/components/broadcast/Middle";
import RosterOverlay from "@/components/broadcast/roots/RosterOverlay";
import BreakOverlay from "@/components/broadcast/break/BreakOverlay";
import OverviewOverlay from "@/components/broadcast/roots/OverviewOverlay";
import SoloMapButton from "@/components/broadcast/SoloMapButton";
import SoloMapToggleButton from "@/components/broadcast/SoloMapToggleButton.vue";

export default {
    name: "SoloOverlay",
    props: ["broadcast", "client", "title", "modules", "rosterOptions", "showMapVideos"],
    components: {
        SoloMapToggleButton,
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
            { name: "Team 1", code: "T1", has_theme: 0 },
            { name: "Team 2", code: "T2", has_theme: 0 }
        ],
        scores: [0, 0],
        breakEnd: null,
        maps: [],
        mapWinners: [],
        showGuides: false,
        firstTo: 3,

        noStinger: true
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
                big_image: map.big_image,
                image: map.image,
                name: [map.name] // this emulates the lookup from Airtable
            });
            console.log("setting map", map, this.maps[index]);
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
        chooseMap(num) {
            this.controllingMapNum = num;
            this.controlPage = 0;
            this.controlMode = "choose-map";
            if (!this.maps[num]) {
                this.maps[num] = {
                    map: null,
                    winner: null,
                    _type: this.mapTypes[num]
                };
            }
            console.log(this.chunkedMaps, this.currentMapChunk);
        },
        setFirstTo(num) {
            this.firstTo = num;
            this.controlMode = "set-scores";
        },
        toggleMapWinner(num) {
            console.log("toggle winner", num);
            const rotation = [null, "team-1", "team-2", "draw"];
            let current = this.mapWinners[num];
            if (current === undefined) {
                this.$set(this.mapWinners, num, null);
                current = null;
            }

            const index = rotation.indexOf(current);
            if (index === -1) {
                console.warn("Unsure what map winner to toggle to", { num, current });
                this.$set(this.mapWinners, num, null);
                return;
            }
            if (index >= rotation.length - 1) {
                this.$set(this.mapWinners, num, rotation[0]);
            } else {
                this.$set(this.mapWinners, num, rotation[index + 1]);
            }
            console.log(this.mapWinners[num]);
        }
    },
    watch: {
        controlMode(newMode) {
            this.controlPage = 0;
        }
    },
    computed: {
        autoMiddle() {
            if (!this.middle && !this.firstTo) return null;
            const parts = [];
            if (this.middle) parts.push(this.middle);
            if (this.firstTo) parts.push(`First to ${this.firstTo}`);
            return parts.join(" - ");
        },
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
            console.log("all maps", this.event);
            if (this.event?.map_pool) return this.event.map_pool;
            const allMaps = ReactiveRoot("Map Data", {
                ids: ReactiveArray("ids")
            })?.ids;
            if (!allMaps?.length) return [];
            return allMaps.filter(map => map.game === this.event.game);
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
        mapsWithWinners() {
            return this.maps.map((_map, i) => {
                const map = { ..._map };
                const mapWinData = this.mapWinners[i];
                if (mapWinData) {
                    if (mapWinData === "draw") {
                        map.draw = true;
                    } else if (mapWinData === "team-1") {
                        map.winner = this.teams[0];
                    } else if (mapWinData === "team-2") {
                        map.winner = this.teams[1];
                    }
                }
                return map;
            });
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
                first_to: this.firstTo,
                maps: this.mapsWithWinners
            };
        },
        scoreArray() {
            const arr = [];
            for (let i = 0; i <= this.firstTo; i++) {
                arr.push(i);
            }
            return arr;
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
        },
        breakAutomation() {
            return [
                "use: Schedule",
                "use: Matchup",
                "use: Bracket",
                "setting: Always do 30s Matchup"
            ];
        },
        colorLogoHolder() {
            return (this.broadcast?.broadcast_settings || []).includes("Color ingame team logo holder");
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
    .solo-overlay.show-guides .solo-part {
        border: 1px solid red;
        background-color: rgba(255,0,0,0.2);
    }
    .solo-overlay.show-guides .solo-part:nth-child(2n+1) {
        border: 1px solid blue;
        background-color: rgba(0,0,255,0.2);
    }
    .solo-pixel-info {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 100;
        font-weight: bold;
        font-size: 2em;
        background-color: rgba(255,255,255,0.9);
        padding: 0.25em .5em;
        line-height: 1;
        margin: .25em;
        border: 2px solid red;
    }

    .solo-overlay.show-guides .solo-part:nth-child(2n+1) .solo-pixel-info {
        border: 2px solid blue;
    }
    .solo-overlay:not(.show-guides) .solo-pixel-info {
        display: none;
    }
    .solo-part {
        height: 200px;
        width: 100%;
        overflow: hidden;
        position: relative;
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

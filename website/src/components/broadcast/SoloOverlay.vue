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
                <SoloControlButton color="#f22cf2" :click="() => flipTeams()">Flip teams</SoloControlButton>
                <SoloControlButton :color="teams[0] && teams[0].id ? '#2cd1f2' : ''" :click="() => controlMode = 'set-team-1'">Set Team 1</SoloControlButton>
                <SoloControlButton :color="teams[1] && teams[1].id ? '#2cd1f2' : ''" :click="() => controlMode = 'set-team-2'">Set Team 2</SoloControlButton>
                <SoloControlButton color="#f22cf2" :click="() => controlMode = 'set-scores'">Set Scores</SoloControlButton>
                <SoloControlButton :color="middle ? '#2cd1f2' : ''" :click="() => controlMode = 'set-middle'">Set Middle</SoloControlButton>
                <div class="spacer"></div>
                <SoloControlButton noclick style="font-size: 2.75em">Overlay height: {{ pageHeight }}<small>px</small></SoloControlButton>
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
        </div>


        <div class="solo-part solo--desk flex-center" v-if="showModule('desk')">
            <DeskMatch class="w-100" :_match="virtualMatch" :custom-scores="scores" />
        </div>

        <div class="solo-part solo--rosters" v-if="showModule('rosters')">
            <RosterOverlay :virtual-match="virtualMatch" :broadcast="broadcast" :client="client" :title="title" />
        </div>
        <div class="solo-part solo--break" v-if="showModule('break')">
            <BreakOverlay :virtual-match="virtualMatch" :broadcast="broadcast" :client="client" :title="title" />
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

export default {
    name: "SoloOverlay",
    props: ["broadcast", "client", "title", "modules"],
    components: {
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

        teams: [
            { name: "Team 1", has_theme: 0 },
            { name: "Team 2", has_theme: 0 }
        ],
        scores: [0, 0]
    }),
    methods: {
        flipTeams() {
            this.teams = this.teams.reverse();
            this.scores = this.scores.reverse();
        },
        nextPage() {
            this.controlPage++;
            if (this.currentChunk.length === 0) this.controlPage = 0;
        },
        setTeam(index, team) {
            this.$set(this.teams, index, team);
            this.controlMode = "default";
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
        }
    },
    watch: {
        controlMode(newMode) {
            this.controlPage = 0;
        }
    },
    computed: {
        event() {
            return ReactiveThing("event", {
                theme: ReactiveThing("theme"),
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme"),
                    players: ReactiveArray("players")
                })
            })(this.broadcast);
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
        virtualMatch() {
            return {
                teams: this.teams,
                show_on_overlays: true,
                id: "virtual",
                _virtual_match_category: this.matchCategory
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
            if (this.showModule("desk")) height += 200; // rosters, full
            if (this.showModule("rosters")) height += 1080; // rosters, full
            if (this.showModule("break")) height += 1080; // rosters, full

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

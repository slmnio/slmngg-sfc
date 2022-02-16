<template>
    <transition name="fade" mode="out-in">
        <div class="desk-match" v-if="match">
            <div class="teams d-flex" v-if="!match.special_event">
                <DeskTeam class="team" v-for="(team, i) in match.teams" v-bind:key="team.id" :team="team" :style="{order: i * 2}" />
                <div class="match-center flex-center">
                    <div class="match-score flex-center" v-if="show.score">
                        <div class="score flex-center" v-bind:class="{'win': match.score_1 === match.first_to}"><span class="industry-align">{{ match.score_1 }}</span></div>
                        <div class="dash">-</div>
                        <div class="score flex-center" v-bind:class="{'win': match.score_2 === match.first_to}"><span class="industry-align">{{ match.score_2 }}</span></div>
                    </div>
                    <div class="match-vs flex-center" :style="centerBorder" v-if="show.vs">
                        <transition mode="out-in" name="fade">
                            <span class="industry-align" :key="scoreText">{{ scoreText }}</span>
                        </transition>
                    </div>
                </div>
            </div>
            <div class="desk-match-text flex-center" v-if="match.special_event" :style="textBackground">
                <transition name="fade" mode="out-in">
                    <span :key="match.custom_name">{{ match.custom_name }}</span>
                </transition>
            </div>
        </div>
    </transition>
</template>

<script>
import DeskTeam from "@/components/broadcast/desk/DeskTeam";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
export default {
    name: "DeskMatch",
    components: { DeskTeam },
    props: ["_match", "themeColor", "matchID", "customScores"],
    computed: {
        matchData() {
            return this._match || ReactiveRoot(this.matchID, {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                }),
                event: ReactiveThing("event", {
                    theme: ReactiveThing("theme")
                })
            });
        },
        match() {
            if (!this.matchData?.special_event) {
                if (!this.matchData?.teams) return null;
                if (this.matchData.teams.length !== 2) return null;
                if (this.matchData.teams.some(t => !t.theme || t.theme.__loading)) return null;
            }
            return this.matchData;
        },
        show() {
            return {
                score: false,
                vs: true
            };
        },
        scores() {
            if (this.customScores) return this.customScores;
            if (!this.match?.id) return [];
            return [this.match.score_1, this.match.score_2];
        },
        scoreText() {
            if (this.scores && this.scores.some(s => !!s)) return this.scores.join("-");
            return "vs";
        },
        centerBorder() {
            if (!this.themeColor) return {};
            return {
                borderColor: this.themeColor.backgroundColor
            };
        },
        textBackground() {
            console.log(this.themeColor);
            return {
                ...this.themeColor
            };
        }
    }
};
</script>

<style scoped>
    span.industry-align { transform: translate(0, -0.09em) }
    .match-center { order: 1; }
    .score {
        background: white;
        /*border-radius: 20px;*/
        font-size: 100px;
        font-weight: bold;
        padding: 0 20px;
        width: 100px;
        height: 100%;
        transition: all .2s ease;
    }
    .score.win {
        background-color: #2664f7;
        color: white;
    }
    .dash {
        color: transparent;
        width: 20px;
    }
    .match-vs {
        font-size: 80px;
        text-transform: uppercase;
        font-weight: bold;
        padding: 0 20px;
        text-align: center;
        line-height: 1;
        height: 110px;
        border-bottom: 6px solid #2664f7;
        background-color: white;
        color: #111;
        white-space: nowrap;
        min-width: 180px;
    }

    .desk-match-text {
        font-size: 4em;
        border-bottom: 6px solid transparent;
        height: 110px;
    }
</style>

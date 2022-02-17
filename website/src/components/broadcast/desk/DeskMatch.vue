<template>
    <transition name="fade" mode="out-in">
        <div class="desk-match" v-if="match">
            <div class="teams d-flex" v-if="!match.special_event">
                <DeskTeam class="team" v-for="(team, i) in match.teams" v-bind:key="team.id" :team="team" :style="{order: i * 2}" />

                <div class="match-middle flex-center w-100">
                    <transition name="break-content" mode="out-in">
                        <div class="match-middle-match flex-center" v-if="middleMode === 'Match'">
                            <DeskTeamName v-for="(team, i) in match.teams" :key="team.id" :team="team" :style="{order: i*2}" />

                            <div class="match-center flex-center">
                                <div class="match-score flex-center" v-if="show.score">
                                    <div class="score flex-center" v-bind:class="{'win': match.score_1 === match.first_to}"><span class="industry-align">{{ match.score_1 }}</span></div>
                                    <div class="dash">-</div>
                                    <div class="score flex-center" v-bind:class="{'win': match.score_2 === match.first_to}"><span class="industry-align">{{ match.score_2 }}</span></div>
                                </div>
                                <div class="match-vs flex-center" :style="centerBorder" v-if="show.vs">
                                    <span class="industry-align">{{ scoreText }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="match-middle-notice flex-center" v-if="middleMode === 'Notice'" :key="broadcast.notice_text + '-' + broadcast.desk_display">
                            <DeskNotice class="notice" :notice="broadcast.notice_text" :main-theme="middleTheme" :alt-theme="altTheme"
                                        :right="broadcast.desk_display.includes('2')" />
                        </div>
                    </transition>
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
import DeskNotice from "@/components/broadcast/desk/DeskNotice";
import DeskTeamName from "@/components/broadcast/desk/DeskTeamName";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { logoBackground1, themeBackground1 } from "@/utils/theme-styles";
export default {
    name: "DeskMatch",
    components: { DeskTeam, DeskNotice, DeskTeamName },
    props: ["_match", "themeColor", "matchID", "broadcast"],
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
        },
        middleMode() {
            let display = this.broadcast?.desk_display || "";

            if (display.indexOf("(") !== -1) {
                display = display.slice(0, display.indexOf("(") - 1).trim();
            }
            return display || "Match";
        },
        middleTheme() {
            const display = this.broadcast?.desk_display || "";
            if (!display) return this.lowerBackground;
            try {
                if (display.includes("Team 1")) return logoBackground1(this.matchData.teams[0]);
                if (display.includes("Team 2")) return logoBackground1(this.matchData.teams[1]);
            } catch (e) { }
            return this.lowerBackground;
        },
        lowerBackground() {
            return logoBackground1(this.broadcast.event);
        },
        altTheme() {
            const display = this.broadcast?.desk_display || "";
            if (!display) return themeBackground1(this.broadcast.event);
            try {
                if (display.includes("Team 1")) return themeBackground1(this.matchData.teams[0]);
                if (display.includes("Team 2")) return themeBackground1(this.matchData.teams[1]);
            } catch (e) { }
            return themeBackground1(this.broadcast.event);
        }
    },
    methods: {
        nbr(text) {
            if (!text) return "";
            return text.replace(/\\n/g, "<br>");
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

    .match-middle {
        width: 100%;
        flex-grow: 1;
    }
    .match-middle > div {
        width: 100%;
        height: 100%;
    }

    .break-content-enter-active, .break-content-leave-active { transition: all .35s ease; overflow: hidden }
    .break-content-enter { clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%); }
    .break-content-leave-to { clip-path: polygon(0 0, 0 0, 0 100%, 0% 100%); }
    .break-content-enter-to, .break-content-leave { clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%); }
</style>

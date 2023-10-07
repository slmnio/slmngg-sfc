<template>
        <div class="desk-match" v-if="match">
            <div class="teams d-flex" v-if="!match.special_event">
                <DeskTeam class="team" v-for="(team, i) in (useFlatElements ? [] : match.teams)" :key="team.id" :team="team" :style="{order: i * 2}" />

                <div class="match-middle flex-center w-100">
                    <transition name="break-content" mode="out-in">
                        <div class="match-middle-match flex-center flex-column" v-if="middleMode === 'Match'">
                            <div class="scoreboard-title" v-if="scoreboardTitle">
                                <transition name="fade" mode="out-in">
                                    <span :key="scoreboardTitle">{{ scoreboardTitle }}</span>
                                </transition>
                            </div>
                            <div class="match-middle-match-holder w-100 h-100 flex-center">
                                <div class="team-alt-slice" :class="`team-${i+1}`" v-for="(team, i) in match.teams"
                                     :key="team.id"
                                     :style="{ backgroundColor: getTeamAltSlice(team), order: (i) * 9}"></div>
                                <DeskTeam class="team" :class="`team-${i+1}`"
                                          v-for="(team, i) in (useFlatElements ? match.teams:  [])" :key="team.id"
                                          :team="team" :style="{order: (i * 2) + i}"/>
                                <DeskTeamName :broadcast="broadcast" :match="matchData" :class="`team-${i+1}`" v-for="(team, i) in match.teams" :key="team.id"
                                              :team="team" :style="{order: i * 2}"/>

                                <div class="match-center flex-center" v-if="!splitMatchScore">
                                    <div class="match-score flex-center" v-if="show.score">
                                        <div class="score flex-center"
                                             :class="{'win': match.score_1 === match.first_to}"><span
                                            class="industry-align">{{ match.score_1 }}</span></div>
                                        <div class="dash">-</div>
                                        <div class="score flex-center"
                                             :class="{'win': match.score_2 === match.first_to}"><span
                                            class="industry-align">{{ match.score_2 }}</span></div>
                                    </div>
                                    <div class="match-vs flex-center" :style="centerBorder" v-if="show.vs">
                                        <span class="industry-align">{{ scoreText }}</span>
                                    </div>
                                </div>
                                <div class="match-center flex-center" v-else>
                                    <div class="match-score-split">
                                        <div class="score flex-center" :style="centerBorder"><span
                                            class="industry-align">{{ match.score_1 }}</span></div>
                                        <div class="vs flex-center" :style="themeColor"><span
                                            class="industry-align">VS</span></div>
                                        <!--                                    <div class="vs-empty"></div>-->
                                        <div class="score flex-center" :style="centerBorder"><span
                                            class="industry-align">{{ match.score_2 }}</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="match-middle-notice flex-center" v-if="middleMode === 'Notice'" :key="broadcast.notice_text + '-' + broadcast.desk_display">
                            <DeskNotice class="notice" :notice="broadcast.notice_text" :main-theme="middleTheme" :alt-theme="altTheme"
                                        :right="broadcast.desk_display.includes('2')" />
                        </div>
                        <div class="match-middle-predictions flex-center" v-if="middleMode === 'Predictions'" key="Predictions">
                            <DeskPrediction v-for="guest in guests" :key="guest.id" :guest="guest" :event="broadcast.event" />
                        </div>
                        <div class="match-middle-maps flex-center" v-if="middleMode === 'Maps'" key="Maps">
                            <MapDisplay :small="true" :broadcast="broadcast" no-map-videos="true" />
                        </div>
                        <div class="match-middle-drafted-maps flex-center" v-if="middleMode === 'Drafted Maps'" key="Drafted Maps">
                            <MapDisplay :small="true" :broadcast="broadcast" :drafted-style="true" />
                        </div>
                        <div class="match-middle-interview flex-center flex-column" v-if="middleMode === 'Interview'" key="Interview">
                            <div class="scoreboard-title">Interview</div>
                            <DeskInterview :broadcast="broadcast"></DeskInterview>
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
</template>

<script>
import DeskTeam from "@/components/broadcast/desk/DeskTeam";
import DeskNotice from "@/components/broadcast/desk/DeskNotice";
import DeskTeamName from "@/components/broadcast/desk/DeskTeamName";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { logoBackground1, themeBackground1 } from "@/utils/theme-styles";
import DeskPrediction from "@/components/broadcast/desk/DeskPrediction";
import MapDisplay from "@/components/broadcast/MapDisplay";
import DeskInterview from "@/components/broadcast/desk/DeskInterview.vue";
export default {
    name: "DeskMatch",
    components: { DeskInterview, DeskPrediction, DeskTeam, DeskNotice, DeskTeamName, MapDisplay },
    props: ["_match", "themeColor", "matchID", "broadcast", "guests", "forceMode"],
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
            if (this.forceMode) return this.forceMode;
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
        },
        splitMatchScore() {
            return (this.broadcast?.broadcast_settings || []).includes("Split desk match score");
        },
        useFlatElements() {
            return (this.broadcast?.broadcast_settings || []).includes("Use flat desk elements");
        },
        scoreboardTitle() {
            return this.broadcast?.scoreboard_title || this.matchData?.round;
        }
    },
    methods: {
        nbr(text) {
            if (!text) return "";
            return text.replace(/\\n/g, "<br>");
        },
        getTeamAltSlice(team) {
            if (!team.theme) return {};
            let color = team.theme.color_accent;
            if (!color || color.toLowerCase() === "#ffffff") color = team.theme.color_logo_accent;
            if (!color || color.toLowerCase() === "#ffffff") color = team.theme.color_theme;
            return color;
        }
    }
};
</script>

<style scoped>
    span.industry-align {
        transform: var(--overlay-line-height-adjust, translate(0, -0.0925em));
    }
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

    .match-middle-predictions {
        margin: 0 12px;
    }
    .match-middle-maps {
        margin: 0 36px;
    }

    .break-content-enter-active, .break-content-leave-active { transition: all .35s ease; overflow: hidden }
    .break-content-enter { clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%); }
    .break-content-leave-to { clip-path: polygon(0 0, 0 0, 0 100%, 0% 100%); }
    .break-content-enter-to, .break-content-leave { clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%); }

    .match-middle-maps >>> .map-lower {
        font-size: 20px !important;
        padding: 0 3px;
        min-height: 50px;
        line-height: 0.9;
        border-top-width: 4px;
    }
    .match-middle-maps >>> .map-logo-holder {
        height: 80% !important;
    }
    .match-middle-maps >>> .map-bg {
        transform: translate(0, -12%);
    }
    .match-score-split {
        display: flex;
        height: 110px;
    }

    .match-score-split .vs {
        width: auto;
        font-size: 58px;
        padding: 0 20px;
    }

    .match-score-split .score {
        font-size: 90px;
        width: 100px;
    }
    .vs-empty {
        width: 50px;
        opacity: 0;
    }
    .match-score-split .score, .match-score-split .vs {
        border-bottom: 6px solid transparent;
    }
    .team-alt-slice {
        height: 100%;
        width: 6px;
        flex-shrink: 0;
    }


    .scoreboard-title {
        height: 36px;
        background: #222;
        color: white;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        font-weight: bold;
        font-size: 24px;
        text-transform: uppercase;
    }
    .match-middle-interview {
        background-color: white;
    }
</style>

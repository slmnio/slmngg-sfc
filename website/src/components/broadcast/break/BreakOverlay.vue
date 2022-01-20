<template>
    <transition name="broadcast-mid-split">
    <div class="break-overlay" v-if="animationActive">
        <div class="break-center">
            <div class="break-top event-theme-border flex-center overlay--bg" :style="eventBorder">
                <transition name="fade" mode="out-in">
                    <span class="industry-align" v-bind:class="{'has-br': (overlayTitle).includes('\\n') }"
                          :key="overlayTitle" v-html="nbr(overlayTitle)"></span>
                </transition>
                <BreakHeadlines v-if="broadcast.use_headlines" :headlines="headlines" title="News" :borderCSS="eventBorder" />
            </div>
            <div class="break-main event-theme-border overlay--bg" :style="eventBorder">
                <div class="break-col break-left-col">
                    <transition name="anim-break-next">
                        <div class="break-next" v-if="nextMatch">
                            <BreakMatch :match="nextMatch" :expanded="false" :theme-color="themeColor" />
                        </div>
                    </transition>
                    <transition name="anim-break-next">
                    <div class="countdown-text" v-if="!broadcast.countdown_end && !nextMatch">Current time</div>
                    </transition>
                    <Countdown class="break-countdown" :to="broadcast.countdown_end" :timezone="broadcast.timezone" :update="(e) => countdownTick(e)" />
                    <Sponsors class="break-sponsors" :sponsors="sponsorThemes" />
                </div>
                <transition name="break-content" mode="out-in">
                    <transition-group class="break-col break-schedule" name="a--match" v-if="automatedShow === 'Schedule'" key="Schedule">
                        <BreakMatch v-for="match in schedule" :timezone="broadcast.timezone" :match="match" :expanded="true" v-bind:key="match.id" :theme-color="themeColor" />
                    </transition-group>
                    <div class="break-col break-standings" v-if="automatedShow === 'Standings'" :key="`Standings-${broadcast.current_stage || ''}`">
                        <Standings :event="event" :stage="broadcast.current_stage" />
                    </div>
                    <div class="break-col break-image" v-if="automatedShow === 'Image'" :key="`image-${breakImageURL}`">
                        <div v-if="breakImageURL" class="break-image-inner" :style="breakImage"></div>
                        <ThemeLogo v-else class="break-image-inner break-image-default" :theme="event.theme"
                                   icon-padding="10%" border-width="0" :logo-size="450" />
                    </div>
                    <Bracket class="break-col break-bracket" v-if="automatedShow === 'Bracket'" key="Bracket" :event="event" :bracket="bracket" use-overlay-scale small />
                    <div class="break-col break-others" v-if="automatedShow === 'Other Broadcasts'">
                        <div class="broadcast-previews-title">
                            {{ broadcasts.length === 1 ? broadcasts[0].name : 'Other broadcasts' }}
                        </div>
                        <div class="broadcast-previews">
                            <BroadcastPreview v-for="other in broadcasts" v-bind:key="other.id" :broadcast="other"/>
                        </div>
                    </div>
                    <BreakStaffList class="break-col break-staff-list" v-if="automatedShow === 'Staff'" key="Staff" :matches="fullSchedule"/>
                    <BreakMatchup class="break-col break-matchup" v-if="automatedShow === 'Matchup'" :key="`Matchup-${nextMatch ? nextMatch.id : ''}`" :match="nextMatch" />
                </transition>
            </div>
        </div>
        <div class="break-preload">
            <BreakMatch v-for="match in schedule" :timezone="broadcast.timezone" :match="match" :expanded="true" v-bind:key="match.id" :theme-color="themeColor" />
            <Standings :event="event" :stage="broadcast.current_stage" />
            <div class="break-image-inner" :style="cssImage('backgroundImage', broadcast, ['break_image'], 1080, false)"></div>
            <Bracket class="break-col break-bracket" :event="event" :bracket="bracket" use-overlay-scale />
            <BreakMatchup class="break-col break-matchup" :match="nextMatch" />
            <BreakStaffList class="break-col break-staff-list" :matches="fullSchedule"/>
        </div>
    </div>
    </transition>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import BreakMatch from "@/components/broadcast/break/BreakMatch";
import { cssImage } from "@/utils/content-utils";
import { sortMatches } from "@/utils/sorts";
import Sponsors from "@/components/broadcast/Sponsors";
import Standings from "@/components/broadcast/Standings";
import Countdown from "@/components/broadcast/Countdown";
import Bracket from "@/components/website/bracket/Bracket";
import BroadcastPreview from "@/components/broadcast/BroadcastPreview";
import BreakHeadlines from "@/components/broadcast/break/BreakHeadlines";
import { themeBackground1 } from "@/utils/theme-styles";
import BreakStaffList from "@/components/broadcast/break/BreakStaffList";
import BreakMatchup from "@/components/broadcast/break/BreakMatchup";
import ThemeLogo from "@/components/website/ThemeLogo";

const tickTime = 25;

export default {
    name: "BreakOverlay",
    props: ["broadcast", "title", "animationActive"],
    components: { ThemeLogo, BreakMatchup, BreakStaffList, BreakHeadlines, BroadcastPreview, Bracket, Standings, BreakMatch, Sponsors, Countdown },
    data: () => ({
        tick: 0,
        lastCountdownTick: 0
    }),
    methods: {
        nbr(text) {
            if (!text) return "";
            return text.replace(/\\n/g, "<br>");
        },
        countdownTick(x) {
            this.lastCountdownTick = x;
        },
        cssImage
    },
    computed: {
        broadcasts() {
            return this.broadcast?.other_broadcasts || [];
        },
        breakImage() {
            return cssImage("backgroundImage", this.broadcast, ["break_image"], 1080, false);
        },
        breakImageURL() {
            return this.breakImage?.backgroundImage;
        },
        nextMatch() {
            if (!this.broadcast || !this.broadcast.live_match || !this.broadcast.show_live_match) return null;
            return ReactiveRoot(this.broadcast.live_match[0], {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                })
            });
        },
        fullSchedule() {
            if (!this.broadcast || !this.broadcast.schedule) return null;
            return ReactiveArray("schedule", {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                })
            })(this.broadcast).sort(sortMatches);
        },
        schedule() {
            if (!this.broadcast || !this.broadcast.schedule || !this.fullSchedule) return null;
            return this.fullSchedule.filter(m => {
                return m.show_on_overlays;
            }).sort(sortMatches);
        },
        event() {
            if (!this.broadcast || !this.broadcast.event) return null;
            return ReactiveRoot(this.broadcast.event.id, {
                theme: ReactiveThing("theme"),
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                }),
                brackets: ReactiveArray("brackets", {
                    ordered_matches: ReactiveArray("ordered_matches", {
                        teams: ReactiveArray("teams", {
                            theme: ReactiveThing("theme")
                        })
                    })
                })
            });
        },
        sponsorThemes() {
            if (!this.broadcast || !this.broadcast.sponsors) return null;
            return ReactiveArray("sponsors", {
                theme: ReactiveThing("theme")
            })(this.broadcast);
        },
        eventBorder() {
            if (!this.event || !this.event.theme) return null;
            return {
                borderColor: this.event.theme.color_theme
            };
        },
        breakDisplay() {
            if (!this.broadcast || !this.broadcast.break_display) return null;
            return this.broadcast.break_display;
        },
        bracketKey() {
            return this.broadcast?.bracket_key;
        },
        bracket() {
            if (!this.event?.brackets) return null;
            if (!this.bracketKey) return this.event.brackets[0];
            const bracket = this.event.brackets.find(b => b && b.key === this.bracketKey);
            return bracket || this.event.brackets[0];
        },
        headlines() {
            return (this.broadcast?.headlines || []).filter(b => b.ready);
        },
        themeColor() {
            return themeBackground1(this.event);
        },
        suggestedShow() {
            if (!this.broadcast?.break_automation?.length) return null;

            let slides = this.broadcast.break_automation.filter(s => s.startsWith("use:")).map(s => s.replace("use: ", ""));
            console.log(slides);
            if (!this.nextMatch) slides = slides.filter(s => s !== "Matchup");

            console.log(slides, this.nextMatch);

            // TODO: add stuff here that changes based on the countdown remaining


            if (slides?.includes("Schedule") && this.broadcast.countdown_end && this.lastCountdownTick <= 30) {
                return "Schedule";
            }

            return slides[(this.tick % slides.length)];
        },
        automatedShow() {
            if (this.broadcast?.break_automation?.length && this.lastCountdownTick <= 30 && this.broadcast.countdown_end) {
                if (this.broadcast.break_automation.includes("setting: Always do 30s Schedule")) return "Schedule";
                if (this.broadcast.break_automation.includes("setting: Always do 30s Matchup")) return "Matchup";
            }
            if (this.broadcast.break_display && this.broadcast.break_display !== "Automated") {
                // do what it says
                return this.broadcast.break_display;
            } else {
                // empty or automated - do automation
                return this.suggestedShow;
            }
        },
        matchIsLast() {
            if (!this.schedule?.length) return true; // no schedule - assume last
            if (!this.nextMatch?.first_to) return false; // no match - assume others??
            const index = this.schedule.findIndex(match => match.id === this.nextMatch.id);
            if (index === -1) return true; // not in schedule - assume it's a schedule for tomorrow
            if (index === (this.schedule.length - 1)) return true; // last of the day!
            return false; // is not last
        },
        autoTitle() {
            if (!this.nextMatch?.first_to) return ""; // probably nothing for now
            console.log(this.nextMatch);
            const scores = [this.nextMatch.score_1 || 0, this.nextMatch.score_2 || 0];
            if (scores.every(s => s === 0)) return "Starting soon"; // 0-0
            if (scores.some(s => s === this.nextMatch.first_to) && this.matchIsLast) return "Thanks for watching";
            return "Be right back";
        },
        overlayTitle() {
            const title = this.title || this.broadcast?.title || this.broadcast?.name || "";
            const titleWithAuto = title.replace("{auto}", this.autoTitle);
            if (!titleWithAuto || titleWithAuto.trim().length === 0) return title; // make sure we have something here
            return titleWithAuto;
        }
    },
    watch: {
        broadcast() {
            if (this.broadcast) {
                document.body.dataset.broadcast = this.broadcast.key;
            }
        },
        animationActive(isActive) {
            if (isActive) {
                this.tick = 0;
            }
        }
    },
    mounted() {
        setInterval(() => {
            this.tick++;
        }, tickTime * 1000);
    }
};
</script>

<style scoped>

    .event-theme-border {
        border-bottom: 8px solid transparent;
    }

    .break-overlay {
        position: absolute;
        overflow: hidden;

        height: 100%;
        width: 100%;
        color: white;

        font-family: "Industry", "SLMN-Industry", sans-serif;
    }

    span.industry-align {
        transform: translate(0, -.0925em);
    }

    .break-center {
        width: 100%; height: 100%;
        padding: 120px 180px;
        box-sizing: border-box;

        display: flex;
        flex-direction: column;
    }

    .break-top {
        height: 160px;
        width: 100%;
        background-color: #222;
        font-size: 96px;
        font-weight: bold;
        text-transform: uppercase;
        flex-shrink: 0;
        line-height: 1;
        text-align: center;
        display: flex;
        flex-direction: column;
    }
    .break-top .has-br {
        font-size: 0.75em;
    }

    .break-main {
        width: 100%;
        background-color: #222;
        margin-top: 80px;
        flex-grow: 1;

        height: 0;
        display: flex;
    }
    .break-col {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        width: 100%; height: 100%;
        padding: 20px;
    }
    .break-left-col {
        width: 480px;
        flex-shrink: 0;
        border-right: 1px solid white;
        padding: 5px 20px;
    }
    .break-schedule {
        flex-grow: 1;
        box-sizing: border-box;
        /*justify-content: space-evenly;*/
        overflow: hidden;
        /*background-color: rgba(0,0,0,0.2);*/
    }
    .break-next {
        width: 100%;
        padding: 20px;
        /*padding: 10px 0 15px 0px;*/
    }
    .break-schedule, .break-matchup, .break-standings {
        padding: 20px 40px;
    }

    .break-countdown {
        font-size: 156px;
        font-weight: bold;
        flex-grow: 1;
        height: 0;
        letter-spacing: -5px;
    }


    .break-next, .break-countdown, .break-sponsors {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .anim-break-next-enter-active, .anim-break-next-leave-active {
        transition: all .5s ease;
        overflow: hidden;
    }
    .anim-break-next-enter, .anim-break-next-leave-to {
        max-height: 0;
        opacity: 0;
        padding: 0 20px;
    }
    .anim-break-next-enter-to, .anim-break-next-leave {
        max-height: 200px;
        opacity: 1;
    }

    .a--match-enter-active, .a--match-leave-active, .a--match-move { transition: all .5s ease; overflow: hidden; }
    .a--match-enter, .a--match-leave-to { max-height: 0; padding: 0 !important; }
    .a--match-enter-to, .a--match-leave { max-height: 180px; }

    .break-content {
        display: flex;
        box-sizing: content-box;
        width: 100%;
        height: 100%;
    }

    .break-standings {
        /*background-color: rgba(0,0,0,0.2);*/
        overflow: hidden;
    }

    /*.break-content-enter-active, .break-content-leave-active { transition: all .5s ease-in-out; overflow: hidden }*/
    /*.break-content-enter, .break-content-leave-to { max-height: 0; padding: 0 40px; }*/
    /*.break-content-enter-to, .break-content-leave { max-height: 100%; }*/

    .break-content-enter-active, .break-content-leave-active { transition: all .35s ease; overflow: hidden }
    .break-content-enter { clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%); }
    .break-content-leave-to { clip-path: polygon(0 0, 0 0, 0 100%, 0% 100%); }
    .break-content-enter-to, .break-content-leave { clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%); }

    .overlay[data-broadcast="resurge-4v4"] .break-main {
        margin-top: 50px;
    }
    .overlay[data-broadcast="resurge-4v4"] .break-center {
        padding: 60px 160px
    }
    .break-image {
        /*background-color: rgba(0,0,0,0.2);*/
        padding: 40px;
    }
    .break-image-inner {
        width: 100%;
        height: 100%;
        /*background-size: contain;*/
        background-size: 1040px;
        background-position: center;
        background-repeat: no-repeat;
    }

    .break-preload {
        opacity: 0;
        max-width: 0px;
        max-height: 0px;
        overflow: hidden;
    }

    .break-bracket {
        zoom: 0.85;
        overflow: hidden;
    }

    .countdown-text {
        text-transform: uppercase;
        font-size: 36px;
        font-weight: bold;
        height: 90px;
        display: flex;
        justify-content: center;
        align-items: center;
        transform: translateY(30px);
    }
    .break-others {
        /*padding: 40px;*/ /* this should be set but the animation is worse */
    }
    .broadcast-previews {
        display: flex;
        width: 100%;
        height: 100%;
        justify-content: center;
        align-items: center;
    }
    .broadcast-preview:first-of-type { margin-left: 0; }
    .broadcast-preview:last-of-type { margin-right: 0; }

    .broadcast-previews-title {
        text-transform: uppercase;
        font-weight: bold;
        font-size: 60px;
        line-height: 1;
    }
    .broadcast-mid-split-enter-active {
        overflow: hidden;
        max-width: 100%;
        transition: all 800ms ease;
    }
    .broadcast-mid-split-leave-active {
        overflow: hidden;
        max-width: 100%;
        transition: opacity 0s;
    }
    .broadcast-mid-split-enter {
        /*clip-path: polygon(0 0, 0 0, 0 100%, 0% 100%);*/
        /*clip-path: polygon(0% 0%, 0% 100%, 0% 100%, 0% 0, 100% 0, 100% 100%, 100% 100%, 100% 0%);*/
        clip-path: polygon(50% 0, 50% 100%, 50% 100%, 50% 1%, 50% 0%, 50% 100%, 50% 100%, 50% 0);
    }
    .broadcast-mid-split-enter-to {
        /*clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);*/
        /*clip-path: polygon(0% 0%, 0% 100%, 50% 100%, 50% 0, 50% 0, 50% 100%, 100% 100%, 100% 0%); */
        clip-path: polygon(0% 0, 0% 100%, 50% 100%, 50% 0%, 50% 0%, 50% 100%, 100% 100%, 100% 0);
    }

    .broadcast-mid-split-leave-to {
        opacity: 0;
    }
</style>

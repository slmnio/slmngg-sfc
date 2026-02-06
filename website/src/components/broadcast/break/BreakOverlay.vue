<template>
    <div class="break-overlay">
        <div class="break-center">
            <ThemeTransition
                class="break-transition-top w-100 h-100"
                :theme="event && event.theme"
                :active="animationActive"
                one-color
                start="middle"
                end="middle"
                :duration="500"
                :starting-delay="0">
                <div class="break-top event-theme-border flex-center overlay--bg px-4" :style="eventBorder">
                    <Squeezable align="middle" :disabled="(overlayTitle).includes('\\n')" class="w-100 flex-center">
                        <transition name="fade" mode="out-in">
                            <span
                                :key="overlayTitle"
                                class="industry-align"
                                :class="{'has-br': (overlayTitle).includes('\\n') }"
                                v-html="nbr(overlayTitle)"></span>
                        </transition>
                        <BreakHeadlines
                            v-if="broadcast.use_headlines"
                            :headlines="headlines"
                            title="News"
                            :interval="headlineInterval"
                            :border-c-s-s="eventBorder" />
                    </Squeezable>
                </div>
            </ThemeTransition>
            <div class="break-area w-100 h-100 d-flex">
                <ThemeTransition
                    class="break-transition-left h-100"
                    :theme="event && event.theme"
                    :active="animationActive"
                    one-color
                    start="top"
                    end="bottom"
                    :starting-delay="350"
                    :inner-delay="150"
                    :duration="500">
                    <div class="break-main event-theme-border overlay--bg" :style="eventBorder">
                        <div class="break-col break-left-col" :class="{'counting-down': !!broadcast.countdown_end}">
                            <transition name="anim-break-next">
                                <div v-if="nextMatch" class="break-next">
                                    <BreakMatch
                                        :match="nextMatch"
                                        :expanded="false"
                                        :theme-color="themeColor"
                                        :broadcast="broadcast"
                                        :event="event"
                                    />
                                </div>
                            </transition>
                            <transition name="anim-break-next">
                                <!-- TODO: make this mirror the actual countdown, handling the not-starting-on-zero thing -->
                                <div v-if="!countdownEnd && !nextMatch" class="countdown-text">Current time</div>
                            </transition>
                            <Countdown
                                class="break-countdown"
                                :to="countdownEnd"
                                :timezone="broadcast.timezone"
                                :update="(e) => countdownTick(e)" />
                            <Sponsors class="break-sponsors" :sponsors="sponsorThemes" />
                        </div>
                    </div>
                </ThemeTransition>
                <ThemeTransition
                    class="break-transition-main h-100"
                    :theme="event && event.theme"
                    :active="animationActive"
                    one-color
                    start="top"
                    end="bottom"
                    :starting-delay="350"
                    :inner-delay="150"
                    :duration="500">
                    <BreakContent :force-gfx-small="true" v-bind="{ broadcast, customBreakAutomation, virtualMatch, title, lastCountdownTick }" />
                </ThemeTransition>
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import BreakMatch from "@/components/broadcast/break/BreakMatch";
import { sortMatches } from "@/utils/sorts";
import Sponsors from "@/components/broadcast/Sponsors";
import Countdown from "@/components/broadcast/Countdown";
import BreakHeadlines from "@/components/broadcast/break/BreakHeadlines";
import { themeBackground1 } from "@/utils/theme-styles";
import { resizedImage } from "@/utils/images";
import ThemeTransition from "@/components/broadcast/ThemeTransition";
import Squeezable from "@/components/broadcast/Squeezable.vue";
import BreakContent from "@/components/broadcast/break/BreakContent.vue";

const tickTime = 25;

export default {
    name: "BreakOverlay",
    components: {
        BreakContent,
        Squeezable,
        BreakHeadlines,
        BreakMatch,
        Sponsors,
        Countdown,
        ThemeTransition
    },
    props: ["broadcast", "title", "animationActive", "secondary", "headlineInterval", "virtualMatch", "customBreakAutomation"],
    data: () => ({
        tick: 0,
        lastCountdownTick: 0
    }),
    computed: {
        nextMatch() {
            if (this.virtualMatch) return this.virtualMatch;
            if (!this.broadcast?.live_match || !this.broadcast.show_live_match) return null;
            return ReactiveRoot(this.broadcast.live_match[0], {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                })
            });
        },
        fullSchedule() {
            if (this.virtualMatch) return [this.virtualMatch];
            if (!this.broadcast?.schedule) return null;
            return ReactiveArray("schedule", {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                })
            })(this.broadcast).sort(sortMatches);
        },
        schedule() {
            if (!this.broadcast?.schedule || !this.fullSchedule) return null;
            return this.fullSchedule.filter(m => {
                return this.secondary ? m.show_on_secondary_overlays : m.show_on_overlays;
            }).sort(sortMatches);
        },
        event() {
            if (!this.broadcast?.event) return null;
            const event = ReactiveRoot(this.broadcast.event.id, {
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

            if (this.broadcast?.theme_override?.id) {
                return {
                    ...event,
                    theme: this.broadcast.theme_override
                };
            }
            return event;
        },
        sponsorThemes() {
            if (!this.broadcast?.sponsors) return null;
            return ReactiveArray("sponsors", {
                theme: ReactiveThing("theme")
            })(this.broadcast);
        },
        eventBorder() {
            if (!this.event?.theme) return null;
            return {
                borderColor: this.event.theme.color_theme
            };
        },
        breakDisplay() {
            if (!this.broadcast?.break_display) return null;
            return this.broadcast.break_display;
        },
        headlines() {
            return (this.broadcast?.headlines || []).filter(b => b.ready);
        },
        themeColor() {
            return themeBackground1(this.event);
        },
        countdownEnd() {
            return this.virtualMatch?._virtual_break_end || this.broadcast?.countdown_end;
        },
        matchIsLast() {
            if (!this.schedule?.length) return true; // no schedule - assume last
            if (!this.nextMatch?.first_to) return false; // no match - assume others??

            // TODO: this logic doesn't make much sense. it should check if any match has completed, rather than the order in the schedule

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
            if (this.virtualMatch) return this.autoTitle || this.broadcast?.event?.name;
            const titleWithAuto = title.replace("{auto}", this.autoTitle);
            if (!titleWithAuto || titleWithAuto.trim().length === 0) return title; // make sure we have something here
            return titleWithAuto;
        }
    },
    methods: {
        nbr(text) {
            if (!text) return "";
            return text.replace(/\\n/g, "<br>");
        },
        countdownTick(x) {
            this.lastCountdownTick = x;
        },
        resizedImage,
        hasStaff(matches) {
            return matches.some(match => (match.casters || [])?.length || (match.player_relationships || [])?.length);
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
    },
    head() {
        return {
            title: `Break ${this.secondary ? " (Secondary)" : ""}| ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
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
    padding: 120px 180px;

    font-family: "SLMN-Industry", "Industry", sans-serif;
}

span.industry-align {
    transform: var(--overlay-line-height-adjust, translate(0, -0.0925em));
    --translate-y: -0.0925em;
}

.break-center {
    width: 100%;
    height: 100%;
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
    /*margin-top: 80px;*/
    flex-grow: 1;

    /*height: 0;*/
    display: flex;

    height: 100%;
    margin-top: 0;
}

.break-col {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    width: 100%;
    height: 100%;
    padding: 20px;
}

.break-left-col {
    flex-shrink: 0;
    /* border-right: 1px solid rgba(255,255,255,0.2); */
    padding: 5px 20px;
}

.break-left-col,
.break-transition-left {
    width: 460px;
}


.break-next {
    width: 100%;
    padding: 20px;
    /*padding: 10px 0 15px 0px;*/
}


.break-countdown {
    font-size: 156px;
    font-weight: bold;
    flex-grow: 1;
    height: 0;
    /*letter-spacing: -5px;*/
}


.break-next, .break-countdown, .break-sponsors {
    display: flex;
    justify-content: center;
    align-items: center;
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

.break-transition-top {
    height: 160px !important;
}

.break-area {
    margin-top: 60px;
    gap: 40px;
    max-height: 620px;
}

.break-transition-main {
    flex-grow: 1;
    overflow: hidden;
}
</style>

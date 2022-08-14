<template>
    <div class="break-bar-overlay" :style="eventCSS">

<!--        <div class="upper-bar">-->
<!--            <transition name="seg" mode="out-in">-->
<!--                <div class="segment-wrapper" v-if="showBigSegment('Bracket')" :key="'Bracket'">-->
<!--                    <div class="overlay&#45;&#45;bg bar-segment segment-bracket">-->
<!--                        <Bracket class="segment-bracket-inner" :event="event" :bracket="bracket" use-overlay-scale small :scale="0.6" />-->
<!--                    </div>-->
<!--                </div>-->

<!--                <div class="segment-wrapper" v-if="showBigSegment('Schedule')" :key="'Schedule'">-->
<!--                    <div class="overlay&#45;&#45;bg bar-segment segment-schedule flex-column">-->
<!--                        <BreakMatch v-for="match in schedule" :timezone="broadcast.timezone" :match="match" :expanded="true" v-bind:key="match.id" :theme-color="themeColor" />-->
<!--                    </div>-->
<!--                </div>-->
<!--            </transition>-->
<!--        </div>-->


        <div class="lower-bar">
            <!--            <transition-group name="seg" is="div" class="break-bar" :style="eventCSS">-->
            <transition name="seg">
                <div class="segment-wrapper" v-if="showSegment('Sponsors') && sponsorThemes" :key="'Sponsors'">
                    <div class="overlay--bg bar-segment segment-sponsors">
                        <Sponsors class="break-sponsors" :sponsors="sponsorThemes" />
                    </div>
                </div>
            </transition>

            <div class="segment-wrapper segment-spacer flex-grow-1"></div>

            <transition name="seg">
                <div class="segment-wrapper" v-if="showSegment('Title') && (title || (broadcast && broadcast.title))" :key="'Title-' + (title || broadcast.title)">
                    <div class="overlay--bg bar-segment segment-title">
                        <span class="segment-text" v-html="nbr(title || broadcast.title)"
                        v-bind:class="{'has-br': (title || broadcast.title || '').includes('\\n')}"></span>
                    </div>
                </div>
            </transition>
            <transition name="seg">
                <div class="segment-wrapper" v-if="showSegment('Next match') && nextMatch" :key="'Next match'">
                    <div class="overlay--bg bar-segment segment-next-match">
                        <BreakMatch :match="nextMatch" :expanded="false" :theme-color="themeColor" />
                    </div>
                </div>
            </transition>
            <transition name="seg">
                <div class="segment-wrapper" v-if="showSegment('Countdown')" :key="'Countdown'">
                    <div class="overlay--bg bar-segment segment-countdown flex-center flex-column">
                        <div class="segment-title">
                            <span class="industry-align">
                                {{ countdownText }}
                            </span>
                        </div>
                        <div class="segment-text">
                            <Countdown :timezone="broadcast.timezone" :to="broadcast.countdown_end"/>
                        </div>
                    </div>
                </div>
            </transition>

            <transition name="seg">
                <div class="segment-wrapper" v-if="showSegment('Event logo') && event && event.theme" :key="'Event logo'">
                    <div class="overlay--bg bar-segment segment-event-logo p-2" :style="eventLogoBackground">
                        <div :style="resizedImage(event.theme, ['default_logo'], 'h-200')"
                             class="segment-image bg-center w-100 h-100"></div>
                    </div>
                </div>
            </transition>
            <!--            </transition-group>-->
        </div>

        <div class="break-preload">
            <Bracket class="segment-bracket-inner" :event="event" :bracket="bracket" use-overlay-scale small :scale="0.6" />
            <BreakMatch v-for="match in schedule" :timezone="broadcast.timezone" :match="match" :expanded="true" v-bind:key="match.id" :theme-color="themeColor" />
        </div>

    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import Countdown from "@/components/broadcast/Countdown";
import BreakMatch from "@/components/broadcast/break/BreakMatch";
import { themeBackground1 } from "@/utils/theme-styles";
import Sponsors from "@/components/broadcast/Sponsors";
import Bracket from "@/components/website/bracket/Bracket";
import { sortMatches } from "@/utils/sorts";
import { resizedImage } from "@/utils/images";

export default {
    name: "BreakBarOverlay",
    props: ["broadcast", "title"],
    components: { Countdown, BreakMatch, Sponsors, Bracket },
    computed: {
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
        eventLogoBackground() {
            if (!this.event || !this.event.theme) return {};
            return {
                backgroundColor: this.event.theme.color_logo_background,
                borderColor: this.event.theme.color_logo_accent
            };
        },
        segments() {
            if (!this.broadcast || !this.broadcast.bar_options) return [];
            return this.broadcast.bar_options;
        },
        eventCSS() {
            if (!this.event || !this.event.theme) return null;
            return {
                "--event": this.event.theme.color_theme
            };
        },
        nextMatch() {
            if (!this.broadcast || !this.broadcast.live_match || !this.broadcast.show_live_match) return null;
            return ReactiveRoot(this.broadcast.live_match[0], {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                })
            });
        },
        schedule() {
            if (!this.broadcast || !this.broadcast.schedule) return null;
            return ReactiveArray("schedule", {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                })
            })(this.broadcast).filter(m => {
                return m.show_on_overlays;
            }).sort(sortMatches);
        },
        themeColor() {
            if (!this.event || !this.event.theme) return {};
            return themeBackground1(this.event);
        },
        sponsorThemes() {
            if (!this.broadcast || !this.broadcast.sponsors) return null;
            return ReactiveArray("sponsors", {
                theme: ReactiveThing("theme")
            })(this.broadcast);
        },
        bracket() {
            if (!this.event?.brackets) return null;
            if (!this.bracketKey) return this.event.brackets[0];
            const bracket = this.event.brackets.find(b => b && b.key === this.bracketKey);
            return bracket || this.event.brackets[0];
        },
        countdownText() {
            if (!this.broadcast.countdown_end) return "LOCAL TIME";
            if (this.schedule && this.schedule.filter(s => [s.score_1, s.score_2].some(_s => _s)).length === 0) { return "STARTING IN"; }
            return "BACK IN";
        }
    },
    watch: {
        broadcast() {
            if (this.broadcast) {
                document.body.dataset.broadcast = this.broadcast.key;
            }
        }
    },
    methods: {
        showSegment(segmentName) {
            return this.segments.indexOf(segmentName) !== -1;
        },
        showBigSegment(segmentName) {
            return (this.broadcast.break_display === segmentName);
        },
        resizedImage,
        nbr(text) {
            if (!text) return "";
            return text.replace(/\\n/g, "<br>");
        }
    },
    metaInfo() {
        return {
            title: `Break Bar | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

<style scoped>
    .break-bar-overlay {
        position: absolute;
        overflow: hidden;

        height: 100%;
        width: 100%;
        color: white;

        font-family: "SLMN-Industry", "Industry", sans-serif;

        /*background-image: url("https://cdn.discordapp.com/attachments/485493459357007876/881082194095902730/unknown.png");*/

        padding: 40px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
    }

    span.industry-align {
        transform: var(--overlay-line-height-adjust, translate(0, -0.0925em));
    }

    .lower-bar {
        width: 100%;
        height: 200px;
        /*background: #222;*/
        box-sizing: border-box;
        display: flex;
        justify-content: flex-end;
        align-items: center;
    }

    .upper-bar {
        width: 100%;
        height: 400px;
        box-sizing: border-box;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        margin-bottom: 40px;
    }

    .bar-segment {
        margin: 0 .25em;
        border-bottom: 6px solid var(--event, #fff);
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #333;
        padding: 0 .5em;
    }

    .segment-countdown {
        min-width: 330px;
    }
    .segment-countdown .segment-title {
        font-size: 3em;
        line-height: 1;
    }
    .segment-countdown .countdown {
        line-height: 1;
        font-size: 7em;
        letter-spacing: -5px;
        font-weight: bold;
    }

    .segment-event-logo {
        width: 200px;
    }

    .segment-wrapper {
        height: 100%;
        overflow: hidden;
    }
    .segment-next-match {
        min-width: 330px;
    }
    .segment-next-match >>> .match-teams {
        min-width: 410px;
    }
    .segment-next-match >>> .break-match[data-center="vs"] .match-teams {
        min-width: 330px;
    }

    .segment-sponsors {
        width: 420px;
        padding: 0;
    }
    .segment-sponsors >>> .break-sponsors {
        padding: 0;
        height: 100%;
    }
    .segment-sponsors >>> .sponsors-holder {
        height: 100%;
    }
    .segment-sponsors >>> .break-sponsor-logo {
        width: calc(100% - 2em) !important;
    }

    .segment-bracket {
        padding: 0 1em;
        overflow: hidden;
    }
    .segment-bracket-inner {
        display: flex;
        flex-direction: column;
    }
    .segment-schedule {
        padding: 0 1em;
        min-width: 500px;
    }
    .segment-schedule >>> .break-match {
        font-size: 25px;
    }

    .seg-enter-active { transition: max-width 2000ms ease; }
    .seg-leave-active { transition: max-width 500ms ease; }
    .seg-enter, .seg-leave-to { max-width: 0; }
    .seg-enter-to, .seg-leave { max-width: 100%; }

    .break-preload {
        opacity: 0;
        max-width: 0px;
        max-height: 0px;
        overflow: hidden;
    }
    .segment-title .segment-text {
        text-transform: uppercase;
        text-align: center;
        font-size: 60px;
        font-weight: bold;
        line-height: 1;
        white-space: nowrap;
        overflow: hidden;
        padding: 0 0.25em;
    }
    .segment-text.has-br {
        font-size: 40px;
    }
</style>

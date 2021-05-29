<template>
    <div class="break-overlay">
        <div class="break-center">
            <div class="break-top event-theme-border flex-center" :style="eventBorder">
                <transition name="fade" mode="out-in">
                    <span class="industry-align" :key="broadcast.name">{{ broadcast.name }}</span>
                </transition>
            </div>
            <div class="break-main event-theme-border" :style="eventBorder">
                <div class="break-col break-left-col">
                    <transition name="anim-break-next">
                        <div class="break-next" v-if="nextMatch">
                            <BreakMatch :match="nextMatch" :expanded="false" />
                        </div>
                    </transition>
                    <Countdown class="break-countdown" :to="broadcast.countdown_end" />
                    <Sponsors class="break-sponsors" :sponsors="sponsorThemes" />
                </div>
                <transition name="break-content" mode="out-in">
                    <transition-group class="break-col break-schedule" name="a--match" v-if="breakDisplay === 'Schedule'" key="Schedule">
                        <BreakMatch v-for="match in schedule" :timezone="broadcast.timezone" :match="match" :expanded="true" v-bind:key="match.id" />
                    </transition-group>
                    <div class="break-col break-standings" v-if="breakDisplay === 'Standings'" key="Standings">
                        <Standings :event="event" :stage="broadcast.current_stage" />
                    </div>
                    <div class="break-col break-image" v-if="breakDisplay === 'Image'" key="Image">
                        <div class="break-image-inner" :style="cssImage('backgroundImage', broadcast, ['break_image'], 1080, false)"></div>
                    </div>
                    <Bracket class="break-col break-bracket" v-if="breakDisplay === 'Bracket'" key="Bracket" :event="event" :bracket="bracket" use-overlay-scale />
                </transition>
            </div>
        </div>
        <div class="break-preload">
            <BreakMatch v-for="match in schedule" :timezone="broadcast.timezone" :match="match" :expanded="true" v-bind:key="match.id" />
            <Standings :event="event" :stage="broadcast.current_stage" />
            <div class="break-image-inner" :style="cssImage('backgroundImage', broadcast, ['break_image'], 1080, false)"></div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import BreakMatch from "@/components/broadcast/BreakMatch";
import { cssImage } from "@/utils/content-utils";
import { sortMatches } from "@/utils/sorts";
import Sponsors from "@/components/broadcast/Sponsors";
import Standings from "@/components/broadcast/Standings";
import Countdown from "@/components/broadcast/Countdown";
import Bracket from "@/components/website/Bracket";

export default {
    name: "BreakOverlay",
    props: ["broadcast"],
    components: { Bracket, Standings, BreakMatch, Sponsors, Countdown },
    methods: { cssImage },
    computed: {
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
        event() {
            if (!this.broadcast || !this.broadcast.event) return null;
            return ReactiveRoot(this.broadcast.event[0], {
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
        bracket() {
            if (!this.event?.brackets) return null;
            if (!this.bracketKey) return this.event.brackets[0];
            const bracket = this.event.brackets.find(b => b && b.key === this.bracketKey);
            return bracket || this.event.brackets[0];
        }
    },
    watch: {
        broadcast() {
            if (this.broadcast) {
                document.body.dataset.broadcast = this.broadcast.key;
            }
        }
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
    }
    .break-schedule {
        flex-grow: 1;
        padding: 20px 40px;
        box-sizing: border-box;
        /*justify-content: space-evenly;*/
        overflow: hidden;
        background-color: rgba(0,0,0,0.2);
    }
    .break-next {
        width: 100%;
        padding: 20px;
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
    .a--match-enter-to, .a--match-leave { max-height: 100px; }

    .break-content {
        display: flex;
        box-sizing: content-box;
        width: 100%;
        height: 100%;
    }

    .break-standings {
        background-color: rgba(0,0,0,0.2);
        padding: 40px;
    }

    .break-content-enter-active, .break-content-leave-active { transition: all .5s ease-in-out; overflow: hidden }
    .break-content-enter, .break-content-leave-to { max-height: 0; padding: 0 40px; }
    .break-content-enter-to, .break-content-leave { max-height: 100%; }

    .overlay[data-broadcast="resurge-4v4"] .break-main {
        margin-top: 50px;
    }
    .overlay[data-broadcast="resurge-4v4"] .break-center {
        padding: 60px 160px
    }
    .break-image {
        background-color: rgba(0,0,0,0.2);
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
        zoom: 0.9;
    }
</style>

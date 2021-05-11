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
                    <div class="break-countdown">
                        <span class="industry-align">88:88</span>
                    </div>
                    <Sponsors class="break-sponsors" :sponsors="sponsorThemes" />
                </div>
                <transition-group class="break-col break-schedule" name="a--match">
                        <BreakMatch v-for="match in schedule" :timezone="broadcast.timezone" :match="match" :expanded="true" v-bind:key="match.id" />
                </transition-group>
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import BreakMatch from "@/components/broadcast/BreakMatch";
import { cssImage } from "@/utils/content-utils";
import { sortMatches } from "@/utils/sorts";
import Sponsors from "@/components/broadcast/Sponsors";

export default {
    name: "BreakOverlay",
    props: ["broadcast"],
    components: { BreakMatch, Sponsors },
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
                theme: ReactiveThing("theme")
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
    }
    .break-left-col {
        width: 480px;
        flex-shrink: 0;
        border-right: 1px solid white;
    }
    .break-schedule {
        flex-grow: 1;
        padding: 20px;
        box-sizing: border-box;
        /*justify-content: space-evenly;*/
        overflow: hidden;
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
</style>

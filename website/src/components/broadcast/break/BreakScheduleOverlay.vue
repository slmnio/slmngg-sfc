<template>
    <div class="break-schedule-overlay d-flex overlay--text-on-bg">
        <div class="left-logo-block flex-center flex-column">
            <div class="event-logo bg-center" :style="eventLogo"></div>
            <div class="lower-text">
                <div class="break-text">
                    <transition name="fade" mode="out-in">
                        <span
                            :key="overlayTitle"
                            class="industry-align"
                            :class="{'has-br': (overlayTitle).includes('\\n') }"
                            v-html="nbr(overlayTitle)"></span>
                    </transition>
                </div>
                <transition name="fade" mode="out-in">
                    <Countdown :key="broadcast.countdown_end" :to="broadcast.countdown_end" />
                </transition>
            </div>
            <div v-if="showSponsors" class="break-sponsors-holder">
                <Sponsors class="break-sponsors" :sponsors="sponsorThemes" />
            </div>
        </div>
        <div class="right-schedule-block">
            <div class="schedule-title">Schedule</div>
            <div class="schedule">
                <transition-group name="a--match">
                    <ScheduleTextItem
                        v-for="match in schedule"
                        :key="match.id"
                        class="schedule-item"
                        :match="match"
                        :broadcast="broadcast" />
                </transition-group>
            </div>
        </div>
    </div>
</template>
<script>
import { resizedImage } from "@/utils/images";
import Countdown from "@/components/broadcast/Countdown.vue";
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import { sortMatches } from "@/utils/sorts";
import { formatTime } from "@/utils/content-utils";
import ScheduleTextItem from "@/components/broadcast/break/ScheduleTextItem.vue";
import Sponsors from "@/components/broadcast/Sponsors.vue";

export default {
    name: "BreakScheduleOverlay",
    components: { Sponsors, ScheduleTextItem, Countdown },
    props: ["broadcast", "title", "showSponsors"],
    computed: {
        eventLogo() {
            return resizedImage(this.broadcast?.event?.theme, ["allmode_logo", "default_wordmark", "default_logo"], "w-1920");
        },
        overlayTitle() {
            return this.title || this.broadcast?.title || "";
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
            return this.fullSchedule.filter(m => m.show_on_overlays).sort(sortMatches);
        },
        sponsorThemes() {
            if (!this.broadcast?.sponsors) return null;
            return ReactiveArray("sponsors", {
                theme: ReactiveThing("theme")
            })(this.broadcast);
        }
    },
    methods: {
        formatTime,
        nbr(text) {
            if (!text) return "";
            return text.replace(/\\n/g, "<br>");
        }
    }
};
</script>
<style scoped>
    .break-schedule-overlay {
        width: 100vw;
        height: 100vh;
    }
    .left-logo-block {
        width: 60%;
    }
    .event-logo {
        width: 80%;
        height: 50%
    }
    .lower-text {
        font-size: 6em;
        font-weight: bold;
        text-transform: uppercase;
        text-align: center;
        line-height: 1;
    }
    .lower-text .countdown {
        font-size: 0.8em;
    }
    .right-schedule-block {
        padding: 1em;
        font-size: 42px;
        width: 40%;
        display: flex;
        flex-direction: column;
        padding-top: 2em;
    }

    .schedule {
        display: flex;
        flex-direction: column;
        gap: 0.5em;
    }

    .schedule-title {
        font-weight: bold;
        text-transform: uppercase;
        font-size: 2em;
    }

    .a--match-enter-active, .a--match-leave-active, .a--match-move {
        transition: all .5s ease;
        overflow: hidden;
    }

    .a--match-enter-from, .a--match-leave-to {
        max-height: 0;
        padding: 0 !important;
    }

    .a--match-enter-to, .a--match-leave-from {
        max-height: 230px;
    }
    .break-sponsors-holder {
        width: 420px;
    }
</style>

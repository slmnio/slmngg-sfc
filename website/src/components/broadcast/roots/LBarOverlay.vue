<template>
    <div class="l-bar-overlay">
        <div class="left-bar flex-center flex-column text-center">
            <div class="countdown-group flex-center flex-column" :style="themeColor">
                <transition name="fade" mode="out-in" class="countdown-text" tag="div">
                    <span :key="countdownText" class="industry-align">
                        {{ countdownText }}
                    </span>
                </transition>
                <div class="countdown-timer">
                    <Countdown :timezone="broadcast?.timezone" :to="broadcast?.countdown_end"/>
                </div>
            </div>
            <div class="schedule flex-grow-1 flex-center flex-column">
                <BreakMatch v-for="match in schedule" :timezone="broadcast?.timezone" :match="match"
                            :expanded="false" :key="match.id" :theme-color="themeColor" />
            </div>
        </div>
        <div class="content">

        </div>
        <div class="bottom-left-bar">
            <ThemeLogo :theme="broadcast?.event?.theme" class="event-logo w-100 h-100" icon-padding="75px" logo-size="w-500" border-width="0"/>
        </div>
        <div class="lower-bar overlay--bg title flex-center text-center">
            <transition name="fade" mode="out-in">
                        <span class="title-text" v-html="nbr(title || broadcast.title)" :key="title || broadcast.title"
                              :class="{'has-br': (title || broadcast.title || '').includes('\\n')}"></span>
            </transition>
        </div>
    </div>
</template>

<script>
import ThemeLogo from "@/components/website/ThemeLogo.vue";
import BreakMatch from "@/components/broadcast/break/BreakMatch.vue";
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import { sortMatches } from "@/utils/sorts";
import { themeBackground1 } from "@/utils/theme-styles";
import Countdown from "@/components/broadcast/Countdown.vue";

export default {
    name: "LBarOverlay",
    components: { Countdown, BreakMatch, ThemeLogo },
    props: {
        broadcast: {},
        client: {},
        virtualMatch: {},
        title: String
    },
    computed: {
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
        themeColor() {
            return themeBackground1(this.broadcast?.event);
        },
        countdownText() {
            if (!this.broadcast.countdown_end) return "LOCAL TIME";
            if (this.schedule && this.schedule.filter(s => [s.score_1, s.score_2].some(_s => _s)).length === 0) { return "STARTING IN"; }
            return "BACK IN";
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
    .l-bar-overlay {
        display: grid;
        height: 100vh;
        width: 100vw;

        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(2, 1fr);
    }


    .content {
        --content-width: 1504px;
        width: var(--content-width);
        height: calc(var(--content-width) * (9 / 16));
    }

    .countdown-group {
        width: 100%;
        font-size: 48px;
        line-height: 1;
        padding: 0.25em 0
    }
    .countdown-group .countdown-timer {
        font-size: 2.5em;
    }
    .schedule {
        gap: 1em;
    }
    .title-text.has-br {
        font-size: 80px;
        line-height: 1.2;
    }
    .title-text {
        font-size: 120px;
        line-height: 1.2;
    }
</style>

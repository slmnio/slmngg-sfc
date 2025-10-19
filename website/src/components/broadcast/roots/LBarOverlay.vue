<template>
    <div class="l-bar-overlay">
        <div class="left-bar flex-center flex-column text-center" :style="boxColours">
            <div class="countdown-group flex-center flex-column" :class="{'counting-down': !!broadcast.countdown_end}" :style="themeColor">
                <transition name="fade" mode="out-in" class="countdown-text" tag="div">
                    <span :key="countdownText" class="industry-align">
                        {{ countdownText }}
                    </span>
                </transition>
                <div class="countdown-timer">
                    <Countdown :timezone="broadcast?.timezone" :to="broadcast?.countdown_end" />
                </div>
            </div>
            <div class="schedule flex-grow-1 flex-center flex-column">
                <BreakMatch
                    v-for="match in schedule"
                    :key="match.id"
                    :timezone="broadcast?.timezone"
                    :match="match"
                    :expanded="false"
                    :times="true"
                    :theme-color="themeColor"
                    :small-names="true"
                    :show-first-to="showFirstToUpcoming"
                    :broadcast="broadcast"
                />
            </div>
        </div>
        <div class="content">
        </div>
        <div class="bottom-left-bar">
            <ThemeLogo
                :theme="broadcast?.event?.theme"
                class="event-logo w-100 h-100"
                icon-padding="75px"
                logo-size="w-500"
                border-width="0" />
        </div>
        <div class="lower-bar overlay--bg title flex-center text-center" :style="boxColours">
            <Squeezable align="middle" :disabled="(overlayTitle)?.includes('\\n')" class="w-100 flex-center">
                <transition name="fade" mode="out-in">
                    <span
                        :key="overlayTitle"
                        class="title-text industry-align"
                        :class="{'has-br': (overlayTitle || '')?.includes('\\n')}"
                        v-html="nbr(overlayTitle)"></span>
                </transition>
            </Squeezable>
            <div v-if="showSponsors" class="l-bar-sponsors-holder flex-center">
                <Sponsors class="l-bar-sponsors" :sponsors="sponsorThemes" :mode="sponsorAnimationMode" />
            </div>
        </div>
    </div>
</template>

<script>
import ThemeLogo from "@/components/website/ThemeLogo.vue";
import BreakMatch from "@/components/broadcast/break/BreakMatch.vue";
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import { sortMatches } from "@/utils/sorts";
import { logoBackground1, themeBackground1 } from "@/utils/theme-styles";
import Countdown from "@/components/broadcast/Countdown.vue";
import Sponsors from "@/components/broadcast/Sponsors.vue";
import Squeezable from "@/components/broadcast/Squeezable.vue";

export default {
    name: "LBarOverlay",
    components: { Squeezable, Countdown, BreakMatch, ThemeLogo, Sponsors },
    props: {
        broadcast: {},
        client: {},
        virtualMatch: {},
        title: String,
        showSponsors: String,
        secondary: Boolean,
        sponsorAnimationMode: String
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
            if (this.schedule && this.schedule.filter(s => [s.score_1, s.score_2].some((_s) => _s)).length === 0) { return "STARTING IN"; }
            return "BACK IN";
        },
        showFirstToUpcoming() {
            return (this.broadcast?.broadcast_settings || []).includes("Show first to on upcoming match");
        },
        sponsorThemes() {
            if (!this.broadcast?.sponsors) return null;
            return ReactiveArray("sponsors", {
                theme: ReactiveThing("theme"),
            })(this.broadcast);
        },
        overlayTitle() {
            return this.title || this.broadcast?.title;
        },
        boxColours() {
            return {
                backgroundColor: this.broadcast?.event?.theme?.color_body || "#333333",
                color: this.broadcast?.event?.theme?.color_text_on_body || "#ffffff",
            };
        }
    },
    methods: {
        nbr(text) {
            if (!text) return "";
            return text.replace(/\\n/g, "<br>");
        },
        getTeamStyle(team) {
            return {
                ...logoBackground1(team),
            };
        },
    },
    head() {
        return {
            title: `L-Bar ${this.secondary ? " (Secondary)" : ""}| ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
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
        --content-width: 1504px;
        --content-height: calc(var(--content-width) * 9/16);
        --left-bar-width: calc(100vw - var(--content-width));
        --lower-bar-height: calc(100vh - var(--content-height))
    }

    .content {
        width: var(--content-width);
        height: var(--content-height);
    }

    .l-bar-sponsors-holder {
        width: var(--left-bar-width);
        height: var(--lower-bar-height);
        flex-shrink: 0;
    }
    .l-bar-sponsors {
        width: 100%;
        height: 100%;
        padding: 0;
    }
    .l-bar-sponsors-holder:deep(.sponsors-holder) {
        height: 100% !important;
    }
    .l-bar-sponsors-holder:deep(.break-sponsor-logo) {
        width: 75%;
        height: 75%;
    }

    .left-bar {
        width: var(--left-bar-width);
        height: var(--content-height)
    }
    .lower-bar {
        width: var(--content-width);
        height: var(--lower-bar-height)
    }
    .bottom-left-bar {
        width: var(--left-bar-width);
        height: var(--lower-bar-height)
    }

    .countdown-group {
        width: 100%;
        font-size: 48px;
        line-height: 1;
        padding: 0.25em 0;
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
        padding: 0 0.25em;
        white-space: wrap;
    }
</style>

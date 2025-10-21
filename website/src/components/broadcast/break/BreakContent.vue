<template>
    <div class="break-main break-main-content event-theme-border overlay--bg" :style="eventBorder">
        <transition name="break-content" mode="out-in">
            <transition-group
                v-if="automatedShow === 'Schedule'"
                key="Schedule"
                class="break-col break-schedule"
                name="a--match"
                tag="div">
                <BreakMatch
                    v-for="match in schedule"
                    :key="match.id"
                    :timezone="broadcast.timezone"
                    :match="match"
                    :expanded="true"
                    :theme-color="themeColor" />
            </transition-group>
            <div
                v-else-if="automatedShow === 'Standings'"
                :key="`Standings-${currentStage || ''}`"
                class="break-col break-standings">
                <Standings :event="event" :stage="currentStage" />
            </div>
            <div
                v-else-if="automatedShow === 'Image'"
                :key="`image-${breakImageURL}`"
                class="break-col break-image">
                <div v-if="breakImageURL" class="break-image-inner" :style="breakImage"></div>
                <ThemeLogo
                    v-else
                    class="break-image-inner break-image-default"
                    :theme="event.theme"
                    icon-padding="10%"
                    border-width="0"
                    logo-size="h-500" />
            </div>
            <div
                v-else-if="automatedShow === 'Title'"
                :key="`title-${breakContentTitle}`"
                class="break-col break-title">
                <div :style="themeBG" class="break-title-inner" v-html="breakContentTitle"></div>
            </div>
            <Bracket
                v-else-if="automatedShow === 'Bracket'"
                :key="`Bracket-${bracket && bracket.key}`"
                class="break-col break-bracket"
                :event="event"
                :bracket="bracket"
                use-overlay-scale
                small
                :scale="0.85" />
            <div
                v-else-if="automatedShow === 'Other Streams'"
                key="Other-Streams"
                class="break-col break-others">
                <div class="broadcast-previews-title">
                    {{ otherBroadcasts.length === 1 ? otherBroadcasts[0].name : "Other broadcasts" }}
                </div>
                <div class="broadcast-previews">
                    <BroadcastPreview v-for="other in otherBroadcasts" :key="other.id" :broadcast="other" />
                </div>
            </div>
            <div v-else-if="automatedShow === 'Other Info'" key="Other-Info" class="break-col break-others-info">
                <OtherBroadcasts :starting-broadcast="broadcast" />
            </div>
            <BreakStaffList
                v-else-if="automatedShow === 'Staff'"
                key="Staff"
                class="break-col break-staff-list"
                :matches="staffSchedule" />
            <BreakMatchup
                v-else-if="automatedShow === 'Matchup'"
                :key="`Matchup-${nextMatch ? nextMatch.id : ''}`"
                class="break-col break-matchup"
                :match="nextMatch" />
        </transition>
    </div>
</template>

<script>
import BroadcastPreview from "@/components/broadcast/BroadcastPreview.vue";
import ThemeLogo from "@/components/website/ThemeLogo.vue";
import BreakStaffList from "@/components/broadcast/break/BreakStaffList.vue";
import Standings from "@/components/broadcast/Standings.vue";
import BreakMatchup from "@/components/broadcast/break/BreakMatchup.vue";
import Bracket from "@/components/website/bracket/Bracket.vue";
import OtherBroadcasts from "@/components/broadcast/OtherBroadcasts.vue";
import BreakMatch from "@/components/broadcast/break/BreakMatch.vue";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive.js";
import { themeBackground1 } from "@/utils/theme-styles.js";
import { sortMatches } from "@/utils/sorts.js";
import { resizedImage, resizedImageNoWrap } from "@/utils/images.js";

const tickTime = 20;

export default {
    name: "BreakContent",
    components: {
        BreakMatch,
        OtherBroadcasts,
        Bracket,
        BreakMatchup,
        Standings,
        BreakStaffList,
        ThemeLogo,
        BroadcastPreview
    },
    props: {
        broadcast: {},
        virtualMatch: {},
        customBreakAutomation: String,
        title: String,
        animationActive: Boolean,
        secondary: Boolean,
    },
    data: () => ({
        tick: 0,
        lastCountdownTick: 0
    }),
    computed: {
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
        themeColor() {
            return themeBackground1(this.event);
        },
        eventBorder() {
            if (!this.event?.theme) return null;
            return {
                borderColor: this.event.theme.color_theme
            };
        },
        schedule() {
            if (!this.broadcast?.schedule || !this.fullSchedule) return null;
            return this.fullSchedule.filter(m => {
                return this.secondary ? m.show_on_secondary_overlays : m.show_on_overlays;
            }).sort(sortMatches);
        },
        automatedShow() {
            if (this.breakAutomation?.length && this.lastCountdownTick <= 30 && this.countdownEnd) {
                if (this.breakAutomation.includes("setting: Always do 30s Schedule") && this.schedule?.length) return "Schedule";
                if (this.breakAutomation.includes("setting: Always do 30s Matchup") && this.nextMatch && this.nextMatch?.teams?.length >= 2) return "Matchup";
            }
            if (this.customBreakAutomation) return this.suggestedShow;

            if (this.broadcast.break_display && this.broadcast.break_display !== "Automated") {
                // do what it says
                return this.broadcast.break_display;
            } else {
                // empty or automated - do automation
                return this.suggestedShow;
            }
        },
        currentStage() {
            return this.virtualMatch?._virtual_match_category || this.broadcast?.current_stage || this.nextMatch?.match_group;
        },
        breakAutomation() {
            return this.customBreakAutomation || this.broadcast?.break_automation || [];
        },
        suggestedShow() {
            if (!this.breakAutomation?.length) return null;

            let slides = this.breakAutomation.filter(s => s.startsWith("use:")).map(s => s.replace("use: ", ""));
            console.log("pre", slides);
            if (this.nextMatch?.teams?.length !== 2) slides = slides.filter(s => s !== "Matchup");
            if (!this.currentStage) slides = slides.filter(s => s !== "Standings");
            if (!this.bracket) slides = slides.filter(s => s !== "Bracket");
            if (!this.hasStaff(this.staffSchedule)) slides = slides.filter(s => s !== "Staff");
            if (this.virtualMatch) slides = slides.filter(s => s !== "Schedule"); // Only going to be 1 match atm so matchup will be fine

            if (slides?.includes("Schedule") && this.countdownEnd && this.lastCountdownTick <= 30) {
                return "Schedule";
            }

            return slides[(this.tick % slides.length)];
        },
        countdownEnd() {
            return this.virtualMatch?._virtual_break_end || this.broadcast?.countdown_end;
        },
        staffSchedule() {
            if ((this.broadcast?.broadcast_settings || []).includes("Only show live match staff on break")) {
                return [this.nextMatch];
            } else if ((this.broadcast?.broadcast_settings || []).includes("Only show primary matches staff on break")) {
                return this.fullSchedule.filter(match => match.show_on_overlays);
            }
            return this.fullSchedule;
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
        nextMatch() {
            if (this.virtualMatch) return this.virtualMatch;
            if (!this.broadcast?.live_match || !this.broadcast.show_live_match) return null;
            return ReactiveRoot(this.broadcast.live_match[0], {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                })
            });
        },
        otherBroadcasts() {
            return this.broadcast?.other_broadcasts || [];
        },
        breakImage() {
            return resizedImage(this.broadcast, ["break_image"], "h-1080");
        },
        breakImageURL() {
            return resizedImageNoWrap(this.broadcast, ["break_image"], "h-1080");
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
        },
        breakContentTitle() {
            return (this.overlayTitle || "").replace(/\\n/g, "<br>");
        },
        themeBG() {
            return themeBackground1(this.event);
        },
        bracketKey() {
            const key = this.broadcast?.bracket_key;
            if (key) return key;
            // find bracket this match is in
            if (this.nextMatch) {
                const bracket = this.event.brackets.find(b => b.key && b?.ordered_matches?.some(m => m.id === this.nextMatch?.id));
                console.log(this.event.brackets, bracket);
                return bracket?.key;
            }
            return null;
        },
        bracket() {
            if (!this.event?.brackets) return null;
            if (this.virtualMatch?._virtual_match_category) {
                const bracket = this.event.brackets.find(b => b && b.associated_match_group === this.virtualMatch._virtual_match_category);
                if (bracket) return bracket;
            }
            if (this.bracketKey) {
                const bracket = this.event.brackets.find(b => b && b.key === this.bracketKey);
                if (bracket) return bracket;
            }
            return this.event.brackets[0];
        },
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
    mounted() {
        setInterval(() => {
            this.tick++;
        }, tickTime * 1000);
    },
};
</script>

<style scoped>

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
/*.break-content-enter-from, .break-content-leave-to { max-height: 0; padding: 0 40px; }*/
/*.break-content-enter-to, .break-content-leave-from { max-height: 100%; }*/

.break-content-enter-active, .break-content-leave-active {
    transition: all .35s ease;
    overflow: hidden
}

.break-content-enter-from {
    clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%);
}

.break-content-leave-to {
    clip-path: polygon(0 0, 0 0, 0 100%, 0% 100%);
}

.break-content-enter-to, .break-content-leave-from {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
}

.event-theme-border {
    border-bottom: 8px solid transparent;
}


.break-main {
    width: 100%;
    height: 100%;
    background-color: #222;
    color: white;
    flex-grow: 1;

    display: flex;

    height: 100%;
    margin-top: 0;
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

.break-bracket {
    /*zoom: 0.85;*/
    overflow: hidden;
    flex-wrap: nowrap;
}


.break-schedule {
    flex-grow: 1;
    box-sizing: border-box;
    /*justify-content: space-evenly;*/
    overflow: hidden;
    /*background-color: rgba(0,0,0,0.2);*/
}
.break-preload {
    opacity: 0;
    max-width: 0;
    max-height: 0;
    overflow: hidden;
}

.break-schedule, .break-matchup, .break-standings {
    padding: 20px 40px;
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

.broadcast-preview:first-of-type {
    margin-left: 0;
}

.broadcast-preview:last-of-type {
    margin-right: 0;
}

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

.broadcast-mid-split-enter-from {
    /*clip-path: polygon(0 0, 0 0, 0 100%, 0% 100%);*/
    /*clip-path: polygon(0% 0%, 0% 100%, 0% 100%, 0% 0, 100% 0, 100% 100%, 100% 100%, 100% 0%);*/
    clip-path: polygon(50% 0, 50% 100%, 50% 100%, 50% 0%, 50% 0%, 50% 100%, 50% 100%, 50% 0);
}

.broadcast-mid-split-enter-to {
    /*clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);*/
    /*clip-path: polygon(0% 0%, 0% 100%, 50% 100%, 50% 0, 50% 0, 50% 100%, 100% 100%, 100% 0%); */
    clip-path: polygon(0% 0, 0% 100%, 50% 100%, 50% 0%, 50% 0%, 50% 100%, 100% 100%, 100% 0);
}

.broadcast-mid-split-leave-to {
    opacity: 0;
}

.break-title-inner {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 5.75em;
    line-height: 1.1em;
    padding: 0 .2em;
    flex-direction: column;
}

.break-title-inner:deep(br) {
    margin-top: .25em !important;
    display: block;
    content: " ";
}

.break-others-info {
    font-size: 12px;
}

.break-others-info:deep(.broadcast-match) {
    font-size: 38px !important;
    width: 304px !important;
}

.break-others-info:deep(.broadcast) {
    margin-bottom: 0.75em !important;
}

.anim-break-next-enter-active, .anim-break-next-leave-active {
    transition: all .5s ease;
    overflow: hidden;
}

.anim-break-next-enter-from, .anim-break-next-leave-to {
    max-height: 0;
    opacity: 0;
    padding: 0 20px;
}

.anim-break-next-enter-to, .anim-break-next-leave-from {
    max-height: 240px;
    opacity: 1;
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
    max-height: 180px;
}
</style>

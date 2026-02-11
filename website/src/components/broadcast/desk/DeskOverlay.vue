<template>
    <div class="desk-overlay" :data-desk-display="deskDisplay" :data-generic-desk-display="middleMode">
        <div class="top-holder">
            <TourneyBar :left="broadcast.event && broadcast.event.short" :right="broadcast.subtitle" :event="broadcast.event" />
        </div>
        <transition-group
            class="casters flex-center"
            tag="div"
            name="anim-talent"
            :data-caster-count="casters.length"
            :data-visible-caster-count="visibleCasters.length">
            <Caster
                v-for="(caster, i) in casters"
                :key="caster.manual ? caster.name : caster.id"
                :guest="caster"
                :color="getColor(i)"
                :event="event"
                :disable-video="shouldDisableCasterVideo"
                :class="{'wide-feed': caster.wide_feed, ...(socketIDClasses[caster?.id] || {})}"
                :show-pronouns="showPronouns"
                :pronouns-on-newline="pronounsOnNewline" />
        </transition-group>
        <transition tag="div" mode="out-in" name="break-content">
            <HeroDraft
                v-if="liveMatch && useHeroDraft && !disableLower"
                class="hero-draft"
                :broadcast="broadcast"
                :match="liveMatch" />
            <MatchScoreboard
                v-else-if="liveMatch && useScoreboard && !disableLower"
                key="scoreboard"
                :desk-display="deskDisplay"
                :active="animationActive"
                class="scoreboard"
                :match="liveMatch"
                :broadcast="broadcast"
                :animate-on-mount="true" />
            <DeskMatch
                v-else-if="liveMatch && !useScoreboard && !disableLower"
                key="desk-match"
                :broadcast="broadcast"
                :desk-display="deskDisplay"
                class="w-100"
                :_match="liveMatch"
                :theme-color="themeColor"
                :guests="guests" />
        </transition>

        <div class="preload">
            <DeskMatch
                v-if="liveMatch && !disableLower"
                key="desk-match"
                class="w-100"
                :broadcast="broadcast"
                :_match="liveMatch"
                :theme-color="themeColor"
                force-mode="Maps" />
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import TourneyBar from "@/components/broadcast/TourneyBar";
import Caster from "@/components/broadcast/desk/Caster";
import DeskMatch from "@/components/broadcast/desk/DeskMatch";
import { themeBackground1 } from "@/utils/theme-styles";
import { createGuestObject } from "@/utils/content-utils";
import MatchScoreboard from "@/components/broadcast/MatchScoreboard.vue";
import HeroDraft from "@/components/broadcast/HeroDraft.vue";

export default {
    name: "DeskOverlay",
    components: { HeroDraft, MatchScoreboard, DeskMatch, Caster, TourneyBar },
    props: ["broadcast", "group", "disableCasters", "disableLower", "animationActive", "ignoreTalentSocket", "displayOverride"],
    data: () => ({
        socketHideIDs: {},
        socketIDClasses: {},
        timeouts: {}
    }),
    computed: {
        event() {
            return this.broadcast?.event;
        },
        shouldDisableCasterVideo() {
            if (this.disableCasters) return true;
            if (!this.broadcast?.broadcast_settings) return false;
            return this.broadcast.broadcast_settings.includes("Disable casters");
        },
        liveMatch: function () {
            if (!this.broadcast?.live_match) return null;
            return ReactiveRoot(this.broadcast.live_match[0], {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme"),
                    matches: ReactiveArray("matches", {
                        teams: ReactiveArray("teams")
                    })
                }),
                event: ReactiveThing("event", {
                    theme: ReactiveThing("theme")
                }),
                casters: ReactiveArray("casters", {
                    socials: ReactiveArray("socials")
                }),
                player_relationships: ReactiveArray("player_relationships", {
                    player: ReactiveThing("player")
                })
            });
        },
        manualGuests() {
            if (!this.broadcast?.manual_guests) return [];
            const manualGuests = this.broadcast.manual_guests.split("\n").filter(Boolean).map(guestString => createGuestObject(guestString));
            console.log(manualGuests);
            return manualGuests;
        },
        guests() {
            const guests = (!this.broadcast?.player_guests)
                ? []
                : ReactiveArray("player_guests", {
                    socials: ReactiveArray("socials"),
                    live_theme: ReactiveThing("live_theme"),
                    prediction_team: ReactiveThing("prediction_team", {
                        theme: ReactiveThing("theme")
                    })
                })(this.broadcast);

            return [
                ...guests,
                ...this.manualGuests
            ];
        },
        casters() {
            return this.guests.length ? this.guests : (this.liveMatch?.casters || [])?.filter(g => g?.name);
        },
        themeColor() {
            if (!this.broadcast?.event?.theme) return {};
            return themeBackground1(this.broadcast.event);
        },
        deskColors() {
            if (!this.broadcast?.event?.theme?.desk_colors) return [];
            return this.broadcast.event.theme.desk_colors.trim().split(/[\n,]/g).map(e => e.trim());
        },
        showPronouns() {
            return (this.broadcast?.broadcast_settings || []).includes("Show pronouns on desk");
        },
        pronounsOnNewline() {
            return (this.broadcast?.broadcast_settings || []).includes("Show desk pronouns on new lines");
        },
        deskDisplay() {
            return this.displayOverride || this.broadcast?.desk_display;
        },
        middleMode() {
            if (this.displayOverride) return this.displayOverride;
            let display = this.deskDisplay || "";

            if (display.indexOf("(") !== -1) {
                display = display.slice(0, display.indexOf("(") - 1).trim();
            }
            return display || "Match";
        },
        useScoreboard() {
            return (this.deskDisplay) === "Scoreboard" || (this.deskDisplay) === "Scoreboard Bans";
        },
        useHeroDraft() {
            return (this.deskDisplay) === "Hero Draft";
        },
        visibleCasters() {
            return this.casters.filter(({id}) => this.socketHideIDs[id]);
        }
    },
    methods: {
        getColor(index) {
            if (!this.deskColors?.length) return this.broadcast?.event?.theme?.color_logo_background || this.broadcast?.event?.theme?.color_theme;
            return this.deskColors[index % this.deskColors.length];
        },
        showTalent(id) {
            this.socketIDClasses[id] = {"anim-talent-enter-active anim-talent-enter-from": true};
            requestAnimationFrame(() => {
                this.socketIDClasses[id] = {"anim-talent-enter-active anim-talent-enter-to": true};
            });
            if (this.timeouts[id]) clearTimeout(this.timeouts[id]);
            this.timeouts[id] = setTimeout(() => {
                this.socketIDClasses[id] = {};
            }, 1000);

        },
        hideTalent(id) {
            this.socketIDClasses[id] = {"anim-talent-leave-active anim-talent-leave-from": true};
            requestAnimationFrame(() => {
                this.socketIDClasses[id] = {"anim-talent-leave-active anim-talent-leave-to": true};
            });
            if (this.timeouts[id]) clearTimeout(this.timeouts[id]);
            this.timeouts[id] = setTimeout(() => {
                this.socketIDClasses[id] = {"anim-talent-leave-to": true};
            }, 1000);

        }
    },
    sockets: {
        show_talent([num]) {
            console.log("show_talent", num);
            if (this.ignoreTalentSocket) return;
            try {
                const id = this.casters?.[parseInt(num) - 1]?.id;
                if (!id) return;
                this.showTalent(id);
                this.socketHideIDs[id] = false;
            } catch (e) {
            }
        },
        hide_talent([num]) {
            console.log("hide_talent", num);
            if (this.ignoreTalentSocket) return;
            try {
                const id = this.casters?.[parseInt(num) - 1]?.id;
                if (!id) return;
                this.hideTalent(id);
                this.socketHideIDs[id] = true;
            } catch (e) {
                console.warn("talent fail", e);
            }
        },
        toggle_talent([num]) {
            console.log("toggle_talent", num);
            if (this.ignoreTalentSocket) return;
            try {
                const id = this.casters?.[parseInt(num) - 1]?.id;
                if (!id) return;
                this.socketHideIDs[id] = !this.socketHideIDs[id];
                if (this.socketHideIDs[id]) {
                    this.hideTalent(id);
                } else {
                    this.showTalent(id);
                }
            } catch (e) {
                console.warn("talent fail", e);
            }
        },
        clear_talent() {
            if (this.ignoreTalentSocket) return;
            this.socketHideIDs = {};
            this.socketIDClasses = {};
        }
    },
    head() {
        return {
            title: `Desk | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

<style scoped>
    .desk-overlay {
        font-family: "SLMN-Industry", "Industry", sans-serif;
        overflow: hidden;
    }
    .top-holder {
        margin: 9vh 15vw;
        transform: scale(1.2);
        min-height: 100px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .casters {
        margin: 0 4vw;
        height: 570px;
    }

    .lower-holder {
        margin: 0 170px;
        margin-top: 2.5vh;
    }


    .anim-talent-enter-active {
        transition: all .5s ease, opacity .3s ease .2s, padding .2s ease;
    }
    .anim-talent-leave-active {
        transition: all .5s ease .2s, opacity .3s ease;
    }
    .anim-talent-enter-from, .anim-talent-leave-to {
        /* hide */
        max-width: 0;
        min-width: 0 !important;
        opacity: 0;
        padding: 0 0; /* --internal-padding */
    }

    .anim-talent-enter-from .caster-lower,
    .anim-talent-leave-to .caster-lower {
        /* animation quirk means it will shrink slightly once padding is added */
        width: 100%;
    }

    .anim-talent-enter-to, .anim-talent-leave-from {
        /* show */
        opacity: 1;
    }


    .top-holder, .lower-holder {
        height: 20% !important;
    }
    .casters {
        height: 60% !important;
        margin: 0 !important;
    }

    body, #slmngg-app, #overlay {
        overflow: hidden;
    }

    .top-holder {
        margin: 0 !important;
    }

    .desk-overlay {
        padding: 2vh 8vw;
        height: 100vh !important;
        box-sizing: border-box;
    }

    .lower-holder {
        margin: 0 !important;
    }

    .top-holder {
        transform: none !important;
    }

    .casters .caster:first-child {
        padding: 0 var(--internal-padding) 0 0 !important;
    }

    .casters .caster:last-child {
        padding: 0 0 0 var(--internal-padding) !important;
    }


    /*.casters .caster:first-child .caster-lower { left: 0 !important; }*/
    /*.casters .caster:first-child .caster-name {align-items: flex-start !important;}*/

    /*.casters .caster:last-child .caster-lower { right: 0 !important; }*/
    /*.casters .caster:last-child .caster-name { align-items: flex-end !important;}*/

    .caster.wide-feed {
        min-width: var(--caster-width)
    }
    .caster.wide-feed:deep(.caster-frame) {
        --oversize: 1% !important;
    }

    .preload {
        opacity: 0;
        max-width: 0;
        max-height: 0;
        overflow: hidden;
    }
</style>

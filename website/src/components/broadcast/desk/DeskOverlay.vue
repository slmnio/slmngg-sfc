<template>
    <div class="desk-overlay">
        <div class="top-holder">
            <TourneyBar :left="broadcast.event && broadcast.event.short" :right="broadcast.subtitle" :event="broadcast.event" />
        </div>
        <transition-group class="casters flex-center" name="anim-talent">
            <Caster v-for="(caster, i) in casters" :key="caster.manual ? caster.name : caster.id" :guest="caster" :color="getColor(i)"
                    :event="event" :disable-video="shouldDisableCasterVideo" :class="{'wide-feed': caster.wide_feed}"
                    :show-pronouns="showPronouns" :pronouns-on-newline="pronounsOnNewline" />
        </transition-group>
        <transition tag="div" class="lower-holder flex-center" mode="out-in" name="break-content">
            <DeskMatch :broadcast="broadcast" class="w-100" :_match="liveMatch" :theme-color="themeColor" :guests="guests" v-if="liveMatch && !useScoreboard" key="desk-match" />
            <MatchScoreboard :active="animationActive" class="scoreboard" v-if="liveMatch && useScoreboard" :match="liveMatch" :broadcast="broadcast" key="scoreboard" :animate-on-mount="true" />
        </transition>

        <div class="preload">
            <DeskMatch class="w-100" :broadcast="broadcast" :_match="liveMatch" :theme-color="themeColor" v-if="liveMatch" force-mode="Maps" key="desk-match" />
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

export default {
    name: "DeskOverlay",
    components: { MatchScoreboard, DeskMatch, Caster, TourneyBar },
    props: ["broadcast", "group", "disableCasters", "animationActive"],
    methods: {
        getColor(index) {
            if (!this.deskColors?.length) return this.broadcast?.event?.theme?.color_logo_background || this.broadcast?.event?.theme?.color_theme;
            return this.deskColors[index % this.deskColors.length];
        }
    },
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
                    live_guests: ReactiveThing("live_guests"),
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
            const guests = (!this.broadcast?.guests) ? [] : ReactiveArray("guests", {
                player: ReactiveThing("player", {
                    socials: ReactiveArray("socials")
                }),
                theme: ReactiveThing("theme"),
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
            if (!this.guests.length) {
                return (this.liveMatch?.casters || []).map(caster => ({
                    ...caster.live_guests,
                    player: caster
                }));
            }
            return this.guests;
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
        useScoreboard() {
            return (this.broadcast?.desk_display) === "Scoreboard";
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
        transition: all .3s ease, opacity .2s ease .2s;
    }
    .anim-talent-leave-active {
        transition: all .3s ease, opacity .2s ease;
    }
    .anim-talent-enter-from, .anim-talent-leave-to {
        /* hide */
        max-width: 0;
        min-width: 0 !important;
        opacity: 0;
        padding: 0 0;
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
        padding: 0 10px 0 0 !important;
    }

    .casters .caster:last-child {
        padding: 0 0 0 10px !important;
    }


    /*.casters .caster:first-child .caster-lower { left: 0 !important; }*/
    /*.casters .caster:first-child .caster-name {align-items: flex-start !important;}*/

    /*.casters .caster:last-child .caster-lower { right: 0 !important; }*/
    /*.casters .caster:last-child .caster-name { align-items: flex-end !important;}*/

    .caster.wide-feed {
        min-width: var(--caster-width)
    }
    .caster.wide-feed >>> .caster-frame {
        --oversize: 1% !important;
    }

    .preload {
        opacity: 0;
        max-width: 0;
        max-height: 0;
        overflow: hidden;
    }
</style>

<template>
    <div class="desk-overlay">
        <div class="top-holder">
            <TourneyBar :left="broadcast.event && broadcast.event.short" :right="broadcast.subtitle" :event="broadcast.event" />
        </div>
        <transition-group class="casters flex-center" name="anim-talent">
            <Caster v-for="(caster, i) in casters" v-bind:key="caster.id" :guest="caster" :color="getColor(i)"
                    :event="event" :disable-video="shouldDisableCasterVideo" />
        </transition-group>
        <div class="lower-holder flex-center">
            <DeskMatch class="w-100" :_match="liveMatch" :theme-color="themeColor" />
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { cssImage } from "@/utils/content-utils";
import TourneyBar from "@/components/broadcast/TourneyBar";
import Caster from "@/components/broadcast/desk/Caster";
import DeskMatch from "@/components/broadcast/desk/DeskMatch";
import { themeBackground1 } from "@/utils/theme-styles";

export default {
    name: "DeskOverlay",
    components: { DeskMatch, Caster, TourneyBar },
    props: ["broadcast", "group"],
    methods: {
        cssImage,
        getColor(index) {
            if (!this.deskColors) return null;
            return this.deskColors[index % this.deskColors.length];
        }
    },
    computed: {
        event() {
            return this.broadcast?.event;
        },
        shouldDisableCasterVideo() {
            if (!this.broadcast?.video_settings) return false;
            return this.broadcast.video_settings.includes("Disable casters");
        },
        liveMatch: function () {
            if (!this.broadcast?.live_match) return null;
            return ReactiveRoot(this.broadcast.live_match[0], {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
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
        guests: function() {
            if (!this.broadcast?.guests) return [];
            return ReactiveArray("guests", {
                player: ReactiveThing("player", {
                    socials: ReactiveArray("socials")
                }),
                theme: ReactiveThing("theme")
            })(this.broadcast);
        },
        casters() {
            return this.guests;/* .filter(g => g.show); */
        },
        themeColor() {
            if (!this.broadcast?.event?.theme) return {};
            return themeBackground1(this.broadcast.event);
        },
        deskColors() {
            if (!this.broadcast?.event?.theme?.desk_colors) return [];
            return this.broadcast.event.theme.desk_colors.trim().split(/[\n,]/g).map(e => e.trim());
        }
    }
};
</script>

<style scoped>
    .desk-overlay {
        font-family: "Industry", "SLMN-Industry", sans-serif;
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
    .anim-talent-enter, .anim-talent-leave-to {
        /* hide */
        max-width: 0;
        opacity: 0;
        padding: 0 0;
    }
    .anim-talent-enter-to, .anim-talent-leave {
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
        padding: 2vh 10vw;
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
</style>

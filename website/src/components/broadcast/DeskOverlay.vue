<template>
    <div class="desk-overlay">
        <div class="top-holder">
            <TourneyBar :left="broadcast.event && broadcast.event.short" :right="broadcast.subtitle" :event="broadcast.event" />
        </div>
        <transition-group class="casters flex-center" name="anim-talent">
            <Caster v-for="caster in casters" v-bind:key="caster.id" :guest="caster" />
        </transition-group>
        <div class="lower-holder flex-center">
            <DeskMatch class="w-100" :_match="liveMatch" />
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { cssImage } from "@/utils/content-utils";
import TourneyBar from "@/components/broadcast/TourneyBar";
import Caster from "@/components/broadcast/Caster";
import DeskMatch from "@/components/broadcast/DeskMatch";

export default {
    name: "DeskOverlay",
    components: { DeskMatch, Caster, TourneyBar },
    props: ["broadcast", "group"],
    methods: {
        cssImage
    },
    computed: {
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
                })
            })(this.broadcast);
        },
        casters() {
            return this.guests;/* .filter(g => g.show); */
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
        transition: all .4s ease-in-out, opacity .2s ease .2s;
    }
    .anim-talent-leave-active {
        transition: all .4s ease-in-out, opacity .2s ease;
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


</style>

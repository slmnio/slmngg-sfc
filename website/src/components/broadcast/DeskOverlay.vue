<template>
    <div class="desk-overlay">
        <div class="top-holder">
            <TourneyBar :left="broadcast.event && broadcast.event.short" :right="broadcast.subtitle" :event="broadcast.event" />
        </div>
        <transition-group class="casters flex-center" name="anim-talent">
            <Caster v-for="caster in casters" v-bind:key="caster.id" :guest="caster" />
        </transition-group>
        <div class="lower-holder flex-center">
            <BreakMatch :match="liveMatch" expanded="true" live="true" />
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { cssImage } from "@/utils/content-utils";
import TourneyBar from "@/components/broadcast/TourneyBar";
import Caster from "@/components/broadcast/Caster";
import BreakMatch from "@/components/broadcast/BreakMatch";

export default {
    name: "DeskOverlay",
    components: { BreakMatch, Caster, TourneyBar },
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
            return ReactiveArray("guests", {
                player: ReactiveThing("player", {
                    socials: ReactiveArray("socials")
                })
            })(this.broadcast);
        },
        casters() {
            return this.guests.filter(g => g.show);
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
        margin: 10vh 15vw;
        transform: scale(1.2);
    }

    .casters {
        margin: 0 4vw;
    }

    .lower-holder {
        margin: 0 5vw;
        margin-top: 2vh;
    }


    .anim-talent-enter-active, .anim-talent-leave-active {
        /* all enter animation frames */
        transition: all .3s ease-in-out;
    }
    .anim-talent-enter, .anim-talent-leave-to {
        /* hide */
        max-width: 0;
        opacity: 0;
    }
    .anim-talent-enter-to, .anim-talent-leave {
        /* show */
        opacity: 1;
    }


</style>

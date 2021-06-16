<template>
    <div class="desk-overlay">
        <div class="top-holder">
            <TourneyBar :left="broadcast.event.short" :right="broadcast.subtitle" :event="broadcast.event" />
        </div>
        <div class="casters" v-if="liveMatch">
            <div class="caster" v-for="caster in liveMatch.casters" v-bind:key="caster.id">
                {{ caster.name }}
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { cssImage } from "@/utils/content-utils";
import TourneyBar from "@/components/broadcast/TourneyBar";

export default {
    name: "DeskOverlay",
    components: { TourneyBar },
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
                    live_guests: ReactiveThing("live_guests")
                }),
                player_relationships: ReactiveArray("player_relationships", {
                    player: ReactiveThing("player")
                })
            });
        }
    }
};
</script>

<style scoped>
    .desk-overlay {
        font-family: "Industry", "SLMN-Industry", sans-serif;
    }
    .top-holder {
        margin: 10vh 15vw;
    }
</style>

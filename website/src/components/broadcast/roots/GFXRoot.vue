<template>
    <div class="gfx-root">
        <ScheduleOverlay v-if="gfx?.type === 'Schedule'" v-bind="overlayProps" />
        <BracketOverlay v-if="gfx?.type === 'Bracket'" v-bind="overlayProps" />
        <ImageOverlay v-if="gfx?.type === 'Image'" v-bind="overlayProps" />
        <TweetOverlay v-if="gfx?.type === 'Tweet'" v-bind="overlayProps" />
        <IframeOverlay v-if="gfx?.type === 'Iframe'" v-bind="overlayProps" />
        <StandingsOverlay v-if="gfx?.type === 'Standings'" v-bind="overlayProps" />
        <v-style>
            {{ gfx?.custom_css }}
        </v-style>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import ScheduleOverlay from "@/components/broadcast/roots/ScheduleOverlay.vue";
import BracketOverlay from "@/components/broadcast/roots/BracketOverlay.vue";
import ImageOverlay from "@/components/broadcast/roots/ImageOverlay.vue";
import IframeOverlay from "@/components/broadcast/roots/IframeOverlay.vue";
import StandingsOverlay from "@/components/broadcast/roots/StandingsOverlay.vue";
import TweetOverlay from "@/components/broadcast/roots/TweetOverlay.vue";

export default {
    name: "GFXRoot",
    components: { TweetOverlay, StandingsOverlay, IframeOverlay, ImageOverlay, BracketOverlay, ScheduleOverlay },
    props: {
        index: Number,
        broadcast: Object,
        client: Object
    },
    computed: {
        overlayProps() {
            return {
                broadcast: this.broadcast,
                client: this.client,
                matches: this.gfx?.matches || [],
                title: this.title || this.gfx?.title,
                extended: this.gfx?.extended,
                forceBracket: this.gfx?.bracket,
                image: this.gfx?.image?.[0],
                url: this.gfx?.url,
                identifier: this.gfx?.identifier
            };
        },
        gfx() {
            return ReactiveRoot(this.broadcast?.gfx?.[this.index - 1]?.id, {
                matches: ReactiveArray("matches", {
                    teams: ReactiveArray("teams", {
                        theme: ReactiveThing("theme")
                    })
                }),
                bracket: ReactiveThing("bracket", {
                    ordered_matches: ReactiveArray("ordered_matches", {
                        teams: ReactiveArray("teams", {
                            theme: ReactiveThing("theme")
                        })
                    })
                })
            });
        }
    }
};
</script>

<style scoped>
    .gfx-root {
        width: 100vw;
        height: 100vh;
    }
</style>

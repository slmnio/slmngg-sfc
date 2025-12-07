<template>
    <div class="gfx-root">
        <ScheduleOverlay v-if="gfx?.type === 'Schedule'" v-bind="overlayProps" />
        <BracketOverlay v-if="gfx?.type === 'Bracket'" v-bind="overlayProps" />
        <ImageOverlay v-if="gfx?.type === 'Image'" v-bind="overlayProps" />
        <IframeOverlay v-if="gfx?.type === 'Iframe'" v-bind="overlayProps" />
        <StandingsOverlay v-if="gfx?.type === 'Standings'" v-bind="overlayProps" :stage="overlayProps.identifier" />
        <TextOverlay v-if="gfx?.type === 'Text'" v-bind="overlayProps" />
        <MultiStandingsOverlay v-if="gfx?.type === 'Multi Standings'" v-bind="overlayProps" :stage-codes="gfx?.identifier?.split(',')" />
        <MVPOverlay
            v-if="gfx?.type === 'MVP'"
            v-bind="overlayProps"
            :player="gfx.players?.[0]"
            :team="gfx.teams?.[0]"
            :custom-hero="gfx.heroes?.[0]" />
        <StatsGFXOverlay v-if="gfx?.type?.startsWith('Stats: ')" v-bind="overlayProps" />
        <RosterMoveGFXOverlay v-if="gfx?.type === 'Rosters'" v-bind="overlayProps" />
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
import TextOverlay from "@/components/broadcast/roots/TextOverlay.vue";
import MultiStandingsOverlay from "@/components/broadcast/roots/MultiStandingsOverlay.vue";
import StatsGFXOverlay from "@/components/broadcast/roots/StatsGFXOverlay.vue";
import RosterMoveGFXOverlay from "@/components/broadcast/roots/RosterMoveGFXOverlay.vue";
import MVPOverlay from "@/components/broadcast/roots/MVPOverlay.vue";
import { sortMatches } from "@/utils/sorts";

export default {
    name: "GFXRoot",
    components: { MVPOverlay, StatsGFXOverlay, MultiStandingsOverlay, TextOverlay, StandingsOverlay, IframeOverlay, ImageOverlay, BracketOverlay, ScheduleOverlay, RosterMoveGFXOverlay },
    props: {
        index: Number,
        broadcast: Object,
        client: Object,
        title: String,
        animationActive: Boolean,
        forceExtended: Boolean,
        gfxID: String
    },
    computed: {
        overlayProps() {
            return {
                broadcast: this.broadcast,
                client: this.client,
                gfx: this.gfx,
                animationActive: this.animationActive,

                matches: (this.gfx?.graphics_settings || [])?.includes("Don't sort schedule") ? (this.gfx?.matches || []) : (this.gfx?.matches || []).sort(sortMatches),
                title: this.title || this.gfx?.title,
                extended: this.forceExtended ? true : this.gfx?.extended,
                forceBracket: this.gfx?.bracket,
                image: this.gfx?.image?.[0],
                url: this.gfx?.url,
                identifier: this.gfx?.identifier,
                markdown: this.gfx?.markdown,
                subtitle: this.gfx?.subtitle
            };
        },
        gfx() {
            return ReactiveRoot(this.gfxID || this.broadcast?.gfx?.[this.index - 1]?.id, {
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
                }),
                "players": ReactiveArray("players", {
                    "member_of": ReactiveArray("member_of", {
                        "theme": ReactiveThing("theme")
                    }),
                    "favourite_hero": ReactiveThing("favourite_hero")
                }),
                "teams": ReactiveArray("teams", {
                    "theme": ReactiveThing("theme"),
                    players: ReactiveArray("players", {
                        "signup_data": ReactiveArray("signup_data")
                    }),
                }),
                "heroes": ReactiveArray("heroes")
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

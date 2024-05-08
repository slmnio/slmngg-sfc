<template>
    <GenericOverlay v-if="match" class="maps-overlay" :title="customTitle">
        <BroadcastMapDisplay :broadcast="broadcast" :animation-active="animationActive" :use-transitions="useTransitions" />
    </GenericOverlay>
</template>

<script>
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import BroadcastMapDisplay from "@/components/broadcast/BroadcastMapDisplay";

export default {
    name: "MapsOverlay",
    components: { GenericOverlay, BroadcastMapDisplay },
    props: ["broadcast", "title", "animationActive", "useTransitions"],
    computed: {
        match() {
            if (!this.broadcast?.live_match) return null;
            return ReactiveRoot(this.broadcast.live_match[0], {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                }),
                maps: ReactiveArray("maps", {
                    winner: ReactiveThing("winner", {
                        theme: ReactiveThing("theme")
                    }),
                    map: ReactiveThing("map", {
                        map: ReactiveThing("map")
                    }),
                    picker: ReactiveThing("picker", {
                        theme: ReactiveThing("theme")
                    }),
                    banner: ReactiveThing("banner", {
                        theme: ReactiveThing("theme")
                    })
                })
            });
        },
        customTitle() {
            if (this.title) return this.title;
            if (this.autoTitle === "score" && this.match) {
                return [
                    this.match.teams?.[0]?.code,
                    this.match.score_1,
                    "-",
                    this.match.score_2,
                    this.match.teams?.[1]?.code
                ].join(" ");
            }
            return "Map Set";
        }
    },
    head() {
        return {
            title: `Maps | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

<style scoped>
</style>

<template>
    <ConfettiOverlay v-if="winner" :theme="winner?.theme"/>
</template>

<script>

import ConfettiOverlay from "@/components/broadcast/roots/ConfettiOverlay.vue";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";

export default {
    components: { ConfettiOverlay },
    props: ["broadcast", "stingerText"],
    name: "ChampionsOverlay",
    data: () => ({
        confettiStarted: false,
        prodData: {
            minor: true
        }
    }),
    mounted() {
        console.log(this.stingerText);
        this.$parent.updateText(this.stingerText || "Winners");
    },
    computed: {
        match() {
            if (!this.broadcast?.live_match?.length) return null;
            return ReactiveRoot(this.broadcast?.live_match?.[0], {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                })
            });
        },
        winner() {
            if (!this.match) return null;
            if (!(this.match.first_to && [this.match.score_1, this.match.score_2].some(s => s === this.match.first_to))) return null;
            return this.match.teams[this.match.score_1 === this.match.first_to ? 0 : 1];
        }
    },
    watch: {
        winner: {
            deep: true,
            handler(winner) {
                console.log("winner change", this.$parent);
                this.$parent.updateTheme(winner?.theme);
            }
        }
    },
    metaInfo() {
        return {
            title: `Champions | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

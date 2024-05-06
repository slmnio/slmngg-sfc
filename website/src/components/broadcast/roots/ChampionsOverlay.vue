<template>
    <ConfettiOverlay v-if="winner" :theme="winner?.theme"/>
</template>

<script>

import ConfettiOverlay from "@/components/broadcast/roots/ConfettiOverlay.vue";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { useStatusStore } from "@/stores/statusStore";

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
    computed: {
        stingerTextVal() {
            return this.winner ? (this.stingerText || "Winners") : null;
        },
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
            immediate: true,
            handler(winner) {
                console.log("winner", winner);
                const statusStore = useStatusStore();
                statusStore.customStingerTheme = winner?.theme;
                statusStore.customStingerText = this.winner ? (this.stingerText || "Winners") : null;
                statusStore.stingerHideText = !this.stingerTextVal;
            }
        }
    },
    head() {
        return {
            title: `Champions | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

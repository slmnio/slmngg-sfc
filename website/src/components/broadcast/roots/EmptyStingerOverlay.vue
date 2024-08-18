<template>
    <div class="empty-stinger-overlay"></div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { useStatusStore } from "@/stores/statusStore";

export default {
    name: "EmptyStingerOverlay",
    props: ["broadcast", "teamNum"],
    data: () => ({
        prodData: {
            minor: true
        }
    }),
    computed: {
        match() {
            if (!this.broadcast?.live_match) return null;
            return ReactiveRoot(this.broadcast.live_match[0], {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                })
            });
        },
        themeObject() {
            if ([1, "1", "left"].includes(this.teamNum)) {
                return this.match?.teams?.[0];
            }
            if ([2, "2", "right", "alt"].includes(this.teamNum)) {
                return this.match?.teams?.[1];
            }
            if ([3, "3", "highlight", "highlighted"].includes(this.teamNum)) {
                return ReactiveRoot(this.broadcast.id, {
                    highlight_team: ReactiveThing("highlight_team", {
                        theme: ReactiveThing("theme")
                    })
                })?.highlight_team;
            }
            return this.broadcast?.event;
        },
    },
    watch: {
        themeObject: {
            deep: true,
            handler(themeObject) {
                useStatusStore().customStingerTheme = themeObject?.theme;
            }
        },
    },
    head() {
        return {
            title: `Empty Stinger | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

<style scoped>

</style>

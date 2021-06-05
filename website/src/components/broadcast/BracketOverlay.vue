<template>
    <GenericOverlay v-if="!extended" title="Bracket" :accent-color="accentColor">
        <Bracket class="bracket" :event="event" :bracket="bracket" use-overlay-scale />
    </GenericOverlay>
    <div class="bracket-extended" :style="zoom" v-else>
        <Bracket class="bracket" :event="event" :bracket="bracket" use-overlay-scale />
    </div>
</template>

<script>
import GenericOverlay from "@/components/broadcast/GenericOverlay";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import Bracket from "@/components/website/Bracket";
export default {
    name: "BracketOverlay",
    components: { Bracket, GenericOverlay },
    props: ["broadcast", "bracketKey", "extended", "scale"],
    computed: {
        event() {
            if (!this.broadcast || !this.broadcast.event) return null;
            return ReactiveRoot(this.broadcast.event[0], {
                theme: ReactiveThing("theme"),
                brackets: ReactiveArray("brackets", {
                    ordered_matches: ReactiveArray("ordered_matches", {
                        teams: ReactiveArray("teams", {
                            theme: ReactiveThing("theme")
                        })
                    })
                })
            });
        },
        bracket() {
            if (!this.event?.brackets) return null;
            if (!this.bracketKey) return this.event.brackets[0];
            const bracket = this.event.brackets.find(b => b && b.key === this.bracketKey);
            return bracket || this.event.brackets[0];
        },
        accentColor() {
            if (!this.event || !this.event.theme) return null;
            return this.event.theme.color_theme;
        },
        zoom() {
            if (!this.scale) return {};
            return { zoom: this.scale };
        }
    }
};
</script>

<style scoped>
    .bracket {
        justify-content: center;
    }
    .bracket-extended {

        position: absolute;
        overflow: hidden;
        background: transparent;
        background-color: transparent;

        height: 100%;
        width: 100%;
        color: white;
        font-family: "Industry", "SLMN-Industry", sans-serif;

        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>

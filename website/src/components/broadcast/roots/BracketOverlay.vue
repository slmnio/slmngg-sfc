<template>
    <GenericOverlay v-if="!extended" :title="title || 'Bracket'">
        <Bracket class="bracket" :event="event" :bracket="bracket" use-overlay-scale :small="small" />
    </GenericOverlay>
    <div class="bracket-extended" :style="zoom" v-else>
        <Bracket class="bracket" :event="event" :bracket="bracket" use-overlay-scale :small="small" />
    </div>
</template>

<script>
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import Bracket from "@/components/website/bracket/Bracket";
export default {
    name: "BracketOverlay",
    components: { Bracket, GenericOverlay },
    props: ["broadcast", "title", "bracketKey", "extended", "scale", "small"],
    computed: {
        event() {
            if (!this.broadcast || !this.broadcast.event) return null;
            return ReactiveRoot(this.broadcast.event.id, {
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
            let key;
            if (this.broadcast?.bracket_key) key = this.broadcast.bracket_key;
            if (this.bracketKey) key = this.bracketKey;

            if (!key) return this.event.brackets[0];
            const bracket = this.event.brackets.find(b => b && b.key === key);
            return bracket || this.event.brackets[0];
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

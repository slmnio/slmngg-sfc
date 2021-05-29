<template>
    <GenericOverlay title="Bracket" :accent-color="accentColor">
        <Bracket :event="event" :bracket="bracket" :font-size="bracket.overlay_scale" />
    </GenericOverlay>
</template>

<script>
import GenericOverlay from "@/components/broadcast/GenericOverlay";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import Bracket from "@/components/website/Bracket";
export default {
    name: "BracketOverlay",
    components: { Bracket, GenericOverlay },
    props: ["broadcast", "bracketKey"],
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
        }
    }
};
</script>

<style scoped>

</style>

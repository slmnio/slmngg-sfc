<template>
    <GenericOverlay :title="title" :accent-color="accentColor" />
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import GenericOverlay from "@/components/broadcast/GenericOverlay";

export default {
    name: "StandingsOverlay",
    components: { GenericOverlay },
    props: ["broadcast", "title"],
    computed: {
        event() {
            if (!this.broadcast || !this.broadcast.event) return null;
            return ReactiveRoot(this.broadcast.event.id, {
                theme: ReactiveThing("theme"),
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                })
            });
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

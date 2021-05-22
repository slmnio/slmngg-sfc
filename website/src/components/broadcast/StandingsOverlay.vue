<template>
    <GenericOverlay title="Standings" :accent-color="accentColor">
        <Standings :event="event" :stage="broadcast.current_stage" />
    </GenericOverlay>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import GenericOverlay from "@/components/broadcast/GenericOverlay";
import Standings from "@/components/broadcast/Standings";

export default {
    name: "StandingsOverlay",
    components: { GenericOverlay, Standings },
    props: ["broadcast"],
    computed: {
        event() {
            if (!this.broadcast || !this.broadcast.event) return null;
            return ReactiveRoot(this.broadcast.event[0], {
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

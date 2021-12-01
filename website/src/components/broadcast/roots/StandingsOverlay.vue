<template>
    <GenericOverlay :title="title || (broadcast.current_stage ? `Standings: ${broadcast.current_stage}` : 'Standings')" :accent-color="accentColor">
        <Standings :event="event" :stage="broadcast.current_stage" />
    </GenericOverlay>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay";
import Standings from "@/components/broadcast/Standings";

export default {
    name: "StandingsOverlay",
    components: { GenericOverlay, Standings },
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

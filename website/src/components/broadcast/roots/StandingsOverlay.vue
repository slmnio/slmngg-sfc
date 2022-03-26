<template>
    <GenericOverlay :title="title || (_stage ? `Standings: ${_stage}` : 'Standings')">
        <Standings class="standings" :event="event" :stage="_stage" />
    </GenericOverlay>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay";
import Standings from "@/components/broadcast/Standings";

export default {
    name: "StandingsOverlay",
    components: { GenericOverlay, Standings },
    props: ["broadcast", "title", "stage"],
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
        _stage() {
            return this.stage || this.broadcast?.current_stage;
        }
    }
};
</script>

<style scoped>
    .standings >>> .team-name {
        color: inherit !important;
    }
</style>

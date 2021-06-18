<template>
    <GenericOverlay :title="title || (broadcast ? broadcast.name : 'Schedule')" class="schedule-overlay" :accent-color="accentColor" :top="top" :broadcast="broadcast">
        <transition-group class="break-col break-schedule" name="a--match">
            <BreakMatch v-for="match in schedule" :timezone="broadcast.timezone" :match="match" :expanded="true" v-bind:key="match.id" />
        </transition-group>
    </GenericOverlay>
</template>

<script>
import GenericOverlay from "@/components/broadcast/GenericOverlay";
import BreakMatch from "@/components/broadcast/BreakMatch";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { sortMatches } from "@/utils/sorts";

export default {
    name: "ScheduleOverlay",
    props: ["broadcast", "title", "top"],
    components: { GenericOverlay, BreakMatch },
    computed: {
        schedule() {
            if (!this.broadcast || !this.broadcast.schedule) return null;
            return ReactiveArray("schedule", {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                })
            })(this.broadcast).filter(m => {
                return m.show_on_overlays;
            }).sort(sortMatches);
        },
        event() {
            if (!this.broadcast || !this.broadcast.event) return null;
            return ReactiveRoot(this.broadcast.event.id, {
                theme: ReactiveThing("theme")
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
    .break-schedule {
        flex-grow: 1;
        padding: 20px 40px;
        box-sizing: border-box;
        /*justify-content: space-evenly;*/
        overflow: hidden;
        /*background-color: rgba(0, 0, 0, 0.2);*/
        display: flex;
        flex-direction: column;
        height: 100%;

        justify-content: center;
    }
</style>

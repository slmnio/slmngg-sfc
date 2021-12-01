<template>
    <GenericOverlay :title="title || 'Schedule'" class="schedule-overlay" :accent-color="accentColor" :top="top" :broadcast="broadcast">
        <transition-group class="break-col break-schedule" name="a--match">
            <BreakMatch v-for="match in schedule" :timezone="broadcast.timezone" :match="match" :expanded="true" v-bind:key="match.id" :theme-color="themeColor" />
        </transition-group>
    </GenericOverlay>
</template>

<script>
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay";
import BreakMatch from "@/components/broadcast/break/BreakMatch";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { sortMatches } from "@/utils/sorts";
import { themeBackground1 } from "@/utils/theme-styles";

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
        },
        themeColor() {
            return themeBackground1(this.event);
        }
    }
};
</script>

<style scoped>
    .break-schedule {
        flex-grow: 1;
        padding: 0 40px;
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

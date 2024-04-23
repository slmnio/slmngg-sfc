<template>
    <GenericOverlay :title="title || 'Schedule'" class="schedule-overlay" :top="top" :broadcast="broadcast">
        <transition-group class="break-col break-schedule" name="a--match">
            <BreakMatch v-for="match in schedule" :timezone="broadcast.timezone" :match="match" :expanded="true" :key="match.id" :theme-color="themeColor" />
        </transition-group>
    </GenericOverlay>
</template>

<script>
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay";
import BreakMatch from "@/components/broadcast/break/BreakMatch";
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import { sortMatches } from "@/utils/sorts";
import { themeBackground1 } from "@/utils/theme-styles";

export default {
    name: "ScheduleOverlay",
    props: ["broadcast", "title", "top", "secondary", "matches"],
    components: { GenericOverlay, BreakMatch },
    computed: {
        schedule() {
            if (this.matches?.every(m => m.id)) {
                return this.matches;
            }

            if (!this.broadcast || !this.broadcast.schedule) return null;
            return ReactiveArray("schedule", {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                })
            })(this.broadcast).filter(m => {
                return this.secondary ? m.show_on_secondary_overlays : m.show_on_overlays;
            }).sort(sortMatches);
        },
        themeColor() {
            if (!this.broadcast?.event?.theme) return {};
            return themeBackground1(this.broadcast.event);
        }
    },
    head() {
        return {
            title: `Schedule${this.secondary ? " (Secondary)" : ""} | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
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

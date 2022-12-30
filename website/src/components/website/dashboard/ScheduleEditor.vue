<template>
    <DashboardModule class="schedule-editor" title="Schedule" icon-class="fas fa-calendar-alt" no-content-border>
        <template v-slot:header>{{ status }}</template>

        <table class="table table-bordered table-sm table-dark mb-0">
            <tr>
                <th>Match</th>
                <th>Start time</th>
                <th>Show on overlays</th>
                <th>Live Match</th>
            </tr>
            <ScheduleEditorMatch v-for="match in schedule" :match="match" :key="match.id"
                                 :is-live-match="match._isLiveMatch" :timezone="broadcast.timezone || 'America/New_York'"></ScheduleEditorMatch>
        </table>
    </DashboardModule>
</template>

<script>
import ScheduleEditorMatch from "@/components/website/dashboard/ScheduleEditorMatch";
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import { sortMatches } from "@/utils/sorts";
import DashboardModule from "@/components/website/dashboard/DashboardModule.vue";
export default {
    name: "ScheduleEditor",
    components: { DashboardModule, ScheduleEditorMatch },
    props: ["broadcast"],
    computed: {
        schedule() {
            if (!this.broadcast?.schedule?.length) return [];
            return ReactiveArray("schedule", {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                })
            })(this.broadcast).map(match => ({
                ...match,
                _isLiveMatch: this.broadcast?.live_match?.id === match?.id
            })).sort((a, b) => sortMatches(a, b));
        },
        primarySchedule() {
            return this.schedule.filter(match => match.show_on_overlays);
        },
        liveMatch() {
            return this.broadcast?.live_match;
        },
        liveMatchScheduleIndex() {
            return this.primarySchedule.findIndex(match => match._isLiveMatch);
        },
        nextMatch() {
            if (!this.primarySchedule?.length) return null;

            if (this.liveMatchScheduleIndex !== -1 && this.primarySchedule.length > this.liveMatchScheduleIndex) {
                return this.primarySchedule[this.liveMatchScheduleIndex + 1];
            }
            return this.primarySchedule[0];
        },
        status() {
            if (this.scheduled?.length === 0) {
                return "No matches scheduled";
            }
            let scheduleStatus;

            if (this.liveMatch) {
                if (this.liveMatchScheduleIndex === -1) {
                    scheduleStatus = "This match isn't on the schedule";
                } else {
                    scheduleStatus = `This is match ${this.liveMatchScheduleIndex + 1}/${this.primarySchedule.length}`;
                }
            }

            let next;
            if (this.nextMatch) {
                next = `Next match: ${this.nextMatch.name}`;
            } else {
                next = "No further matches";
            }

            return `${scheduleStatus ? scheduleStatus + " • " : ""}${next}`;
        }
    },
    mounted() {
        console.log("schedule editor mount");
    },
    beforeDestroy() {
        console.log("schedule editor destroy");
    }
};
</script>

<style scoped>

</style>

<template>
    <div class="schedule-item">
        <div class="match-round">
            <transition name="fade" mode="out-in">
                <span :key="match.round">{{ match.round }}</span>
            </transition>
        </div>
        <div class="match-teams">
            <transition name="fade" mode="out-in">
                <span :key="teamsVs" v-html="teamsVs"></span>
            </transition>
        </div>
        <div class="match-schedule">
            <transition name="fade" mode="out-in">
                <span :key="scheduleTime">{{ scheduleTime }}</span>
            </transition>
        </div>
    </div>
</template>

<script>
import { formatTime } from "@/utils/content-utils";

export default {
    name: "ScheduleTextItem",
    props: ["broadcast", "match"],
    computed: {
        teamsVs() {
            if (!this.match.teams?.length) return "TBD";
            const names = [0, 1].map(i => this.match.teams?.[i]?.name || "TBD").map(e => `<span class="no-wrap">${e}</span>`);
            return names.join((this.match.score_1 || this.match.score_2) ? ` ${this.match.score_1 || 0}-${this.match.score_2 || 0} ` : " vs ");
        },
        scheduleTime() {
            return formatTime(this.match.start, {
                tz: this.broadcast.timezone,
                format: "{day-short} {month-short} {date} @ {hour}:{minute-pad}{ampm} {tz-no-sun}"
            });
        }
    },
    methods: {
        formatTime
    }
};
</script>

<style scoped>
    .match-teams:deep(.no-wrap) {
        white-space: nowrap;
    }
</style>

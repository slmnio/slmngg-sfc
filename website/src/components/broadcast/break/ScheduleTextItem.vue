<template>
    <div class="schedule-item">
        <div class="match-round industry-align">
            <transition name="fade" mode="out-in">
                <span :key="scheduleText">{{ scheduleText }}</span>
            </transition>
        </div>
        <div class="match-teams industry-align">
            <transition name="fade" mode="out-in">
                <span :key="teamsVs" v-html="teamsVs"></span>
            </transition>
        </div>
        <div class="match-schedule industry-align">
            <transition name="fade" mode="out-in">
                <span :key="scheduleTime">{{ scheduleTime }}</span>
            </transition>
        </div>
    </div>
</template>

<script>
import { formatText, formatTime } from "@/utils/content-utils";

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
        },
        scheduleText() {
            return formatText(this.broadcast?.break_schedule_format, this.broadcast?.event, this.match) || this.match?.round;
        },
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
    .match-round {
        font-weight: bold;
        text-transform: uppercase;
        font-size: 0.9em;
    }
    .match-schedule {
        font-size: 0.75em;
    }
    .schedule-item {
        line-height: 1.1;
    }
</style>

<template>
    <div class="schedule-time">
        <div v-if="customText" class="custom-text mt-1">{{ customText }}</div>
        <div class="top" v-if="top">{{ top }}</div>
        <div class="bottom" v-if="bottom">{{ bottom }}</div>
    </div>
</template>

<script>
import { formatTime } from "@/utils/content-utils";

export default {
    name: "ScheduleTime",
    props: {
        time: [String, Number],
        customText: String,
        noTimes: Boolean,
        customTimezone: String
    },
    computed: {
        top() {
            return this.time && formatTime(this.time, {
                format: "{date} {month-short} {year-short-prev-only}",
                tz: this.$store.state.timezone,
                use24HourTime: this.$store.state.use24HourTime
            });
        },
        bottom() {
            return !this.noTimes && this.time && formatTime(this.time, {
                format: "{time} {tz}",
                tz: this.$store.state.timezone,
                use24HourTime: this.$store.state.use24HourTime
            });
        }
    }
};
</script>

<style scoped>
    .top {
        font-weight: bold;
    }
    .custom-text {
        font-size: 12px;
        font-weight: bold;
        text-transform: uppercase;
        line-height: 1;
    }
</style>

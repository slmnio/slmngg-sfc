<template>
    <div class="schedule-time">
        <div v-if="customText" class="custom-text mt-1">{{ customText }}</div>
        <div v-if="top" class="top">{{ top }}</div>
        <div v-if="bottom" class="bottom">{{ bottom }}</div>
        <router-link
            v-if="badge"
            v-b-tooltip.left
            class="badge pill text-white"
            :class="`bg-${badge.variant}`"
            :title="badge?.title"
            :to="url('match', this.match, { subPage: 'rescheduling' })">
            <i class="far fa-clock mr-1"></i>{{ badge.text }}
        </router-link>
    </div>
</template>

<script>
import { formatTime, url } from "@/utils/content-utils";
import { useSettingsStore } from "@/stores/settingsStore";

export default {
    name: "ScheduleTime",
    props: {
        time: [String, Number],
        customText: String,
        noTimes: Boolean,
        customTimezone: String,
        badge: Object,
        match: Object
    },
    computed: {
        top() {
            return this.time && formatTime(this.time, {
                format: "{date} {month-short} {year-short-prev-only}",
                tz: useSettingsStore().timezone,
                use24HourTime: useSettingsStore().use24HourTime
            });
        },
        bottom() {
            return !this.noTimes && this.time && formatTime(this.time, {
                format: "{time} {tz}",
                tz: useSettingsStore().timezone,
                use24HourTime: useSettingsStore().use24HourTime
            });
        }
    },
    methods: { url }
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
    .badge {
        font-weight: bold;
        font-size: .7em;
        text-transform: uppercase;
        padding: 0.25em 0.5em;
    }
</style>

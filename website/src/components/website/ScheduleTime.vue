<template>
    <div class="schedule-time">
        <div v-if="customText" class="custom-text mt-1">{{ customText }}</div>
        <div class="top" v-if="top">{{ top }}</div>
        <div class="bottom" v-if="bottom">{{ bottom }}</div>
    </div>
</template>

<script>
import spacetime from "spacetime";
import informal from "spacetime-informal";
import store from "@/thing-store";

export default {
    name: "ScheduleTime",
    props: ["time", "customText"],
    computed: {
        activeTimezone() {
            const stz = store.state.timezone;
            if (stz === "local") return this.localTimezone;
            return stz;
        },
        localTimezone() {
            return spacetime.now().timezone().name;
        },
        _time() {
            const utc = spacetime(this.time);
            return utc.goto(this.activeTimezone);
        },
        top() {
            // console.log(informal.display(this._time));
            return this.time && this._time.format("{date} {month-short}");
        },
        bottom() {
            const display = informal.display(this.activeTimezone);
            const abbrev = this._time.isDST() ? display.daylight.abbrev : display.standard.abbrev;

            return this.time && this._time.time() + " " + abbrev;
            // console.log(informal.display(this._time.format("timezone")));
            // return this._time.format("{time}") + this._time.isDST() ? "DAYLIGHT" : "display.standard.abbrev";
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

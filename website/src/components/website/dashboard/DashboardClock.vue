<template>
    <div class="dashboard-clock bg-dark px-2" @click="() => use12hr = !use12hr">
        <div class="title">{{ title }}</div>
        <div class="clock">{{ text }}</div>
    </div>
</template>

<script>
import spacetime from "spacetime";
import { create } from "timesync";


export default {
    name: "DashboardClock",
    props: ["title", "timezone", "clockType"],
    data: () => ({
        use12hr: false,
        ts: create({
            server: "https://api.syncer.live/api/time"
        }),
        now: new Date()
    }),
    computed: {
        time() {
            let time = spacetime(this.now);
            if (this.timezone) time = time.goto(this.timezone);
            return time;
        },
        text() {
            if (this.use12hr) {
                return this.time.format("{hour}:{minute-pad}:{second-pad}{ampm}");
            }
            return this.time.format("{hour-24-pad}:{minute-pad}:{second-pad}");
        }
    },
    mounted() {
        setInterval(() => {
            this.now = this.ts.now();
        }, 1000);
    }
};
</script>

<style scoped>
    .dashboard-clock {
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;

        padding: 4px;
        height: 48px;
    }
    .title {
        font-size: 0.9em;
        line-height: 1;
        text-align: center;
    }
    .clock {
        font-size: 1.5em;
        font-variant-numeric: tabular-nums;
        font-weight: bold;
        line-height: 1;
    }
</style>

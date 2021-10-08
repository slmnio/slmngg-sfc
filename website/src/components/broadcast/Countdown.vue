<template>
    <div class="countdown">
        <span class="industry-align" v-html="text"></span>
    </div>
</template>

<script>
import spacetime from "spacetime";

export default {
    name: "Countdown",
    props: ["to", "timezone", "update"],
    mounted() {
        setInterval(this.tick, 1000);
    },
    data: () => ({
        now: new Date()
    }),
    computed: {
        diff() {
            if (!this.to) return 0;
            const diff = Math.floor((new Date(this.to) - this.now) / 1000);
            if (diff <= 0) return 0;
            return diff;
        },
        text() {
            if (!this.to) {
                // return current date if no time set
                const utc = spacetime(this.now);
                const local = utc.goto(this.timezone || "America/New_York");
                return local.format("{hour}:{minute-pad}") + `<span class="ampm">${local.format("ampm")}</span>`;
            }
            if (this.diff > 60 * 60) {
                // hours
                const diffMins = Math.floor(this.diff / 60);
                const hours = Math.floor(diffMins / 60);
                const mins = diffMins % 60;
                return [hours, mins].map(i => i.toString().padStart(2, "0")).join(":");
            } else {
                const mins = Math.floor(this.diff / 60);
                const secs = this.diff % 60;
                return [mins, secs].map(i => i.toString().padStart(2, "0")).join(":");
            }
        }
    },
    methods: {
        tick() {
            this.now = new Date();
        }
    },
    watch: {
        diff(v) {
            if (this.update) this.update(v);
        }
    }
};
</script>

<style scoped>
    span.industry-align {
        transform: translate(0, -.0925em);
    }
    .countdown {
        font-variant-numeric: tabular-nums;
    }
</style>
<style>
    .countdown .ampm {
        font-size: .25em;
        text-transform: uppercase;
        letter-spacing: 0;
        margin-left: .1em;
        margin-bottom: .2em;
    }
</style>

<template>
    <div class="countdown">
        <span class="industry-align">{{ text }}</span>
    </div>
</template>

<script>
export default {
    name: "Countdown",
    props: ["to"],
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

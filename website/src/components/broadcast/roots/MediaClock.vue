<template>
    <div class="media-clock flex-center" :class="{'last-seconds': lastSeconds, 'not-prepared': !prepared, 'not-playing': !playing }">
<!--        <ul>-->
<!--            <li>prep: {{ prepared }}</li>-->
<!--            <li>play: {{ playing }}</li>-->
<!--            <li>time: {{ time }}</li>-->
<!--            <li>last {{ lastSecondsHighlight }} secs: {{ lastSeconds }}</li>-->
<!--        </ul>-->
        <div class="top-text">
            <div class="industry-align">
                {{ prepared && !playing ? "MEDIA READY" : timeNow }}
            </div>
        </div>
        <div class="big-text flex-center">
            <div class="industry-align">{{ timeDisplay }}</div>
        </div>
    </div>
</template>

<script>
import spacetime from "spacetime";

export default {
    name: "MediaClock.vue",
    data: () => ({
        prepared: null,
        playing: null,
        time: {
            current: null,
            duration: null
        },
        lastSecondsHighlight: 10,
        now: new Date()
    }),
    computed: {
        timeNow() {
            return spacetime(this.now).format("{day-short} {date-pad} {month-short} · {hour-24-pad}:{minute-pad}:{second-pad}");
        },
        timeRemaining() {
            return this.time.duration - this.time.current;
        },
        lastSeconds() {
            if (!this.playing) return null;
            return Math.floor(this.timeRemaining) <= this.lastSecondsHighlight;
        },
        timeDisplay() {
            // updates here are only every 500ms so it doesn't make much difference.

            // if (this.lastSeconds) {
            //     // last x seconds, show with decimals
            //     return this.timeRemaining.toFixed(2);
            // } else {
            // 00:00
            const mins = Math.floor((this.timeRemaining || 0) / 60);
            const secs = Math.floor((this.timeRemaining || 0) % 60);
            return [mins, secs].map(e => e.toString().padStart(2, "0")).join(":");
            // }
        }
    },
    sockets: {
        media_update_prepared(isPrepared) {
            this.prepared = isPrepared;
            if (!isPrepared) {
                // video reset
                this.time = {};
            }
        },
        media_update_playing(isPlaying) {
            this.playing = isPlaying;
            if (isPlaying) this.prepared = false;
        },
        media_update_ended(ended) {
            this.playing = !ended;
        },
        media_update_time(time) {
            this.time = time;
        }
    },
    mounted() {
        setInterval(() => {
            this.now = new Date();
        }, 1000);
    }
};
</script>

<style scoped>
    .media-clock {
        background-color: black;
        color: white;
        font-family: "SLMN-Industry", "Industry", sans-serif;
        width: 100vw;
        height: 100vh;
        line-height: 1;
        flex-direction: column;
        width: 100%;
        text-align: center;
        font-variant-numeric: tabular-nums;
    }
    .big-text {
        font-size: 30vw;
        font-weight: bold;
        flex-grow: 1;
    }
    .top-text {
        font-size: 7vw;
        position: absolute;
        top: 0;
        margin: 2vw 0;
    }
    .media-clock.not-playing .big-text { opacity: 0.25; }
    .media-clock.last-seconds .big-text { color: #ff3f3f; }
</style>

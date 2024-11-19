<template>
    <div class="rosHolder">
        <div class="rosControls">
            <button :disabled="this.rosItemIdx === 0" @click="prev()">Prev</button>
            <button @click="this.reset()">Reset</button>
            <button @click="toggleRunning()">{{ running ? 'Pause' : 'Resume' }}</button>
            <button :disabled="this.rosItemIdx + 1 === this.rosItems.length" @click="next()">Next</button>
        </div>
        <div class="rosSegments">
            <div class="currentSegment">
                <div class="currentInfo">A</div>
                <div class="currentTimelineHolder">
                    <div class="currentTimeline">
                        <div class="timer">{{ getTimeElapsed(counter) }}</div>
                        <div class="flex-initial" style="width: 100%;"></div>
                        <div class="timer">{{ getTimeElapsed(counter, true) }}</div>
                    </div>
                    <div class="timelineProgress" :style="{ width: getTimelineSegmentWidth(counter) }"></div>
                    <!-- {{ getTimeElapsed(counter) }} | {{ getTimeElapsed(counter, true) }} {{ counter }} -->
                </div>
            </div>
            <div class="nextSegment">
                <div class="nextInfo">B</div>
                <div class="nextTimeline">B</div>
            </div>
        </div>
    </div>
</template>
<script>
import prod from "@/views/sub-views/tools/collections/24.0 prod.json";
import tool from "@/views/sub-views/tools/ToolObsSceneCollections.vue";
import testRos from "@/testRos.json";
import { useInterval } from "@vueuse/core";
import { ref } from "vue";

export default {
    name: "RunOfShow",
    data: () => ({
        rosItemIdx: 0,
        producerClientKey: null,
        producerPreviewScene: null,
        producerProgramScene: null,

        // counter: null,
        running: ref(false),
        reset: () => {},
        pause: () => {},
        resume: () => {},

        noBroadcastStyle: true,
        noStinger: true,
    }),
    computed: {
        prodScenes() {
            return prod.scene_order
                .map((x) => x.name)
                .concat(tool.data().customScenes.map((x) => x.name), Array.from({ length: 12 }, (_, i) => `GFX ${i + 1}`));
        },
        rosItems() {
            return testRos;
        },
        currentItem() {
            if (this.rosItems.length <= this.rosItemIdx) return null;
            return this.rosItems[this.rosItemIdx];
        },
        nextItem() {
            if (this.rosItems.length < this.rosItemIdx) return null;
            return this.rosItems[this.rosItemIdx + 1];
        },
        nextScene() {
            if (this.rosItems.length < this.rosItemIdx) return null;
            if (!this.currentItem) return null;
            const rosScene = this.currentItem.scene;
            const currentScene = this.producerProgramScene;
            if (rosScene !== currentScene) console.log("Uhmb;", rosScene, currentScene);
            return this.rosItems.slice(this.rosItemIdx).find((x) => x.scene !== rosScene);
        },
        ticksRequired() {
            return this.currentItem.duration * 60 * 100;
        }
    },
    methods: {
        start() {
            const { counter, isActive, reset, pause, resume } = useInterval(10, { controls: true, callback: this.intervalCalled });
            this.counter = counter;
            this.running = isActive;
            this.reset = reset;
            this.pause = pause;
            this.resume = resume;
        },
        next() {
            if (this.rosItemIdx === this.rosItems.length - 1) return this.pause();
            this.rosItemIdx += 1;
            if (!this.counter) return this.start();
            this.reset();
            if (!this.running) this.resume();
        },
        prev() {
            if (this.rosItemIdx === 0) return this.pause();
            this.rosItemIdx -= 1;
            if (!this.counter) return this.start();
            this.reset();
            if (!this.running) this.resume();
        },
        toggleRunning() {
            if (!this.counter) return this.start();
            this.running ? this.pause() : this.resume();
        },
        intervalCalled(count) {
            if (count >= this.ticksRequired) return this.next();
            console.log(count);
        },
        getTimeElapsed(c, inv=false) {
            console.log(c);
            if (!c) c = 0;
            if (c.value) c = c.value;
            if (isNaN(c)) c = 0;
            if (inv) c = this.ticksRequired - c;
            console.log(c);
            if (c === 0) return "00:00:00:00";
            const pad = (n) => {
                return ("0" + n).slice(-2);
            };
            const seconds = Math.floor(c/100);
            const minutes = Math.floor(seconds / 60);
            const hours = pad(Math.floor(minutes / 60));
            const realSeconds = pad(seconds % 60);
            const realMinutes = pad(minutes % 60);
            const ms = pad(c % 100);

            return `${hours}:${realMinutes}:${realSeconds}:${ms}`;
        },
        getTimelineSegmentWidth(c, inv) {
            if (!c) return "0%";
            if (c.value) c = c.value;
            if (inv) c = this.ticksRequired - c;
            return `${c / this.ticksRequired * 100}%`;
        }
    },
    sockets: {
        prod_preview_program_change(data) {
            this.producerClientKey = data.clientSource;
            this.producerPreviewScene = data.previewScene;
            this.producerProgramScene = data.programScene;

            if (this.producerProgramScene === this.nextScene) {
                this.next();
            }
        }
    }
};
</script>
<style>
.rosHolder {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100vh;
    width: 100vw;
    background-color: #000000;
    color: #ffffff;
    place-items: center;
    font-size: clamp(20px, 3vw, 25vh);
    font-family: "SLMN-Industry", "Industry", sans-serif;
    text-align: center;
}
.rosSegments {
    display: flex;
    flex-direction: row;
    width: 100%;
    align-items: center;
}
.currentSegment {
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: center;
    justify-content: center;
}
.rosControls {
    display: flex;
    column-gap: .24em;
}
.currentTimelineHolder {
    position: relative;
    width: 85%;
    background-color: red;
    border-radius: 6px;
    overflow: hidden;
}
.currentTimeline {
    position: relative;
    display: flex;
    z-index: 1;
    flex-direction: row;
    padding: 0px 6px;
    width: 100%;
}
.timelineProgress {
    background-color: green;
    position: absolute;
    z-index: 0;
    height: 100%;
    top: 0px;
    border-radius: 6px;
}
.timer {
    text-align: left;
    min-width: 335px;
}
</style>
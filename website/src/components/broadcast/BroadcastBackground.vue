<template>
    <div v-if="background" class="background">
        <div v-if="type === 'image'" class="image-background full" :style="bg(backgroundURL)"></div>
        <div v-if="type === 'video'" class="video-background full flex-center">
            <video :src="backgroundURL" loop autoplay muted></video>
        </div>
    </div>
</template>

<script>
import { bg, getNewURL } from "@/utils/images";

export default {
    name: "BroadcastBackground",
    props: ["broadcast", "index"],
    data: () => ({
        noStinger: true
    }),
    computed: {
        backgroundURL() {
            return getNewURL(this.background, "orig");
        },
        processedIndex() {
            if (this.index == null) return null;
            if (this.index === 0) return 0;
            // make it 1-based unless a 0 is passed
            return parseInt(this.index) - 1;
        },
        background() {
            if (!this.broadcast?.background) return null;
            if (this.processedIndex && this.broadcast.background[this.processedIndex]) return this.broadcast.background[this.processedIndex];
            return this.broadcast.background[0];
        },
        type() {
            if (!this.background) return null;
            const types = this.background.type.split("/");
            return types[0];
        }
    },
    methods: {
        bg
    }
};
</script>

<style scoped>
    .background, .background > div {
        overflow: hidden;
    }
    .full {
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        position: absolute;
    }
    .image-background {
        background-size: cover;
        background-position: center;
    }
    video {
        min-width: 1920px;
    }
</style>

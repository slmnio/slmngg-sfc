<template>
    <div class="background" v-if="background">
        <div class="image-background full" v-if="type === 'image'" :style="{ backgroundImage: `url(${background.url})` }"></div>
        <div class="video-background full flex-center" v-if="type === 'video'">
            <video :src="background.url" loop autoplay muted />
        </div>
    </div>
</template>

<script>
export default {
    name: "BroadcastBackground",
    props: ["broadcast", "index"],
    computed: {
        background() {
            if (!this.broadcast?.background) return null;
            if (this.index && this.broadcast.background[this.index]) return this.broadcast.background[this.index];
            return this.broadcast.background[0];
        },
        type() {
            if (!this.background) return null;
            const types = this.background.type.split("/");
            return types[0];
        }
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

<template>
    <div
        class="media-overlay"
        style="height: 100vh; width: 100vw;"
        :class="{'black-out': ended }">
        <yt-player
            v-if="media && videoId"
            ref="youtube"
            class="player"
            :videoid="videoId"
            :player-vars="playerVars"
            width="100%"
            height="100%"
            :class="{'black-out': ended }"
            :controls="1"
            @ready="playerReady"
            @playing="playerPlaying"
            @ended="playerEnded" />
    </div>
</template>

<script>
import { socket } from "@/socket";
import { YoutubeVue3 } from "youtube-vue3";

const youtubeRegexp = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig;

/**
 * get id from url
 * @param  {string} url url
 * @return {string}     id
 */
export function getIdFromURL (url) {
    let id = url.replace(youtubeRegexp, "$1");

    if (id.includes(";")) {
        const pieces = id.split(";");

        if (pieces[1].includes("%")) {
            const uriComponent = decodeURIComponent(pieces[1]);
            id = `https://youtube.com${uriComponent}`.replace(youtubeRegexp, "$1");
        } else {
            id = pieces[0];
        }
    } else if (id.includes("#")) {
        id = id.split("#")[0];
    }

    return id;
}

export default {
    name: "MediaOverlay",
    components: { "yt-player": YoutubeVue3 },
    props: ["broadcast", "active", "animationActive"],
    data: () => ({
        player: null,
        playerVars: {
            start: 0,
            autoplay: 1,
            volume: 0,
            mute: 1
        },
        prepared: false,
        ended: false,
        emitTimeTimeout: 0
    }),
    computed: {
        media() {
            return this.broadcast?.highlight_media;
        },
        videoId() {
            if (!this.media?.embed) return null;
            return getIdFromURL(this.media.embed);
        }
    },
    methods: {
        preparePlayer() {
            console.log("prep1, active:", this.animationActive);
            if (this.prepared) return;
            console.log("prep2, active:", this.animationActive);

            this.$refs.youtube.player.pauseVideo();
            this.$refs.youtube.player.setVolume(100);
            this.$refs.youtube.player.unMute();
            this.$refs.youtube.player.seekTo(0);

            this.$refs.youtube.player.addEventListener("timeupdate", (d) => {
                console.log("timeupdate", { d });
            });

            this.prepared = true;
        },
        playerReady(e) {
            this.$refs.youtube.player = e.target;
            console.log("player ready", e);
            this.preparePlayer();
        },
        playerPlaying() {
            console.log("playing, active:", this.animationActive);
            this.ended = false;
            if (!this.active) this.prepared = false;
            this.preparePlayer();
        },
        playerEnded() {
            this.ended = true;
        },
        async emitTimes() {
            socket.emit("media_update", "time", {
                duration: await this.$refs.youtube?.player?.getDuration(),
                current: await this.$refs.youtube?.player?.getCurrentTime()
            });
        }
    },
    watch: {
        videoId(newMedia) {
            this.prepared = false;
        },
        async active(isActive) {
            if (isActive && this.$refs.youtube.player) {
                this.$refs.youtube.player.seekTo(0);
                this.ended = false;
            }
        },
        async animationActive(isActive) {
            if (isActive && this.$refs.youtube.player) {
                this.$refs.youtube.player.playVideo();
                this.ended = false;
                const remaining = await this.$refs.youtube?.player?.getDuration() - await this.$refs.youtube?.player?.getCurrentTime();
                socket.emit("media_update", "playing", true);
                socket.emit("media_update", "remaining", remaining);
            }
        },
        prepared(isPrepared) {
            socket.emit("media_update", "prepared", isPrepared);
            console.log({ isPrepared });
        },
        ended(ended) {
            socket.emit("media_update", "ended", ended);
        }
    },
    mounted() {
        if (this.emitTimeTimeout) clearInterval(this.emitTimeTimeout);
        this.emitTimeTimeout = setInterval(this.emitTimes, 500);
    },
    head() {
        return {
            title: `Media | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

<style scoped>
    .media-overlay:deep(.player) {
        width: 100vw;
        --overlap: 250px;
        height: calc(100vh + calc(var(--overlap) * 2));
        top: calc(var(--overlap) * -1);
        position: absolute;
    }
    .media-overlay:deep(.player):hover,
    body:hover :deep(.player) {
        --overlap: 0px;
    }
    .media-overlay.black-out {
        filter: brightness(0);
    }
</style>

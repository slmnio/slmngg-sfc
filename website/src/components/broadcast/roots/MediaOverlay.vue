<template>
    <div class="media-overlay">
        <yt-player class="player" v-if="media" :video-id="videoId" :player-vars="playerVars" player-width="100%" player-height="100%"
                   @ready="playerReady" @playing="playerPlaying" @ended="playerEnded" :class="{'black-out': ended }" />
    </div>
</template>

<script>
import { YouTubePlayer } from "vue-youtube-embed";

export default {
    name: "MediaOverlay",
    props: ["broadcast", "active", "animationActive"],
    components: { "yt-player": YouTubePlayer },
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
            return this.$youtube.getIdFromURL(this.media.embed);
        }
    },
    methods: {
        preparePlayer() {
            console.log("prep1, active:", this.animationActive);
            if (this.prepared) return;
            console.log("prep2, active:", this.animationActive);

            this.player.pauseVideo();
            this.player.setVolume(100);
            this.player.unMute();
            this.player.seekTo(0);

            this.player.addEventListener("timeupdate", (d) => {
                console.log("timeupdate", { d });
            });

            this.prepared = true;
        },
        playerReady(e) {
            this.player = e.target;
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
        emitTimes() {
            this.$socket.client.emit("media_update", "time", {
                duration: this.player.getDuration(),
                current: this.player.getCurrentTime()
            });
        }
    },
    watch: {
        videoId(newMedia) {
            this.prepared = false;
        },
        animationActive(isActive) {
            console.log("play media", this.player);
            if (isActive && this.player) {
                this.player.playVideo();
                this.$socket.client.emit("media_update", "playing", true);
                this.$socket.client.emit("media_update", "remaining", this.player.getDuration() - this.player.getCurrentTime());
            }
        },
        prepared(isPrepared) {
            this.$socket.client.emit("media_update", "prepared", isPrepared);
            console.log({ isPrepared });
        },
        ended(ended) {
            this.$socket.client.emit("media_update", "ended", ended);
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
    .player {
        width: 100vw;
        --overlap: 250px;
        height: calc(100vh + calc(var(--overlap) * 2));
        top: calc(var(--overlap) * -1);
        position: absolute;
    }
    .player:hover, body:hover .player {
        --overlap: 0px;
    }
    .player.black-out {
        filter: brightness(0);
    }
</style>

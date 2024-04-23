<template>
    <div class="media-overlay" style="height: 100vh; width: 100vw;">
        <yt-player class="player" v-if="media" :videoid="videoId" :player-vars="playerVars" width="100%" height="100%"
                   @ready="playerReady" @playing="playerPlaying" @ended="playerEnded" :class="{'black-out': ended }" />
    </div>
</template>

<script>
import { YoutubeVue3 } from "youtube-vue3";

const youtubeRegexp = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig

/**
 * get id from url
 * @param  {string} url url
 * @return {string}     id
 */
export function getIdFromURL (url) {
    let id = url.replace(youtubeRegexp, '$1')

    if (id.includes(';')) {
        const pieces = id.split(';')

        if (pieces[1].includes('%')) {
            const uriComponent = decodeURIComponent(pieces[1])
            id = `http://youtube.com${uriComponent}`.replace(youtubeRegexp, '$1')
        } else {
            id = pieces[0]
        }
    } else if (id.includes('#')) {
        id = id.split('#')[0]
    }

    return id
}

export default {
    name: "MediaOverlay",
    props: ["broadcast", "active", "animationActive"],
    components: { "yt-player": YoutubeVue3 },
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

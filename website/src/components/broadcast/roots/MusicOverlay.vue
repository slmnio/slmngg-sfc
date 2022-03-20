<template>
    <div class="song-holder">
        <transition name="song" mode="out-in">
            <div v-if="mainPlayer && showTitle" class="song-title industry-align">
                <i class="fas fa-music song-icon"></i>
                <transition name="song" mode="out-in">
                    <span class="song-text" :key="mainPlayer.title">
                        {{ mainPlayer.title }}
<!--                        [{{ "▓".repeat(Math.ceil((mainPlayer.currentTime / mainPlayer.duration) * 5)) }}{{ "░".repeat(5 - Math.ceil((mainPlayer.currentTime / mainPlayer.duration) * 5)) }}]-->
                    </span>
                </transition>
            </div>
        </transition>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot } from "@/utils/reactive";
import { Howl } from "howler";

class Track {
    constructor(trackData) {
        this.title = trackData?.title;
        this.artist = trackData?.artist;
        this.id = trackData?.id;
        this.loaded = false;
        this.audio = new Howl({
            src: [trackData?.file?.[0]?.url]
        });
        this.currentTime = 0;
        this.duration = this.audio.duration();
        this.interval = setInterval(() => {
            this.currentTime = this.audio.seek();
            this.duration = this.audio.duration();
            this.loaded = this.audio.state() === "loaded";
        }, 1000);
    }

    play(startingVolume) {
        this.duration = this.audio.duration();
        this.audio.volume(startingVolume);
        this.audio.play();
    }

    stop() {
        this.audio.stop();
        clearInterval(this.interval);
    }

    rampVolume(targetVolume, duration) {
        this.audio.fade(this.audio.volume(), targetVolume, duration * 1000);
    }
}

// solomon@solomon.eu.com

export default {
    name: "MusicOverlay",
    props: ["broadcast", "break", "showTitle"],
    data: () => ({
        started: false,
        mainPlayer: null,
        crossfadePlayer: null,
        intervals: {
            main: null
        },
        crossfading: false,
        crossfadeDuration: 10, // seconds
        volume: 0.2,
        playedTrackIds: []
    }),
    computed: {
        tracksData() {
            if (!this.broadcast?.id) {
                return {
                    caster_tracks: [],
                    break_tracks: []
                };
            }
            return ReactiveRoot(this.broadcast.id, {
                caster_tracks: ReactiveArray("caster_tracks", {
                    tracks: ReactiveArray("tracks")
                }),
                break_tracks: ReactiveArray("break_tracks", {
                    tracks: ReactiveArray("tracks")
                })
            });
        },
        trackList() {
            return this.break ? this.tracksData?.break_tracks?.flatMap(tl => tl?.tracks).filter(tl => tl) : this.tracksData?.caster_tracks?.flatMap(tl => tl?.tracks).filter(tl => tl);
        },
        unplayedTracks() {
            return this.trackList?.filter(t => t && !this.playedTrackIds.includes(t?.id));
        },
        loaded() {
            if (!this.trackList) return false;
            if (this.trackList?.length === 0) return false;
            return !this.trackList?.some(t => t.__loading);
        }
    },
    watch: {
        loaded(loaded) {
            if (loaded) {
                this.start();
            }
        },
        mainPlayer: {
            deep: true,
            handler(p) {
                if (p.duration - p.currentTime < this.crossfadeDuration && p.loaded) {
                    this.startCrossfade();
                }
            }
        },
        tracksData: {
            deep: true,
            handler(newData, oldData) {
                if (!this.loaded) return;
                const channel = this.break ? "break_tracks" : "caster_tracks";
                const oldTrackIds = oldData?.[channel]?.map(t => t?.id).join(",");
                const newTrackIds = newData?.[channel]?.map(t => t?.id).join(",");

                if (oldTrackIds !== newTrackIds) {
                    console.log("Track list changed");
                    this.startCrossfade();
                }
            }
        }
    },
    beforeDestroy() {
        this.mainPlayer?.stop();
        this.crossfadePlayer?.stop();
    },
    methods: {
        getNextTrack() {
            if (this.unplayedTracks.length === 0) {
                // if theres only one song in the list we can play it again
                this.playedTrackIds = this.trackList?.length > 1 ? [this.mainPlayer.id] : [];
            }
            const nextTrack = this.unplayedTracks[Math.floor(this.unplayedTracks.length * Math.random())];
            if (!nextTrack) console.warn("No track up next");
            // TODO: check here to see if there is a next track or not
            // that might happen if tracks haven't loaded yet? not sure
            // also if there are no unplayed tracks remaining
            this.playedTrackIds.push(nextTrack.id);
            return nextTrack;
        },
        start() {
            if (this.started) return console.warn(".start() called but the party's already started");
            console.log("Loaded, starting playback");
            this.started = true;
            const next = this.getNextTrack();
            this.mainPlayer = new Track(next);
            this.mainPlayer.play(this.volume);
        },
        startCrossfade() {
            if (this.crossfading || this.crossfadePlayer) return;
            console.log(`${this.mainPlayer.id} - ${this.mainPlayer.title}: Crossfading (${this.crossfadeDuration}s)`);
            this.crossfading = true;
            const next = this.getNextTrack();

            this.crossfadePlayer = new Track(next);
            this.crossfadePlayer.play(0);

            this.mainPlayer.rampVolume(0, this.crossfadeDuration);
            this.crossfadePlayer.rampVolume(this.volume, this.crossfadeDuration);

            setTimeout(() => {
                console.log("Crossfade at middle point, players are swapped");
                [this.mainPlayer, this.crossfadePlayer] = [this.crossfadePlayer, this.mainPlayer];
            }, this.crossfadeDuration * 500);

            setTimeout(() => {
                console.log("Crossfade finished, ending old player");
                this.crossfading = false;
                this.crossfadePlayer.stop();
                this.crossfadePlayer = null;
            }, this.crossfadeDuration * 1000);
        }
    }
};

</script>

<style scoped>
.song-title {
    position: absolute;
    left: 0;
    top: 0;
}
.song-enter-active, .song-leave-active {
    transition: all 400ms ease;
}

.song-enter, .song-leave-to {
    opacity: 0;
}

.fa-music {
    height: 1em;
    fill: currentColor;
    margin-right: .5em;
}

</style>

<template>
    <div class="song-holder">
        <transition name="song" mode="out-in">
            <div v-if="mainPlayer" class="song-title industry-align">
                <i class="fas fa-music"></i>
                {{ mainPlayer.title }}
            </div>
        </transition>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot } from "@/utils/reactive";

class Track {
    constructor(trackData) {
        this.title = trackData?.title;
        this.artist = trackData?.artist;
        this.id = trackData?.id;
        this.audio = new Audio(trackData?.file?.[0]?.url);
        this.currentTime = this.audio.currentTime;
        this.duration = this.audio.duration;
    }

    play(startingVolume) {
        this.audio.volume = startingVolume;
        this.audio.play();
        this.audio.addEventListener("timeupdate", (e) => {
            this.currentTime = e.target.currentTime;
            this.duration = e.target.duration;
        });
    }

    pause() {
        this.audio.pause();
    }

    rampVolume(targetVolume, duration) {
        const climbAmount = (targetVolume - this.audio.volume) / (duration * 10);

        console.log(`${this.id} - ${this.title}: climbing to ${targetVolume} at ${climbAmount}p`);

        const interval = setInterval(() => {
            if (this.audio.volume + climbAmount >= 1) {
                this.audio.volume = 1;
            } else if (this.audio.volume + climbAmount <= 0) {
                this.audio.volume = 0;
            } else {
                this.audio.volume += climbAmount;
            }
            if (this.audio.volume === targetVolume) {
                clearInterval(interval);
                this.audio.volume = targetVolume;
            }

            if (climbAmount > 0 && this.audio.volume >= targetVolume) {
                // climbing up & over
                clearInterval(interval);
                this.audio.volume = targetVolume;
            }
            if (climbAmount < 0 && this.audio.volume <= targetVolume) {
                // climbing down and under
                clearInterval(interval);
                this.audio.volume = targetVolume;
            }
        }, 100);
        setTimeout(() => {
            clearInterval(interval);
        }, (duration + 1) * 1000);
    }
}


export default {
    name: "MusicOverlay",
    props: ["broadcast", "break"],
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
            if (loaded && !this.started) {
                this.start();
            }
        },
        mainPlayer: {
            deep: true,
            handler(p) {
                if (p.duration - p.currentTime < this.crossfadeDuration) {
                    this.startCrossfade();
                }
            }
        }
    },
    methods: {
        getNextTrack() {
            if (this.unplayedTracks.length === 0) {
                this.playedTrackIds = [this.mainPlayer.id];
            }
            const nextTrack = this.unplayedTracks[Math.floor(this.unplayedTracks.length * Math.random())];
            this.playedTrackIds.push(nextTrack.id);
            return nextTrack;
        },
        start() {
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
                this.crossfadePlayer.pause();
                this.crossfadePlayer = null;
            }, this.crossfadeDuration * 1000);
        }
    }
};

</script>

<style scoped>


.song-enter-active, .song-leave-active {
    transition: all 400ms ease;
    position: absolute;
    left: 0;
    bottom: 0;
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

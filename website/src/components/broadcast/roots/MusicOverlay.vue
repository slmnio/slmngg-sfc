<template>
    <div class="song-holder">
        <transition name="song" mode="out-in">
            <div v-if="mainPlayer && showTitle && visible" class="song-title industry-align">
                <i class="fas fa-music song-icon"></i>
                <transition name="song" mode="out-in">
                    <span class="song-text" :key="mainPlayer.title">
                        {{ mainPlayer.title }}
<!--                        [{{ "▓".repeat(Math.ceil((mainPlayer.currentTime / mainPlayer.duration) * 5)) }}{{ "░".repeat(5 - Math.ceil((mainPlayer.currentTime / mainPlayer.duration) * 5)) }}]-->
                    </span>
                </transition>
            </div>
        </transition>
<!--        <ol style="margin-top: 3em">-->
<!--            <b>trackList</b>-->
<!--            <li v-for="track in trackList" :key="track && track.id">{{ track && track.title }}</li>-->
<!--        </ol>-->
<!--        <ol style="-->
<!--    margin-top: 3em;-->
<!--    position: absolute;-->
<!--    right: 3em;-->
<!--    top: 0;">-->
<!--            <b>loadedTrackList</b>-->
<!--            <li v-for="track in loadedTrackList" :key="track && track.id">{{ track && track.title }}</li>-->
<!--        </ol>-->
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot } from "@/utils/reactive";
import { Howl } from "howler";
import { getNewURL } from "@/utils/images";

class Track {
    constructor(trackData, loopSongs) {
        this.title = trackData?.title;
        this.artist = trackData?.artist;
        this.id = trackData?.id;
        this.loaded = false;
        this.audio = new Howl({
            src: [getNewURL(trackData?.file?.[0], "orig")],
            loop: loopSongs
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
        console.log("playing @ ", startingVolume);
        this.duration = this.audio.duration();
        this.audio.volume(startingVolume);
        this.audio.play();
    }

    stop() {
        this.audio.stop();
        clearInterval(this.interval);
    }

    rampVolume(startingVolume, targetVolume, duration) {
        this.audio.fade(startingVolume, targetVolume, duration * 1000);
    }
}


export default {
    name: "MusicOverlay",
    props: ["broadcast", "role", "showTitle", "volume", "crossfadeDuration", "active", "loopSongs"],
    data: () => ({
        started: false,
        mainPlayer: null,
        crossfadePlayer: null,
        crossfading: false,
        playedTrackIds: [],
        loadedTrackList: [],
        visible: true,
        lastTrack: null,
        noStinger: true
    }),
    computed: {
        tracksData() {
            if (!this.broadcast?.id) return;
            return ReactiveRoot(this.broadcast.id, {
                track_group_roles: ReactiveArray("track_group_roles", {
                    track_groups: ReactiveArray("track_groups", {
                        tracks: ReactiveArray("tracks")
                    })
                })
            });
        },
        trackList() {
            return (this.tracksData?.track_group_roles || [])
                ?.filter(trackGroupRole => trackGroupRole?.role?.toLowerCase() === this.role?.toLowerCase())
                ?.map(trackGroupRole => trackGroupRole.track_groups.map(trackGroup => trackGroup.tracks)).flat(2)
                ?.filter(t => t?.file?.length) || [];
        },
        unplayedTracks() {
            return this.loadedTrackList?.filter(t => t && !this.playedTrackIds.includes(t?.id) && t.file);
        }
        // loaded() {
        //     if (!this.trackList) return false;
        //     // This makes sure that [null] and [{}, {}] are ignored
        //     if (this?.trackList.filter(t => t && Object.keys(t).length !== 0)?.length === 0) return false;
        //     return !this.trackList?.some(t => t && t.__loading);
        // }
    },
    watch: {
        mainPlayer: {
            deep: true,
            handler(p) {
                if (this.loopSongs) return;
                if (p.duration - p.currentTime < this.crossfadeDuration && p.loaded) {
                    this.startCrossfade();
                }
            }
        },
        trackList(list) {
            if (!list?.length) return console.log("list empty");
            if (list.some(t => !t || t.__loading)) return console.log("some loading");
            this.loadedTrackList = list;
        },
        loadedTrackList(list) {
            if (!this.mainPlayer?.id && list.length) {
                return this.start();
            }
            if (!list.map(track => track.id).includes(this.mainPlayer.id)) {
                // Song currently playing isn't in the newest list, skip
                this.startCrossfade();
            }
        },
        active(isActive) {
            this.startNewSong(isActive);
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
                if (this.lastTrack) {
                    console.log(`Reshuffling player, but putting ${this.lastTrack} out of rotation since it played last.`);
                    this.playedTrackIds = this.trackList?.length > 1 ? [this.lastTrack] : [];
                } else {
                    console.warn("Nothing played last, we could have a duplicate");
                    this.playedTrackIds = [];
                }
            }
            const nextTrack = this.unplayedTracks[Math.floor(this.unplayedTracks.length * Math.random())];
            if (!nextTrack) {
                console.warn("No track up next");
                return null;
            }
            // TODO: check here to see if there is a next track or not
            // that might happen if tracks haven't loaded yet? not sure
            // also if there are no unplayed tracks remaining
            this.playedTrackIds.push(nextTrack.id);
            this.lastTrack = nextTrack.id;
            console.log(`[Next track] Played ${this.playedTrackIds.length}, unplayed: ${this.unplayedTracks.length} (list has ${this.trackList.length})`);
            return nextTrack;
        },
        start() {
            // if (this.started) return console.warn(".start() called but the party's already started");
            if (this.mainPlayer?.id) return console.warn(".start() called but the party's already started");
            console.log("Loaded, starting playback");

            const next = this.getNextTrack();
            if (!next) return;

            this.started = true;
            this.mainPlayer = new Track(next, this.loopSongs);
            this.mainPlayer.play(this.volume);
        },
        startCrossfade() {
            if (this.crossfading || this.crossfadePlayer) return;
            console.log(`Crossfading (${this.crossfadeDuration}s) - ${this.mainPlayer.id} - ${this.mainPlayer.title}`);
            this.crossfading = true;
            const next = this.getNextTrack();

            this.crossfadePlayer = new Track(next, this.loopSongs);
            this.crossfadePlayer.play(0);

            this.mainPlayer.rampVolume(this.volume, 0, this.crossfadeDuration);
            this.crossfadePlayer.rampVolume(0, this.volume, this.crossfadeDuration);

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
        },
        startNewSong(isActive) {
            if (this.crossfading) return; // already crossfading, dw about it
            if (isActive) {
                this.mainPlayer?.stop();
                this.mainPlayer = null;
                this.start();
                setTimeout(() => {
                    this.visible = true;
                }, this.broadcast?.transition_offset + 500 || 500);
            } else {
                this.visible = false;
            }
        }
    },
    metaInfo() {
        return {
            title: `Music (${this.role || ""}) | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    },
    sockets: {
        skip_song([group]) {
            console.log(group, this.role);
            if (group === this.role) {
                this.startNewSong(true);
            }
        }
    }
};

</script>

<style scoped>
.song-holder {
    font-family: "SLMN-Industry", "Industry", sans-serif;
}
.song-title {
    position: absolute;
    left: 0;
    top: 0;
}
.song-text {
    font-weight: bold;
}
.song-enter-active, .song-leave-active {
    transition: all 400ms ease;
}

.song-enter-from, .song-leave-to {
    opacity: 0;
}

.fa-music {
    height: 1em;
    fill: currentColor;
    margin-right: .5em;
}

</style>

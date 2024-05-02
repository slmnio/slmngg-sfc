<template>
    <transition v-if="useTransitions" mode="out-in" name="break-content" class="map-anim-holder">
        <div :key="autoKey" class="map-display d-flex w-100 h-100" :style="{'--total-maps': maps && maps.length }" :class="{'show-next-map': showNextMap && nextMap}">
            <MapSegment class="map" v-for="map in maps" :key="map.id" :small="small" :drafted-style="draftedStyle"
                :map="map" :show-map-video="showMapVideos" :broadcast="broadcast" :first-to="match && match.first_to" :use-shorter-names="useShorterMapNames"></MapSegment>
        </div>
    </transition>
    <div v-else class="map-display d-flex w-100 h-100" :style="{'--total-maps': maps && maps.length }" :class="{'show-next-map': showNextMap && nextMap}">
        <MapSegment class="map" v-for="map in maps" :key="map.id" :small="small" :drafted-style="draftedStyle"
                    :map="map" :show-map-video="showMapVideos" :broadcast="broadcast" :first-to="match && match.first_to" :use-shorter-names="useShorterMapNames"></MapSegment>
    </div>
</template>

<script>
import MapSegment from "@/components/broadcast/MapSegment";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { DefaultMapImages, likelyNeededMaps } from "@/utils/content-utils";
import { getNewURL } from "@/utils/images";

export default {
    name: "BroadcastMapDisplay",
    components: { MapSegment },
    props: ["broadcast", "animationActive", "useTransitions", "virtualMatch", "noMapVideos", "small", "draftedStyle"],
    data: () => ({
        activeAudio: null,
        showNextMap: false,
        showBannedMaps: true,
        audioStatus: "not playing"
    }),
    computed: {
        match() {
            if (this.virtualMatch) return this.virtualMatch;
            if (!this.broadcast?.live_match) return null;
            return ReactiveRoot(this.broadcast.live_match[0], {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                }),
                maps: ReactiveArray("maps", {
                    winner: ReactiveThing("winner", {
                        theme: ReactiveThing("theme")
                    }),
                    banner: ReactiveThing("banner", {
                        theme: ReactiveThing("theme")
                    }),
                    picker: ReactiveThing("picker", {
                        theme: ReactiveThing("theme")
                    }),
                    map: ReactiveThing("map", {
                        map: ReactiveThing("map")
                    })
                })
            });
        },
        mapTypes() {
            if (!this.broadcast?.map_set) return [];
            return this.broadcast.map_set.split(",");
        },
        maps() {
            // if (!this.match?.maps) {
            //     const maps = [];
            //     for (let i = 0; i < this.mapCount; i++) {
            //         maps.push({ dummy: true, ...(this.mapTypes ? { name: [this.mapTypes && this.mapTypes[i]], image: [{ url: DefaultMapImages[this.mapTypes[i]] }] } : {}) });
            //     }
            //     return maps;
            // }

            if (!this.match?.first_to) return this.match?.maps;

            let maps = [...(this.match?.maps || [])].filter(m => m.map);

            console.log("maps 75", maps);
            if (!this.showBannedMaps) {
                maps = maps.filter(m => !(m.banner || m.banned));

                if (this.match?.first_to) {
                    maps = maps.slice(0, this.likelyNeededMaps);
                }
            }


            const dummyMapCount = this.likelyNeededMaps - maps.length;
            console.log("extra maps", this.mapCount, dummyMapCount);
            const initialMapCount = maps.length;

            const next = maps.find(m => !m.winner && !m.draw && !m.banner);
            console.log({ next, maps });
            if (next) next._next = true;

            if (!this.match?.first_to) return maps;

            if (dummyMapCount > 0) {
                for (let i = 0; i < dummyMapCount; i++) {
                    const num = initialMapCount + i;
                    if (this.mapTypes[num]) maps.push({ dummy: true, ...(this.mapTypes ? { name: this.mapTypes?.[num], image: [{ url: DefaultMapImages[this.mapTypes[num]] }] } : {}) });
                }
            }

            let legitMapNum = 0;
            maps.forEach(map => {
                if (!map.banner) {
                    map._number = ++legitMapNum;
                }
            });
            return maps;
        },
        likelyNeededMaps() {
            return likelyNeededMaps(this.match);
        },
        mapCount() {
            if (!this.match) return 0;
            /* how many # of maps on screen */
            // minimum: first to
            // maximum: current maps + however many to get a win
            //          or current + 1 if no winner
            // if (!this.match.maps) return this.match.first_to;
            const scores = [this.match.score_1, this.match.score_2].map(s => s || 0);

            if (scores.some(s => s === this.match.first_to)) {
                // match complete
                return Math.max(this.likelyNeededMaps, scores[0] + scores[1]);
                // if (this.match.maps) return (this.match.maps || []).length;
                // return ;
            }

            const toWin = scores.map(s => this.match.first_to - s);
            console.log("each team maps to win", toWin);
            return (scores[0] + scores[1]) + Math.min(...toWin);
        },
        showMapVideos() {
            if (this.noMapVideos) return false;
            if (!this.broadcast?.broadcast_settings?.length) return false;
            return this.broadcast.broadcast_settings.includes("Use map videos");
        },
        nextMap() {
            const unplayedMaps = (this.maps || []).filter(m => !m.dummy && !m.winner && !m.draw && !m.banner);
            return unplayedMaps?.[0];
        },
        autoKey() {
            return [
                this.match?.id,
                ...(this.maps || []).map(m => [m.name, m.winner?.id || "live", m.draw].join("-"))
            ].join("_");
        },
        useShorterMapNames() {
            return this.broadcast?.broadcast_settings?.includes("Use shorter map names");
        },
        isInMapsScene() {
            return this.$root?.activeScene?.name?.toLowerCase().includes("maps");
        }
    },
    sockets: {
        map_music() {
            console.log("Map Music trigger");
            this.playAudio();
        },
        fade_map_music() {
            console.log("Fade Map Music trigger");
            this.fadeOutAudio(0, 5);
        }
    },
    methods: {
        playAudio() {
            if (this.nextMap?.map?.audio) {
                try {
                    this.runAudio({
                        audio: this.nextMap.map.audio,
                        volume: this.nextMap.map.audio_volume || 100
                    });
                } catch (e) {
                    this.activeAudio.stop();
                    this.activeAudio = null;
                }
            }
        },
        async runAudio(read) {
            if (this.audioStatus === "playing") {
                console.log("Audio is playing. Fading out...");
                return this.fadeOutAudio(0, 5);
            } else if (this.audioStatus === "fading out") {
                return console.log("Not doing anything since music is already fading out");
            }
            console.log("running audio", read);

            const audioURL = getNewURL(read.audio?.[0], "orig");
            if (!audioURL) return console.warn("no valid data", read);
            const audio = new Audio(audioURL);
            audio.volume = (read.volume || 100) / 100;
            audio.onended = () => {
                this.activeAudio = null;
                this.audioStatus = "not playing";
            };
            this.activeAudio = audio;
            this.audioStatus = "playing";
            await audio.play();
            return await new Promise((resolve, reject) => {
                audio.addEventListener("ended", () => {
                    this.activeAudio = null;
                    resolve();
                });
            });
        },
        async fadeOutAudio(targetVolume, duration) {
            if (this.audioStatus !== "playing") return;
            if (!this.activeAudio) return;
            const climbAmount = (targetVolume - this.activeAudio.volume) / (duration * 10);
            this.audioStatus = "fading out";

            console.log(`Climbing to ${targetVolume} at ${climbAmount}p`);

            const interval = setInterval(() => {
                if (!this.activeAudio) return;

                if (this.activeAudio.volume + climbAmount >= 1) {
                    this.activeAudio.volume = 1;
                } else if (this.activeAudio.volume + climbAmount <= 0) {
                    this.activeAudio.volume = 0;
                } else {
                    this.activeAudio.volume += climbAmount;
                }
                if (this.activeAudio.volume === targetVolume) {
                    clearInterval(interval);
                    this.activeAudio.volume = targetVolume;
                }

                if (climbAmount > 0 && this.activeAudio.volume >= targetVolume) {
                    // climbing up & over
                    clearInterval(interval);
                    this.activeAudio.volume = targetVolume;
                    if (targetVolume === 0) this.activeAudio = null;
                }
                if (climbAmount < 0 && this.activeAudio.volume <= targetVolume) {
                    // climbing down and under
                    clearInterval(interval);
                    this.activeAudio.volume = targetVolume;
                    if (targetVolume === 0) this.activeAudio = null;
                }
            }, 100);
            setTimeout(() => {
                clearInterval(interval);
                console.log("climbed");
                if (targetVolume === 0) this.activeAudio = null;
                this.audioStatus = "not playing";
            }, (duration + 1) * 1000);
        },
        stopAudio() {
            if (this.activeAudio) {
                this.activeAudio.pause();
                this.activeAudio = null;
                this.audioStatus = "not playing";
            }
        }
    },
    watch: {
        animationActive(isActive) {
            this.showNextMap = false;

            console.log("animation active", isActive, this.isInMapsScene);

            if (isActive && this.nextMap?.map) {
                console.log("Animation trigger");
                if (this.isInMapsScene) this.playAudio();
                setTimeout(() => {
                    this.showNextMap = true;
                }, 3000);
            }
            if (!isActive && this.activeAudio) {
                console.log("Animation reset - stopping audio");
                this.stopAudio();
            }
        },
        audioStatus(is, was) {
            console.log({ was, is });
        }
    }
};
</script>

<style scoped>
    .map:first-of-type {
        margin-left: 0;
    }
    .map:last-of-type {
        margin-right: 0;
    }

    .map-display.show-next-map:deep(.map.next-map) {
        flex-grow: 5;
    }

    .map-display :deep(.map-lower-name) {
        transform: scale(1);
        transition: all 800ms ease;
        width: 100%;
        /*border: 1px solid red;*/
    }
    .map-display :deep(.map.next-map .map-lower-name) {
        width: 39.8%;
        /*border: 1px solid lime;*/
    }
    .map-display:not(.show-next-map) :deep(.map .map-lower-name) {
        width: 76.8%;
        /*transform: scale(0.75);*/
    }
    .map-display.show-next-map :deep(.map:not(.next-map) .map-lower-name) {
        width: 100%;
        transform: scale(0.75);
    }
    .break-content-enter-active, .break-content-leave-active { transition: all .35s ease; overflow: hidden }
    .break-content-enter-from { clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%); }
    .break-content-leave-to { clip-path: polygon(0 0, 0 0, 0 100%, 0% 100%); }
    .break-content-enter-to, .break-content-leave-from { clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%); }

    .map-anim-holder {
        position: relative;
        width: 100%;
        height: 100%;
        display: block;
    }
</style>

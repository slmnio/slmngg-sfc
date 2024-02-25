<template>
    <div class="map-bump-overlay">
        <transition name="swipe-right">
            <div class="overlay-container" v-if="animationActive && nextMap">
                <div class="last-map" v-if="mostRecentMap">
                    <div class="title flex-center">PREVIOUSLY</div>
                    <div class="content map-holder">
                        <div class="map-image" :style="mostRecentMapBG"></div>
                        <div class="map-gel dark"></div>
                        <div class="map-gel winners d-none" :style="winnerBG(mostRecentMap)"></div>
                        <div class="map-winners-logo-holder flex-center d-none">
                            <div class="map-winners-logo bg-center" :style="winnerLogo(mostRecentMap)"></div>
                            <div class="map-winners-score"></div>
                        </div>
                    </div>
                </div>
                <div class="up-next-map">
                    <div class="title flex-center">UP NEXT: MAP {{ nextMap?._number }}</div>
                    <div class="content text flex-center">
                        {{ nextMap?.map?.name || nextMap?.name?.[0] }}
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>
<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { DefaultMapImages, likelyNeededMaps } from "@/utils/content-utils";
import { bg, getNewURL, resizedImage } from "@/utils/images";
import { logoBackground1 } from "@/utils/theme-styles";

export default {
    name: "MapBumpOverlay",
    props: ["broadcast", "animationActive"],
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
            if (!this.match?.first_to) return this.match?.maps;

            let maps = [...(this.match?.maps || [])].filter(m => m.map);

            if (this.showBannedMaps) {
            } else {
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
                    if (this.mapTypes[num]) maps.push({ dummy: true, ...(this.mapTypes ? { name: this.mapTypes && this.mapTypes[num], image: [{ url: DefaultMapImages[this.mapTypes[num]] }] } : {}) });
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
        mostRecentMap() {
            const playedMaps = (this.maps || []).filter(m => !m.dummy && (m.winner || m.draw));
            if (!playedMaps?.length) return null;
            return playedMaps?.[playedMaps.length - 1];
        },
        mostRecentMapBG() {
            if (!this.mostRecentMap) return {};

            const map = this.mostRecentMap;
            const image = (map?.map?.big_image || map?.map?.image || map?.big_image || map?.image)?.[0];
            if (!(image)) return {};
            return bg(image?.url || getNewURL(image, "w-400"));
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
            return this.$root?.activeScene?.name?.toLowerCase().includes("map");
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
        winnerBG(map) {
            return logoBackground1(map.winner);
        },
        winnerLogo(map) {
            return resizedImage(map.winner?.theme, ["default_logo", "small_logo"], "w-400");
        },
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
                audio.addEventListener("ended", async () => {
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
        }
    }
};
</script>
<style scoped>
    .overlay-container {
        position: absolute;
        bottom: 120px;
        left: 40px;
        height: 140px;
        display: flex;
    }

    .title {
        height: 40px;
        padding: 0 10px;
        background-color: #222;
        color: white;
        font-size: 24px;
        font-weight: bold;
        text-transform: uppercase;
    }

    .last-map {
        width: 165px;
    }

    .up-next-map {
        margin-left: 10px;
        width: 450px;
    }

    .content {
        flex-grow: 1;
        width: 100%;
    }

    .last-map, .up-next-map {
        display: flex;
        flex-direction: column;
    }

    .content.map-holder {
        position: relative;
    }
    .map-image {
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        filter: grayscale(1);
    }

    .content.text {
        background-color: white;
        font-size: 48px;
        font-weight: bold;
        text-transform: uppercase;
        text-align: center;
        line-height: 0.9;
    }

    .map-gel, .map-image, .map-winners-logo-holder {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .map-gel {
        opacity: 0.33;
    }
    .map-gel.dark {
        background-color: black;
    }
    .map-winners-logo {
        width: 50%;
        height: 60%;
    }


    .swipe-right-enter-active {
        transition: clip-path .5s ease 2s;
    }


    .swipe-right-enter-to {
        /* full open */
        clip-path: polygon(-1% -1%, 101% -1%, 101% 101%, -1% 101%);
    }

    .swipe-right-enter {
        /* closed left */
        clip-path: polygon(0 0, 0 0, 0 100%, 0% 100%);
    }

</style>

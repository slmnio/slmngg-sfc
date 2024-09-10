<template>
    <div class="match-vod">
        <EmbeddedVideo v-if="vodLink" :src="vodLink" />

        <div v-if="match.vod_2" class="vod-2-holder d-flex justify-content-end w-100 mt-2 gap-1">
            <div class="btn btn-sm text-light">This match has multiple VODs:</div>
            <div v-if="!useVOD2" class="btn btn-dark btn-sm" @click="useVOD2 = true">Show part 2</div>
            <div v-if="useVOD2" class="btn btn-dark btn-sm" @click="useVOD2 = false">Show part 1</div>
        </div>
        <div v-else-if="match.alternative_vod" class="vod-2-holder d-flex justify-content-end w-100 mt-2 gap-1">
            <div class="btn btn-sm text-light">This match has multiple VODs:</div>
            <div class="btn btn-dark btn-sm" :class="{'bg-primary': vodLink === match.vod}" @click="useAlternativeVOD = false">
                <i class="fa-fw" :class="getEmbedData(match.vod)?.display?.icon"></i> {{ getEmbedData(match.vod)?.display?.text }}
            </div>
            <div class="btn btn-dark btn-sm" :class="{'bg-primary': vodLink === match.alternative_vod}" @click="useAlternativeVOD = true">
                <i class="fa-fw" :class="getEmbedData(match.alternative_vod)?.display?.icon"></i> {{ getEmbedData(match.alternative_vod)?.display?.text }}
            </div>
        </div>

        <div v-if="showNoVOD" class="embed ratio ratio-16x9">
            <div class="no-embed-text flex-center">No VOD available for this match</div>
        </div>
        <div v-if="match.maps" class="maps-container mt-3 flex-column">
            <div v-if="hasBannedMaps" class="checkbox-holder flex-center justify-content-end">
                <b-form-checkbox v-model="showBannedMaps" switch> Show banned maps</b-form-checkbox>
            </div>
            <div class="maps-holder flex-center w-100">
                <MapDisplay
                    v-for="(map, i) in match.maps"
                    :key="map.id"
                    :i="i"
                    :map="map"
                    :match="match"
                    :theme="theme"
                    :show-banned-maps="showBannedMaps" />
            </div>
        </div>
    </div>
</template>

<script>
import EmbeddedVideo from "@/components/website/EmbeddedVideo";
import MapDisplay from "@/components/website/match/MapDisplay";
import { cleanID, getEmbedData } from "@/utils/content-utils";
import { ReactiveArray, ReactiveRoot } from "@/utils/reactive";

export default {
    name: "MatchVOD",
    components: { EmbeddedVideo, MapDisplay },
    props: ["match"],
    data: () => ({
        useVOD2: false,
        useAlternativeVOD: false,
        showBannedMaps: false
    }),
    computed: {
        showNoVOD() {
            console.log("_match", this.match, !!this.match);
            if (!this.match) return false;
            if (this.match.__loading || !this.match.id) return false;
            if (this.match && !this.vodLink) return true;
            return false;
        },
        liveBroadcasts() {
            if (!this.isAdvertised) return [];
            return (ReactiveRoot(this.match?.id, {
                "live_broadcast": ReactiveArray("live_broadcast")
            })?.live_broadcast) || [];
        },
        vodLink() {
            if (this.useVOD2) return this.match?.vod_2;
            if (this.useAlternativeVOD) return this.match?.alternative_vod;
            if (this.match?.vod) return this.match?.vod;
            if (this.isAdvertised && this.liveBroadcasts) {
                // try and find a broadcast this is on
                try {
                    for (const broadcast of this.liveBroadcasts) {
                        if (broadcast?.stream_url) return broadcast.stream_url;
                        if (broadcast?.stream_link) {
                            if (broadcast.stream_link.startsWith("http")) {
                                return broadcast.stream_link;
                            } else {
                                return broadcast.stream_link.replace("twitch.tv", "https://twitch.tv").replace("youtube.com", "https://youtube.com");
                            }
                        }
                        if (broadcast?.channel_username?.[0]) {
                            return `https://twitch.tv/${broadcast.channel_username[0]}`;
                        }
                    }
                } catch (e) {
                    console.warn("Broadcast finding failed", e);
                }
            }
            return null;
        },
        theme() {
            return this.match?.event?.theme;
        },
        hasBannedMaps() {
            if (!this.match.maps?.length) return false;
            return this.match.maps.some(m => m.banner || m.banned);
        },
        isAdvertised() {
            const liveMatchIDs = (ReactiveRoot("special:live-matches")?.matches || []);
            return !!(liveMatchIDs.find(id => cleanID(id) === cleanID(this.match?.id)));
        }
    },
    methods: { getEmbedData }
};
</script>

<style scoped>
    .embed {
        background: #171717;
    }

    .maps-holder {
        align-items: flex-start;
    }

    .no-embed-text {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        font-size: 1.5em;
    }
</style>

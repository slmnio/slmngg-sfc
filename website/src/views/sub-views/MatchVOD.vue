<template>
    <div class="match-vod">
        <EmbeddedVideo v-if="vodLink" :src="vodLink" />
        <div v-else-if="showNoVOD" class="embed ratio ratio-16x9">
            <div class="no-embed-text flex-center">No VOD available for this match</div>
        </div>

        <div class="vod-buttons vod-2-holder d-flex justify-content-end w-100 mt-2 gap-1">
            <div v-if="match.vod_2" class="d-flex gap-1">
                <div class="btn-text text-light">This match has multiple VODs:</div>
                <div v-if="!useVOD2" class="btn btn-dark btn-sm" @click="useVOD2 = true">Show part 2</div>
                <div v-if="useVOD2" class="btn btn-dark btn-sm" @click="useVOD2 = false">Show part 1</div>
            </div>
            <div v-else-if="match.alternative_vod" class="d-flex gap-1">
                <div class="btn-text text-light">This match has multiple VODs:</div>
                <div
                    class="btn btn-dark btn-sm"
                    :class="{'bg-primary': vodLink === match.vod}"
                    @click="useAlternativeVOD = false">
                    <i class="fa-fw" :class="getEmbedData(match.vod)?.display?.icon"></i>
                    {{ getEmbedData(match.vod)?.display?.text }}
                </div>
                <div
                    class="btn btn-dark btn-sm"
                    :class="{'bg-primary': vodLink === match.alternative_vod}"
                    @click="useAlternativeVOD = true">
                    <i class="fa-fw" :class="getEmbedData(match.alternative_vod)?.display?.icon"></i>
                    {{ getEmbedData(match.alternative_vod)?.display?.text }}
                </div>
            </div>
            <div v-if="communityMatchStreams.length" class="d-flex gap-1">
                <div class="btn-text text-light">Player streams:</div>
                <div
                    v-for="stream in communityMatchStreams"
                    :key="stream?.player?.id"
                    class="btn btn-dark btn-sm d-flex flex-center border-transparent"
                    :class="{'bg-primary text-white': selectedCommunityStream === stream.url || vodLink === stream.url}"
                    :style="themeBackground1(stream?.team)"
                    @click="selectedCommunityStream = selectedCommunityStream === stream.url ? null : stream.url">
                    <theme-logo
                        :theme="stream?.team?.theme"
                        border-width="2px"
                        icon-padding="2px"
                        logo-size="s-64"
                        class="team-theme-logo" />
                    <div>{{ stream?.player?.name }}</div>
                </div>
            </div>
        </div>

        <div v-if="match.maps" class="maps-container mt-3 flex-column">
            <div v-if="hasBannedMaps" class="checkbox-holder flex-center justify-content-end">
                <b-form-checkbox v-model="showBannedMaps" switch> Show banned maps</b-form-checkbox>
            </div>
            <div v-if="hasPickBanHeroes" class="checkbox-holder flex-center justify-content-end">
                <b-form-checkbox v-model="showPickBanHeroes" switch> Show picked/banned {{ gameOverride?.lang?.heroes?.toLowerCase() || 'heroes' }}</b-form-checkbox>
            </div>
            <div class="maps-holder flex-center w-100">
                <MapDisplay
                    v-for="(map, i) in match.maps"
                    :key="map.id"
                    :i="i"
                    :map="map"
                    :match="match"
                    :theme="theme"
                    :show-banned-maps="showBannedMaps"
                    :show-pick-ban-heroes="showPickBanHeroes"
                />
            </div>
        </div>
    </div>
</template>

<script>
import EmbeddedVideo from "@/components/website/EmbeddedVideo";
import MapDisplay from "@/components/website/match/MapDisplay";
import { cleanID, getEmbedData, hydratedCommunityStreams } from "@/utils/content-utils";
import { ReactiveArray, ReactiveRoot } from "@/utils/reactive";
import { GameOverrides } from "@/utils/games";
import { themeBackground1 } from "@/utils/theme-styles";
import ThemeLogo from "@/components/website/ThemeLogo.vue";

export default {
    name: "MatchVOD",
    components: { ThemeLogo, EmbeddedVideo, MapDisplay },
    props: ["match"],
    data: () => ({
        useVOD2: false,
        useAlternativeVOD: false,
        showBannedMaps: false,
        showPickBanHeroes: false,
        selectedCommunityStream: null
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
        communityMatchStreams() {
            return (hydratedCommunityStreams().value || []).filter(stream => cleanID(stream?.match?.id) === cleanID(this.match?.id));
        },
        vodLink() {
            if (this.selectedCommunityStream) return this.selectedCommunityStream;
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

            if (this.communityMatchStreams.length === 1) return this.communityMatchStreams[0]?.url;
            return null;
        },
        theme() {
            return this.match?.event?.theme;
        },
        hasBannedMaps() {
            if (!this.match.maps?.length) return false;
            return this.match.maps.some(m => m.banner || m.banned);
        },
        hasPickBanHeroes() {
            if (!this.match.maps?.length) return false;
            return this.match.maps.some(m => m.team_1_picks || m.team_2_picks || m.team_1_bans || m.team_2_bans);
        },
        isAdvertised() {
            const liveMatchIDs = (ReactiveRoot("special:live-matches")?.matches || []);
            return !!(liveMatchIDs.find(id => cleanID(id) === cleanID(this.match?.id)));
        },
        gameOverride() {
            if (this.match?.game || this.match?.event?.game) return GameOverrides[this.match?.game || this.match?.event?.game];
            return null;
        },
    },
    methods: { themeBackground1, getEmbedData }
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
    .btn-text {
        font-size: 0.875rem;
        padding: 0.25rem 0.5rem;
        border: 1px solid transparent;
    }

    .team-theme-logo {
        height: 1.75em;
        margin: -0.5em 0;
        width: 2em;
        margin-right: .25em;
    }
</style>

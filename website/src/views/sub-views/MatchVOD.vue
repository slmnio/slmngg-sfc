<template>
    <div class="match-vod">
        <EmbeddedVideo :src="vodLink" v-if="vodLink" />

        <div class="vod-2-holder d-flex justify-content-end w-100 mt-2" v-if="match.vod_2">
            <div class="btn btn-sm text-light">This match has multiple VODs:</div>
            <div class="btn btn-dark btn-sm" @click="useVOD2 = true" v-if="!useVOD2">Show part 2</div>
            <div class="btn btn-dark btn-sm" @click="useVOD2 = false" v-if="useVOD2">Show part 1</div>
        </div>

        <div class="embed embed-responsive embed-responsive-16by9" v-if="showNoVOD">
            <div class="no-embed-text flex-center">No VOD available for this match</div>
        </div>
        <!--  TODO: add spoilers? -->
        <div class="maps-holder mt-3 flex-center" v-if="match.maps">
            <MapDisplay v-for="(map, i) in match.maps" :i="i" :map="map" :match="match" :theme="theme" v-bind:key="map.id"/>
        </div>
    </div>
</template>

<script>
import EmbeddedVideo from "@/components/website/EmbeddedVideo";
import MapDisplay from "@/components/website/match/MapDisplay";

export default {
    name: "MatchVOD",
    props: ["match"],
    components: { EmbeddedVideo, MapDisplay },
    data: () => ({
        useVOD2: false
    }),
    computed: {
        showNoVOD() {
            console.log("_match", this.match, !!this.match);
            if (!this.match) return false;
            if (this.match.__loading || !this.match.id) return false;
            if (this.match && !this.match.vod) return true;
            return false;
        },
        vodLink() {
            if (this.useVOD2) return this.match?.vod_2;
            return this.match?.vod;
        },
        theme() {
            return this.match?.event?.theme;
        }
    }
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

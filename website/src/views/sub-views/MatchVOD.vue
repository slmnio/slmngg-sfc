<template>
    <div class="match-vod">
        <EmbeddedVideo :src="match.vod" v-if="match && match.vod" />
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
import MapDisplay from "@/components/website/MapDisplay";

export default {
    name: "MatchVOD",
    props: ["match"],
    components: { EmbeddedVideo, MapDisplay },
    computed: {
        showNoVOD() {
            console.log("_match", this.match, !!this.match);
            if (!this.match) return false;
            if (this.match.__loading || !this.match.id) return false;
            if (this.match && !this.match.vod) return true;
            return false;
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

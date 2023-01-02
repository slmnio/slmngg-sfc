<template>
    <div class="map d-flex position-relative" v-bind:class="{'next-map': map._next }">
        <div v-if="mapVideo" class="map-bg map-video w-100 h-100 bg-center" v-bind:class="{'grayscale': !!winnerBG || (map && map.draw) || (map && map.banner)}" :style="mapBackground">
            <video :src="mapVideo" autoplay muted loop></video>
        </div>
        <div v-else class="map-bg w-100 h-100 bg-center" v-bind:class="{'grayscale': !!winnerBG || (map && map.draw) || (map && map.banner)}" :style="mapBackground"></div>
        <div class="map-gel w-100 h-100 position-absolute" :style="winnerBG"></div>
        <div class="map-gel w-100 h-100 position-absolute draw-gel" v-if="map && map.draw"></div>
        <div class="map-gel w-100 h-100 position-absolute ban-gel flex-center" v-if="map && map.banner"></div>
        <div class="map-main d-flex flex-column h-100 w-100 position-absolute">
            <div class="map-upper flex-center" :style="accent" v-if="map.picker || map.banner">
                <ThemeLogo class="pick-ban-team" :theme="pickBanTheme" border-width="4px" logo-size="w-100" icon-padding="2" />
                <div class="pick-ban-text" :style="pickBanBorder">{{ map.banner ? 'Ban' : (map.picker ? 'Pick' : '')  }}</div>
            </div>
            <div class="map-top flex-grow-1 h-100 w-100 flex-center flex-column">
                <div class="map-logo-holder w-100 h-50 flex-center" v-if="winnerBG">
                    <div class="map-logo bg-center" :style="winnerLogo"></div>
                </div>
                <div class="gel-text" v-if="map && map.draw">DRAW</div>
                <div class="ban-icon-holder" v-if="map.banner">
                    <i class="ban-icon fas fa-ban"></i>
                </div>
                <div class="map-score flex-center" v-if="showMapScores && (map.score_1 || map.score_2)">
                    <div class="map-score">{{ map.score_1 }}</div>
                    <div class="map-dash">-</div>
                    <div class="map-score">{{ map.score_2 }}</div>
                </div>
            </div>
            <div class="map-lower flex-center flex-column" :style="accent">
                <div class="map-lower-name"><span class="industry-align">{{ name }}</span></div>
                <div class="map-lower-type" v-if="type"><span class="industry-align">{{ type }}</span></div>
            </div>
        </div>
    </div>
</template>

<script>
import { logoBackground } from "@/utils/theme-styles";
import { resizedImage } from "@/utils/images";
import ThemeLogo from "@/components/website/ThemeLogo";


export default {
    name: "MapSegment",
    props: ["broadcast", "map", "accentColor", "showMapVideo", "firstTo", "useShorterNames"],
    components: {
        ThemeLogo
    },
    computed: {
        pickBanTheme() {
            return (this.map.banner || this.map.picker)?.theme;
        },
        pickBanBorder() {
            return {
                borderBottom: `4px solid ${this.pickBanTheme?.color_logo_accent || this.pickBanTheme?.color_accent || "rgba(255,255,255,0.2)"}`
            };
        },
        mapBackground() {
            if (!(this.map?.big_image || this.map?.image)) return {};

            try {
                return {
                    backgroundImage: `url(${(this.map.big_image || this.map.image)[0].url}`
                };
            } catch (e) {
                return {};
            }
        },
        name() {
            if (!(this.map?.map?.name || this.map?.name)) return null;
            if (this.useShorterNames && this.map?.map?.shorter_name) return this.map.map.shorter_name;
            const topLevelName = typeof this.map?.name === "object" ? this.map?.name?.[0] : this.map?.name;
            return this.map?.map?.name || topLevelName;
        },
        showMapScores() {
            return (this.broadcast?.broadcast_settings || [])?.includes("Show map scores");
        },
        type() {
            if (!this.broadcast?.broadcast_settings?.includes("Show map modes text")) return null;
            // Do the map specific name first, then the map data first
            if (this.map?.mode) return this.map.mode; // Custom map instance text
            if (this.map?.type?.length) return this.map.type[0]; // Map data (.map.type is a rollup from Airtable)
            return this.map.mode;
        },
        accent() {
            if (!this.accentColor) return {};
            return {
                backgroundColor: this.accentColor.theme,
                color: this.accentColor.text_on_theme
            };
        },
        winnerBG() {
            if (!this.map?.winner?.theme) return null;
            return logoBackground(this.map.winner.theme);
        },
        winnerLogo() {
            if (!this.map?.winner?.theme) return {};
            const keys = ["default_logo", "small_logo"];
            if (this.firstTo && this.firstTo > 2) {
                keys.unshift("default_wordmark");
            }
            return resizedImage(this.map.winner.theme, keys, "w-400");
        },
        mapVideo() {
            if (!this.showMapVideo) return null;
            if (!this.map?.map?.map_video?.length) return null;
            return this.map.map.map_video[0].url;
        }
    }
};
</script>

<style scoped>
    .map {
        flex-direction: column;
        margin: 0 12px;
        overflow: hidden;

        width: 0 !important;
        flex-grow: 2;
        transition: all 800ms ease;
    }
    .map-bg {
        background-size: cover;
    }
    .map-bg.grayscale {
        filter: grayscale(1);
    }
    .map-lower,
    .map-upper {
        font-size: 36px;
        text-align: center;
        padding: 10px 5px;
        line-height: 1;
        min-height: 100px;

        /* default */
        background-color: #333333;
        color: #ffffff;
    }
    .map-upper {
        font-size: 24px;
        min-height: 2em;
        padding: 0;
    }
    .pick-ban-text {
        padding: 10px 5px;
        width: 100%;
        text-align: center;
    }
    .map-lower-type {
        font-size: 0.6em;
        text-align: center;
        padding-top: 0.25em;
    }
    .map-main {
        z-index: 2;
    }
    .map-gel {
        opacity: 0.5;
    }
    .map-logo {
        width: 90%;
        height: 90%;
    }
    .map-gel.draw-gel {
        background-color: #555;
    }
    .gel-text {
        color: white;
        font-size: 60px;
    }

    .map-bg video {
        height: 100%;
        object-fit: cover;
        width: 100%;
    }

    .map-bg.map-video {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
    }
    .pick-ban-team {
        width: 55px;
        height: 100%;
    }
    .ban-icon-holder {
        font-size: 4em;
    }
    .ban-icon {
        color: white;
        opacity: 0.75;
    }
    .map-score {
        font-size: 1.5em;
    }
    .map-dash {
        margin: 0 .2em;
    }
</style>

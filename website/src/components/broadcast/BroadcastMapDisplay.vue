<template>
    <div class="map w-100 d-flex position-relative">
        <div class="map-bg w-100 h-100 bg-center" v-bind:class="{'grayscale': !!winnerBG}" :style="mapBackground"></div>
        <div class="map-gel w-100 h-100 position-absolute" :style="winnerBG"></div>
        <div class="map-main d-flex flex-column h-100 w-100 position-absolute">
            <div class="map-top flex-grow-1 h-100 w-100 flex-center">
                <div class="map-logo-holder w-100 h-50 flex-center">
                    <div class="map-logo bg-center" :style="winnerLogo"></div>
                </div>
            </div>
            <div class="map-lower" :style="accent">
                <span class="industry-align">{{ name }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import { logoBackground } from "@/utils/theme-styles";
import { cssImage } from "@/utils/content-utils";

export default {
    name: "BroadcastMapDisplay",
    props: ["map", "accentColor"],
    computed: {
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
            if (!this.map?.name) return null;
            return this.map.name[0];
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
            return cssImage("backgroundImage", this.map.winner.theme, ["default_wordmark", "default_logo", "small_logo"], 400);
        }
    }
};
</script>

<style scoped>
    .map {
        flex-direction: column;
        margin: 0 12px;
    }
    .map-bg {
        background-size: cover;
    }
    .map-bg.grayscale {
        filter: grayscale(1);
    }
    .map-lower {
        font-size: 30px;
        text-align: center;
        padding: 10px 5px;
        line-height: 1;
        min-height: 85px;
        display: flex;
        justify-content: center;
        align-items: center;
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
</style>

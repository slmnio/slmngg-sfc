<template>
    <SoloControlButton class="map-button" :click="() => click()" :style="bg" :noclick="noclick">
        <div class="top flex-center" v-if="topText">
            <div class="text top-text">{{ topText }}</div>
        </div>
        <div class="text">{{ text }}</div>
    </SoloControlButton>
</template>

<script>
import SoloControlButton from "@/components/broadcast/SoloControlButton";
import { resizedImage } from "@/utils/images";

export default {
    name: "SoloMapButton",
    components: { SoloControlButton },
    props: ["map", "click", "topText", "noclick"],
    computed: {
        bg() {
            console.log("Map BG", this.map);
            if (!this.map?.image) return {};
            return resizedImage(this.map, ["image"], "h-200");
        },
        text() {
            return this.map?.short_name || "Choose map";
        }
    }
};
</script>

<style scoped>
    .map-button {
        color: white !important;
        background-size: cover;
        background-position: center;
        font-size: 2em;
        justify-content: flex-end;
        padding-bottom: 15px;
        position: relative;
    }
    .map-button >>> div.text {
        background-color: rgba(0,0,0,0.8);
        padding: 3px 8px;
    }
    .top {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        padding-top: 15px;
    }
</style>

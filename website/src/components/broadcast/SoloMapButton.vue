<template>
    <SoloControlButton class="map-button" :click="() => click()" :style="bg">
        <div class="text">{{ text }}</div>
    </SoloControlButton>
</template>

<script>
import SoloControlButton from "@/components/broadcast/SoloControlButton";
export default {
    name: "SoloMapButton",
    components: { SoloControlButton },
    props: ["map", "click"],
    computed: {
        bg() {
            console.log(this.map);
            if (!this.map?.map_image) return {};
            return {
                backgroundImage: `url(${this.map.map_image[0].url})`
            };
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
    }
    .map-button >>> div.text {
        background-color: rgba(0,0,0,0.8);
        padding: 3px 8px;
    }
</style>

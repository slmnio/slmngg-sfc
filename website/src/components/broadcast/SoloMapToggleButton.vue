<template>
    <SoloControlButton class="map-button" :click="() => click()" :style="bg" :noclick="noclick">
        <div class="top flex-center" v-if="topText">
            <div class="text top-text">{{ topText }}</div>
        </div>

        <div class="selection-box" v-if="!noclick">
            <div class="box empty" :class="{'active': !current}">
                No winner
            </div>
            <div class="box team" v-for="(team, i) in teams" :key="team?.id" :class="{'active': current === `team-${i+1}`}">
                <div class="team-code w-100" :style="themeBackground1(team)">{{ team?.code }}</div>
            </div>
            <div class="box draw" :class="{'active': current === 'draw'}">
                <div class="draw-text">DRAW</div>
            </div>
        </div>
    </SoloControlButton>
</template>

<script>
import SoloControlButton from "@/components/broadcast/SoloControlButton";
import { resizedImage } from "@/utils/images";
import { themeBackground1 } from "@/utils/theme-styles";

export default {
    name: "SoloMapToggleButton",
    methods: { themeBackground1 },
    components: { SoloControlButton },
    props: ["map", "click", "topText", "noclick", "current", "teams"],
    computed: {
        bg() {
            console.log("Map BG", this.map);
            if (!this.map?.image) return {};
            return resizedImage(this.map, ["image"], "h-200");
        },
        text() {
            return this.current;
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

    .selection-box {
        display: flex;
        background-color: rgba(0,0,0,0.8);
        flex-direction: column;
    }

    .selection-box, .box {
        border: 1px solid rgba(0,0,0,0.5);
    }

    .box {
        width: 100%;
        height: 26px;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 20px;
        opacity: 0.3;
    }
    .box.active {
        border-color: white;
        background-color: rgba(255,255,255,0.5);
        opacity: 1;
    }

    .selection-box {
        width: 160px;
    }

    .box.draw, .box.empty {
        font-size: 13px;
    }
</style>

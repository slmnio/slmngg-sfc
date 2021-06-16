<template>
    <div class="tourney-bar">
        <div class="bar-text bar-text-left">
            <transition name="fade" mode="out-in">
                <span :key="left" v-if="left && right">{{ left }}</span>
            </transition>
        </div>
        <div class="bar-logo flex-center">
<!--            <transition name="fade" mode="out-in">-->
                <div class="bar-logo-holder bg-center h-100 w-100" :key="logo" :style="logo"></div>
<!--            </transition>-->
        </div>
        <div class="bar-text bar-text-right">
            <transition name="fade" mode="out-in">
                <span :key="right" v-if="left && right">{{ right }}</span>
            </transition>
        </div>
    </div>
</template>

<script>
import { cssImage } from "@/utils/content-utils";

export default {
    name: "TourneyBar",
    props: ["left", "right", "theme", "event"],
    computed: {
        _theme() {
            if (this.theme) return this.theme;
            if (this.event && this.event.theme) return this.event.theme;
            return null;
        },
        logo() {
            if (!this._theme) return {};
            return cssImage("backgroundImage", this._theme, ["default_wordmark", "default_logo"], null, false);
        }
    }
};
</script>

<style scoped>
    .tourney-bar {
        border-radius: 20px;
        display: flex;
        background-image: linear-gradient(to right, #20FC8F, #2644F7);
        color: white;
        font-weight: bold;
        justify-content: center;
        align-items: center;
        font-size: 60px;
    }
    .bar-text {
        text-transform: uppercase;
        width: 50%;
        height: 100%;
        line-height: 1;
        text-align: center;
        transform: translate(0, -0.08em)
    }

    .bar-logo {width: 300px;height: 300px;margin: -100px 0;}

    .bar-logo-holder {}
</style>

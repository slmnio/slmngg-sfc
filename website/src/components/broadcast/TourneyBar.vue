<template>
    <div class="tourney-bar" :style="gradient" v-bind:class="{'small-bar': !(left && right) }">
        <div class="bar-text flex-center bar-text-left">
            <transition name="fade" mode="out-in">
                <span :key="left" v-if="left && right">{{ left }}</span>
            </transition>
        </div>
        <div class="bar-logo flex-center">
<!--            <transition name="fade" mode="out-in">-->
                <div class="bar-logo-holder bg-center h-100 w-100" :key="_theme && _theme.id" :style="logo"></div>
<!--            </transition>-->
        </div>
        <div class="bar-text flex-center bar-text-right">
            <transition name="fade" mode="out-in">
                <span :key="right" v-if="left && right">{{ right }}</span>
            </transition>
        </div>
    </div>
</template>

<script>
import { resizedImage } from "@/utils/images";

export default {
    name: "TourneyBar",
    props: ["left", "right", "theme", "event", "broadcast"],
    computed: {
        _theme() {
            if (this.theme) return this.theme;
            if (this.event && this.event.theme) return this.event.theme;
            if (this.broadcast && this.broadcast.event && this.broadcast.event.theme) return this.broadcast.event.theme;
            return null;
        },
        gradient() {
            if (!this._theme) return {};
            if (!this._theme.color_gradient) return { backgroundColor: this._theme.color_logo_background };
            return {
                backgroundColor: this._theme.color_logo_background,
                backgroundImage: `linear-gradient(to right, ${this._theme.color_logo_background}, ${this._theme.color_gradient})`
            };
        },
        logo() {
            if (!this._theme) return {};
            return resizedImage(this._theme, ["default_wordmark", "default_logo"], "h-500");
        }
    }
};
</script>

<style scoped>
    .tourney-bar {
        display: flex;
        color: white;
        font-weight: bold;
        justify-content: center;
        align-items: center;
        font-size: 60px;
        width: 100%;
    }

    .tourney-bar.small-bar {
        border-radius: 0;
    }
    .tourney-bar.small-bar .bar-logo {
        height: 220px;
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

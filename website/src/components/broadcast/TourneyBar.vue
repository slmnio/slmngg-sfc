<template>
    <div class="tourney-bar" :style="gradient" :class="{'small-bar': !(left && right) }">
        <div class="bar-text flex-center bar-text-start">
            <transition name="fade" mode="out-in">
                <span v-if="left && right" :key="left">{{ left }}</span>
            </transition>
        </div>
        <div class="bar-logo flex-center">
            <!--            <transition name="fade" mode="out-in">-->
            <div :key="_theme && _theme.id" class="bar-logo-holder bg-center h-100 w-100" :style="logo"></div>
            <!--            </transition>-->
        </div>
        <div class="bar-text flex-center bar-text-end">
            <transition name="fade" mode="out-in">
                <span v-if="left && right" :key="right">{{ right }}</span>
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
            if (this.event?.theme) return this.event.theme;
            if (this.broadcast?.event?.theme) return this.broadcast.event.theme;
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
        width: 75%;
        height: 200px;
    }
    .bar-text {
        text-transform: uppercase;
        width: 50%;
        height: 100%;
        line-height: 1;
        text-align: center;
        transform: var(--overlay-line-height-adjust, translate(0, -0.0925em));
    }

    .bar-logo {
        width: 300px;
        height: 300px;
        margin: -90px 0;
    }

    .bar-logo-holder {}
</style>

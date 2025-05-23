<template>
    <div class="stinger-wrap" :class="{'s-active': active, 's-show': showStinger, 'custom': !!customStingerTheme }" :style="themeVariables">
        <theme-transition
            class="stinger-transition"
            start="left"
            end="left"
            :active="active && shouldUse"
            :theme="useTheme"
            :start-inner-full="true"
            :trigger="true"
            :starting-inner-delay="150"
            :trigger-duration="800"
            :duration="300"
            :inner-delay="200">
            <div class="stinger flex-center" :style="bg" :class="{'stinging': active || showStinger, 'has-text': !!stingerText}">
                <theme-logo
                    class="w-100 h-100"
                    :theme="useTheme"
                    logo-size="h-1080"
                    border-width="0"
                    :icon-padding="!!stingerText ? '50px' : '200px'" />
                <div v-if="stingerText" class="text">{{ stingerText }}</div>
            </div>
        </theme-transition>
        <slot></slot>
        <div class="preload">
            <theme-logo
                v-if="useTheme"
                class="w-100 h-100"
                :theme="useTheme"
                logo-size="h-1080"
                border-width="0"
                icon-padding="200px" />
        </div>
    </div>
</template>

<script>
import ThemeLogo from "@/components/website/ThemeLogo";
import { logoBackground, themeBackground } from "@/utils/theme-styles";
import ThemeTransition from "@/components/broadcast/ThemeTransition";
import { useStatusStore } from "@/stores/statusStore";
import { mapState } from "pinia";

function wrapVariables(prefix, css) {
    const out = {};
    Object.entries(css || {}).forEach(([k, v]) => out[`--${prefix}-${k}`] = v);
    return out;
}

export default {
    name: "StingerWrap",
    components: { ThemeLogo, ThemeTransition },
    props: ["theme", "active", "waitBeforeAnimOut", "shouldUse", "text"],
    data: () => ({
        showStinger: null
    }),
    computed: {
        ...mapState(useStatusStore, ["customStingerTheme", "customStingerText", "stingerHideText"]),
        useTheme() {
            return this.customStingerTheme || this.theme;
        },
        bg() {
            return logoBackground(this.useTheme);
        },
        themeVariables() {
            return ({
                ...wrapVariables("stinger-logo", logoBackground(this.useTheme)),
                ...wrapVariables("stinger-theme", themeBackground(this.useTheme)),
            });
        },
        stingerText() {
            if (this.stingerHideText) return;
            return this.customStingerText || this.text;
        }
    },
    watch: {
        active(isActive) {
            if (!this.shouldUse) return null;

            this.showStinger = isActive;
            setTimeout(() => {
                this.showStinger = false;
            }, this.waitBeforeAnimOut || 500);
        }
    }
};
</script>

<style scoped>
    .stinger {
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        /*opacity: 0.5;*/
        /*clip-path: polygon(0% 0%, 100% 0, 100% 100%, 0% 100%);*/
        /*border-width: 0 20px;*/
        /*border-width: 20px 0;*/
        /*border-style: solid;*/
        border-bottom: 20px solid transparent;
        flex-direction: column;
    }
    .stinger-wrap {
        position: absolute;
        width: 100vw;
        height: 100vh;
    }
    .stinger-transition {
        position: absolute;
        /*opacity: 0.5;*/
        z-index: 1000;
    }


    .stinger.has-text {
        --text-height: 25vh;
        padding: 5vh 0;
    }

    .stinger .text {
        font-weight: bold;
        font-size: 12em;
        text-transform: uppercase;
        height: var(--text-height);
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        line-height: 1.1;
    }

    .stinger.has-text .icon-holder {
        height: calc(100% - var(--text-height)) !important;
    }


    /*.stinger-out-leave-active {*/
    /*    transition: all .3s ease;*/
    /*}*/
    /*.stinger-out-leave-to {*/
    /*    clip-path: polygon(0% 0%, 0% 0, 0% 100%, 0% 100%);*/
    /*}*/
    .stinger.stinging .icon-holder,
    .stinger.stinging .text {
        animation: zoom 1.5s forwards;
    }

    @keyframes zoom {
        0% { transform: scale(0.9); }
        100% { transform: scale(1); }
    }

    .preload {
        opacity: 0;
        max-width: 0;
        max-height: 0;
        overflow: hidden;
    }
</style>

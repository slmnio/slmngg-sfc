<template>
    <div class="stinger-wrap" :class="{'s-active': active, 's-show': showStinger}">
        <theme-transition class="stinger-transition" name="stinger-out" start="left" end="left" :active="active && shouldUse" :theme="theme" :start-inner-full="true" :trigger="true"
                          :starting-inner-delay="150" :trigger-duration="800" :duration="300" :inner-delay="200">
            <div class="stinger flex-center" :style="bg" :class="{'stinging': active || showStinger}">
                <theme-logo class="w-100 h-100" :theme="theme" logo-size="h-1080" border-width="0" icon-padding="200px" />
            </div>
        </theme-transition>
        <slot></slot>
        <div class="preload">
            <theme-logo v-if="theme" class="w-100 h-100" :theme="theme" logo-size="h-1080" border-width="0" icon-padding="200px" />
        </div>
    </div>
</template>

<script>
import ThemeLogo from "@/components/website/ThemeLogo";
import { logoBackground } from "@/utils/theme-styles";
import ThemeTransition from "@/components/broadcast/ThemeTransition";
export default {
    name: "StingerWrap",
    props: ["theme", "active", "waitBeforeAnimOut", "shouldUse"],
    components: { ThemeLogo, ThemeTransition },
    data: () => ({
        showStinger: null
    }),
    watch: {
        active(isActive) {
            if (!this.shouldUse) return null;

            this.showStinger = isActive;
            setTimeout(() => {
                this.showStinger = false;
            }, this.waitBeforeAnimOut || 500);
        }
    },
    computed: {
        bg() {
            return logoBackground(this.theme);
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

    /*.stinger-out-leave-active {*/
    /*    transition: all .3s ease;*/
    /*}*/
    /*.stinger-out-leave-to {*/
    /*    clip-path: polygon(0% 0%, 0% 0, 0% 100%, 0% 100%);*/
    /*}*/
    .stinger.stinging .icon-holder {
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

<template>
    <div class="stinger-wrap">
        <transition name="stinger-out" :duration="{enter: 0, leave: 500}">
            <div v-show="showStinger" class="stinger flex-center" :style="bg" :class="{'stinging': active || showStinger}">
                <theme-logo class="w-100 h-100" :theme="theme" logo-size="w-1080" border-width="0" icon-padding="200px" />
            </div>
        </transition>
        <slot></slot>
    </div>
</template>

<script>
import ThemeLogo from "@/components/website/ThemeLogo";
import { logoBackground } from "@/utils/theme-styles";
export default {
    name: "StingerWrap",
    props: ["theme", "active", "waitBeforeAnimOut", "shouldUse"],
    components: { ThemeLogo },
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
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
        /*opacity: 0.5;*/
        clip-path: polygon(0% 0%, 100% 0, 100% 100%, 0% 100%);
        /*border-width: 0 20px;*/
        /*border-width: 20px 0;*/
        /*border-style: solid;*/
        border-bottom: 20px solid transparent;
    }

    .stinger-out-leave-active {
        transition: all .3s ease;
    }
    .stinger-out-leave-to {
        clip-path: polygon(0% 0%, 0% 0, 0% 100%, 0% 100%);
    }
    .stinger.stinging .icon-holder {
        animation: zoom 1s forwards;
    }

    @keyframes zoom {
        0% { transform: scale(0.9); }
        100% { transform: scale(1); }
    }
</style>

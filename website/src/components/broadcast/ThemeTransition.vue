<template>
    <transition name="tt" :duration="1000">
        <div v-if="active" class="theme-transition">
            <div class="theme-transition-outer" :style="outerStyle">
                <div class="theme-transition-inner" :style="innerStyle">
                    <slot></slot>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import { logoBackground } from "@/utils/theme-styles";

export default {
    name: "ThemeTransition",
    props: ["theme", "active", "borderWidth"],
    computed: {
        innerStyle() {
            return {
                backgroundColor: "#444444",
                borderColor: "#444444",
                color: "#ffffff",
                ...logoBackground(this.theme),
                borderRightWidth: `${this.borderWidth || 6}px`
            };
        },
        outerStyle() {
            return {
                backgroundColor: this.theme?.color_alt || "#333333"
            };
        }
    }
};
</script>

<style scoped>
.theme-transition-inner {
    border-right: 6px solid transparent;
}

.tt-enter-active,
.tt-enter-active .theme-transition-inner,
.tt-enter-active .theme-transition-outer,
.tt-leave-active,
.tt-leave-active .theme-transition-inner,
.tt-leave-active .theme-transition-outer {
    transition: all .5s ease;
}

.tt-enter-to .theme-transition-outer,
.tt-enter-to .theme-transition-inner,
.tt-leave .theme-transition-outer,
.tt-leave .theme-transition-inner {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
}
.tt-enter .theme-transition-outer,
.tt-enter .theme-transition-inner,
.tt-leave-to .theme-transition-outer,
.tt-leave-to .theme-transition-inner {
    clip-path: polygon(0 0, 0 0, 0 100%, 0% 100%);
}

.tt-enter-active .theme-transition-inner { transition-delay: .2s; }
.tt-leave-active .theme-transition-outer { transition-delay: .2s; }


.break-content-enter { clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%); }
.break-content-leave-to { clip-path: polygon(0 0, 0 0, 0 100%, 0% 100%); }
.break-content-enter-to, .break-content-leave { clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%); }
</style>

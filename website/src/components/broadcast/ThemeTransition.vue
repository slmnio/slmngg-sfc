<template>
    <transition name="tt" mode="out-in" :duration="calculatedDuration">
        <div v-show="isActive" :key="_key || 'transition'" class="theme-transition" :style="animDurations" :class="{ ...directionClasses, ...borderClasses, 'start-inner-full': startInnerFull }">
            <div class="theme-transition-outer" :style="outerStyle">
                <div class="theme-transition-inner" :style="innerStyle" :class="innerClass">
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
    props: ["theme", "active", "borderWidth", "_key", "autoStart", "duration", "startingDelay", "innerDelay", "left", "oneColor", "start", "end", "border", "startInnerFull", "trigger", "triggerDuration", "startingInnerDelay", "innerClass"],
    data: () => ({
        manuallyActive: false
    }),
    computed: {
        calculatedDuration() {
            return (this.startingDelay || 0) + (this.duration || 750) + (this.innerDelay || 250);
        },
        isActive() {
            if (this.trigger) return this.manuallyActive;
            if (this.active) return this.active;
            return this.manuallyActive;
        },
        innerStyle() {
            return {
                backgroundColor: "#444444",
                borderColor: "#444444",
                color: "#ffffff",
                ...logoBackground(this.theme)
            };
        },
        outerStyle() {
            const otherColor = this.innerStyle.backgroundColor;

            if (this.oneColor) return { backgroundColor: otherColor };

            let altColor = "#333333";

            if (this.theme?.color_logo_accent && this.theme?.color_logo_accent !== otherColor) altColor = this.theme?.color_logo_accent;
            if (this.theme?.color_alt && this.theme?.color_alt !== otherColor) altColor = this.theme?.color_alt;
            if (this.theme?.color_accent && this.theme?.color_accent !== otherColor) altColor = this.theme?.color_accent;
            console.log("other", otherColor, altColor, this.theme);

            return {
                backgroundColor: altColor
            };
        },
        animDurations() {
            return {
                "--tt-starting-delay": `${this.startingDelay === undefined ? 0 : this.startingDelay}ms`,
                "--tt-duration": `${this.duration === undefined ? 750 : this.duration}ms`,
                "--tt-inner-delay": `${this.innerDelay === undefined ? 250 : this.innerDelay}ms`,
                "--tt-border-width": `${this.borderWidth === undefined ? 6 : this.borderWidth}px`,
                "--tt-starting-inner-delay": `${this.startingInnerDelay || 0}ms`
            };
        },
        directions() {
            console.log("directions", this.start, this.end, this.left);
            let start = this.start || "right";
            let end = this.end || "left";
            if (this.left && !this.start) start = "left";
            if (this.left && !this.end) end = "right";
            console.log({ start, end });

            return { start, end };
        },
        directionClasses() {
            const o = {};
            Object.entries(this.directions).map(([key, val]) => `${key}-${val}`).forEach(c => { o[c] = true; });
            return o;
        },
        borderClasses() {
            if (!this.border) return {};
            if (this.border === "left") return { "border-left": true };
            if (this.border === "right") return { "border-right": true };
            if (this.border === "top") return { "border-top": true };
            if (this.border === "bottom") return { "border-bottom": true };
            if (this.border === "x") return { "border-left": true, "border-right": true };
            if (this.border === "y") return { "border-top": true, "border-bottom": true };
            if (this.border === "all") return { "border-top": true, "border-bottom": true, "border-left": true, "border-right": true };
            return {};
        }
    },
    mounted() {
        if (this.autoStart) {
            requestAnimationFrame(() => {
                this.manuallyActive = true;
            });
        }
    },
    watch: {
        active(isActive) {
            if (!isActive) {
                this.manuallyActive = false;
            }
            if (this.trigger && isActive) {
                this.manuallyActive = true;
                setTimeout(() => {
                    this.manuallyActive = false;
                }, this.triggerDuration || 500);
            }
        }
    }
};
</script>

<style scoped>
.theme-transition, .theme-transition-outer, .theme-transition-inner {
    width: 100%;
    height: 100%;
}

.theme-transition.border-left .theme-transition-inner { border-left: var(--tt-border-width) solid transparent; }
.theme-transition.border-right .theme-transition-inner { border-right: var(--tt-border-width) solid transparent; }
.theme-transition.border-top .theme-transition-inner { border-top: var(--tt-border-width) solid transparent; }
.theme-transition.border-bottom .theme-transition-inner { border-bottom: var(--tt-border-width) solid transparent; }

.tt-enter-active,
.tt-enter-active .theme-transition-inner,
.tt-enter-active .theme-transition-outer,
.tt-leave-active,
.tt-leave-active .theme-transition-inner,
.tt-leave-active .theme-transition-outer {
    transition: all var(--tt-duration, .75s) ease;
    transition-delay: var(--tt-starting-delay);

}

.tt-enter-active.start-inner-full .theme-transition-outer {
    transition-duration: 0s;
}

.tt-enter-active.start-inner-full .theme-transition-inner {
    transition-delay: var(--tt-starting-inner-delay, 300ms) !important;
}

.tt-enter-to .theme-transition-outer,
.tt-enter-to .theme-transition-inner,
.tt-leave .theme-transition-outer,
.tt-leave .theme-transition-inner {
    /* full open */
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
}
.theme-transition.start-right.tt-enter .theme-transition-outer,
.theme-transition.start-right.tt-enter .theme-transition-inner,
.theme-transition.end-left.tt-leave-to .theme-transition-outer,
.theme-transition.end-left.tt-leave-to .theme-transition-inner {
    /* closed left */
    clip-path: polygon(0 0, 0 0, 0 100%, 0% 100%);
}

.theme-transition.start-left.tt-enter .theme-transition-outer,
.theme-transition.start-left.tt-enter .theme-transition-inner,
.theme-transition.end-right.tt-leave-to .theme-transition-outer,
.theme-transition.end-right.tt-leave-to .theme-transition-inner {
    /* closed right */
    clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%)
}

.theme-transition.end-middle.tt-enter-to .theme-transition-outer,
.theme-transition.end-middle.tt-enter-to .theme-transition-inner,
.theme-transition.start-middle.tt-leave .theme-transition-outer,
.theme-transition.start-middle.tt-leave .theme-transition-inner {
    /* middle open */
    clip-path: polygon(0% 0%, 0% 100%, 50% 100%, 50% 0, 50% 0, 50% 100%, 100% 100%, 100% 0%);
}

.theme-transition.end-middle.tt-enter .theme-transition-outer,
.theme-transition.end-middle.tt-enter .theme-transition-inner,
.theme-transition.start-middle.tt-leave-to .theme-transition-outer,
.theme-transition.start-middle.tt-leave-to .theme-transition-inner {
    /* middle closed */
    clip-path: polygon(50% 0, 50% 100%, 50% 100%, 50% 0%, 50% 0%, 50% 100%, 50% 100%, 50% 0);
}

/*.tt-enter .theme-transition-inner,*/
/*.tt-enter .theme-transition-outer {*/
/*    clip-path: polygon(0 0, -10% 0, 0 100%, 0% 100%);*/
/*}*/

.tt-enter-active .theme-transition-inner { transition-delay: calc(var(--tt-starting-delay) + var(--tt-inner-delay)); }
.tt-leave-active .theme-transition-outer { transition-delay: calc(var(--tt-starting-delay) + var(--tt-inner-delay)); }

</style>

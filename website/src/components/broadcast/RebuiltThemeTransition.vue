<template>
    <transition
        name="tt"
        :mode="transitionMode || 'out-in'"
        :duration="calculatedDuration"
        tag="div"
        @after-enter="() => entered = true"
        @before-leave="() => entered = false"
        @before-enter="() => entered = false">
        <div
            v-if="isActive"
            :key="transitionKey || 'transition'"
            ref="lower"
            :data-key="transitionKey ?? 'transition'"
            class="theme-transition"
            :style="animDurations"
            :class="{ ...directionClasses, ...borderClasses, 'start-inner-full': startInnerFull, 'active': isActive, 'entered': entered, 'clear-after-entered': clearStyleAfterEntered, 'use-fit-content': useFitContent, 'clip-slot': clipSlot }">
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
    name: "RebuiltThemeTransition",
    props: {
        theme: Object,
        active: Boolean,

        borderWidth: Number,
        transitionKey: String,
        transitionMode: String,

        duration: Number,
        startingDelay: Number,
        leavingDelay: Number,
        innerDelay: Number,
        startingInnerDelay: Number,
        clipDelay: Number,

        autoStart: Boolean,
        clearStyleAfterEntered: Boolean,
        useFitContent: Boolean,
        oneColor: Boolean,
        startInnerFull: Boolean,
        clipSlot: Boolean,

        start: String,
        end: String,
        left: Boolean,
        border: String,

        trigger: Boolean,
        triggerDuration: Number,
        innerClass: String
    },
    data: () => ({
        manuallyActive: false,
        entered: false
    }),
    computed: {
        calculatedDuration() {
            return (this.startingDelay || 0) + (this.duration || 750) + (this.innerDelay || 250) + (this.clipSlot ? (this.clipDelay || 250) : 0);
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
            // console.log("other", otherColor, altColor, this.theme);

            return {
                backgroundColor: altColor
            };
        },
        animDurations() {
            return {
                "--tt-starting-delay": `${this.startingDelay === undefined ? 0 : this.startingDelay}ms`,
                "--tt-leaving-delay": `${this.leavingDelay === undefined ? (this.startingDelay === undefined ? 0 : this.startingDelay) : this.leavingDelay}ms`,
                "--tt-clip-delay": `${this.clipDelay === undefined ? (this.startingDelay === undefined ? 0 : this.startingDelay) : this.clipDelay}ms`,
                "--tt-duration": `${this.duration === undefined ? 750 : this.duration}ms`,
                "--tt-inner-delay": `${this.innerDelay === undefined ? 250 : this.innerDelay}ms`,
                "--tt-border-width": `${this.borderWidth === undefined ? 6 : this.borderWidth}px`,
                "--tt-starting-inner-delay": `${this.startingInnerDelay || 0}ms`
            };
        },
        directions() {
            // console.log("directions", this.start, this.end, this.left);
            let start = this.start || "right";
            let end = this.end || "left";
            if (this.left && !this.start) start = "left";
            if (this.left && !this.end) end = "right";
            // console.log({ start, end });

            return { start, end };
        },
        directionClasses() {
            const o = {};
            Object.entries(this.directions).map(([key, val]) => `${key}-${val}`).forEach(c => { o[c] = true; });
            return o;
        },
        borderClasses() {
            if (!this.border) return {};
            if (this.border === "left") return { "tt-border-left": true };
            if (this.border === "right") return { "tt-border-right": true };
            if (this.border === "top") return { "tt-border-top": true };
            if (this.border === "bottom") return { "tt-border-bottom": true };
            if (this.border === "x") return { "tt-border-left": true, "tt-border-right": true };
            if (this.border === "y") return { "tt-border-top": true, "tt-border-bottom": true };
            if (this.border === "all") return { "tt-border-top": true, "tt-border-bottom": true, "tt-border-left": true, "tt-border-right": true };
            return {};
        }
    },
    watch: {
        active(isActive) {
            console.log("theme watching active", isActive);
            if (!isActive) {
                this.manuallyActive = false;
            }
            if (this.trigger && isActive) {
                this.manuallyActive = true;
                setTimeout(() => {
                    this.manuallyActive = false;
                }, this.triggerDuration || 500);
            }
        },
        isActive(a) {
            console.log("isActive ->", a);
        }
    },
    mounted() {
        if (this.autoStart) {
            requestAnimationFrame(() => {
                this.manuallyActive = true;
            });
        }
    }
};
</script>

<style scoped>
.theme-transition, .theme-transition-outer, .theme-transition-inner {
    width: 100%;
    height: 100%;
}
.theme-transition.use-fit-content,
.theme-transition.use-fit-content .theme-transition-outer,
.theme-transition.use-fit-content .theme-transition-inner {
    width: fit-content;
    height: fit-content;
}

.theme-transition.tt-border-left .theme-transition-inner { border-left: var(--tt-border-width) solid inherit; }
.theme-transition.tt-border-right .theme-transition-inner { border-right: var(--tt-border-width) solid inherit; }
.theme-transition.tt-border-top .theme-transition-inner { border-top: var(--tt-border-width) solid inherit; }
.theme-transition.tt-border-bottom .theme-transition-inner { border-bottom: var(--tt-border-width) solid inherit; }

.tt-enter-active,
.tt-enter-active .theme-transition-inner,
.tt-enter-active .theme-transition-outer {
    transition: clip-path var(--tt-duration, .75s) ease;
    transition-delay: var(--tt-starting-delay);

}
.tt-leave-active,
.tt-leave-active .theme-transition-inner,
.tt-leave-active .theme-transition-outer {
    transition: clip-path var(--tt-duration, .75s) ease;
    transition-delay: var(--tt-leaving-delay);

}

.tt-enter-active.clip-slot:deep(.clip-target),
.tt-leave-active.clip-slot:deep(.clip-target) {
    transition: clip-path var(--tt-duration, .75s) ease;
    transition-delay: var(--tt-clip-delay);
}


.tt-enter-active.start-inner-full .theme-transition-outer {
    transition-duration: 0s;
}

.tt-enter-active.start-inner-full .theme-transition-inner {
    transition-delay: var(--tt-starting-inner-delay, 300ms) !important;
}

.tt-enter-to.clip-slot:deep(.clip-target),
.tt-leave-from.clip-slot:deep(.clip-target),
.tt-enter-to .theme-transition-outer,
.tt-enter-to .theme-transition-inner,
.tt-leave-from .theme-transition-outer,
.tt-leave-from .theme-transition-inner {
    /* full open */
    clip-path: polygon(-1% -1%, 101% -1%, 101% 101%, -1% 101%);
}

.theme-transition.start-right.tt-enter-from.clip-slot:deep(.clip-target),
.theme-transition.start-right.tt-leave-to.clip-slot:deep(.clip-target),
.theme-transition.start-right.tt-enter-from .theme-transition-inner,
.theme-transition.start-right.tt-enter-from .theme-transition-outer,
.theme-transition.end-left.tt-leave-to .theme-transition-outer,
.theme-transition.end-left.tt-leave-to .theme-transition-inner {
    /* closed left */
    clip-path: polygon(0 0, 0 0, 0 100%, 0% 100%);
}
.theme-transition.start-top.tt-enter-from.clip-slot:deep(.clip-target),
.theme-transition.start-top.tt-leave-to.clip-slot:deep(.clip-target),
.theme-transition.start-top.tt-enter-from .theme-transition-inner,
.theme-transition.start-top.tt-enter-from .theme-transition-outer,
.theme-transition.end-bottom.tt-leave-to .theme-transition-outer,
.theme-transition.end-bottom.tt-leave-to .theme-transition-inner {
    /* closed top */
    clip-path: polygon(0 0, 100% 0, 100% 0, 0 0);
}


.theme-transition.start-bottom.tt-enter-from.clip-slot:deep(.clip-target),
.theme-transition.start-bottom.tt-leave-to.clip-slot:deep(.clip-target),
.theme-transition.start-bottom.tt-enter-from .theme-transition-inner,
.theme-transition.start-bottom.tt-enter-from .theme-transition-outer,
.theme-transition.end-top.tt-leave-to .theme-transition-outer,
.theme-transition.end-top.tt-leave-to .theme-transition-inner {
    /* closed bottom */
    clip-path: polygon(0 100%, 100% 100%, 100% 100%, 0 100%);
}


.theme-transition.start-left.tt-enter-from.clip-slot:deep(.clip-target),
.theme-transition.start-left.tt-leave-to.clip-slot:deep(.clip-target),
.theme-transition.start-left.tt-enter-from .theme-transition-outer,
.theme-transition.start-left.tt-enter-from .theme-transition-inner,
.theme-transition.end-right.tt-leave-to .theme-transition-outer,
.theme-transition.end-right.tt-leave-to .theme-transition-inner {
    /* closed right */
    clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%)
}

.theme-transition.end-middle.tt-enter-to.clip-slot:deep(.clip-target),
.theme-transition.end-middle.tt-leave-from.clip-slot:deep(.clip-target),
.theme-transition.end-middle.tt-enter-to .theme-transition-outer,
.theme-transition.end-middle.tt-enter-to .theme-transition-inner,
.theme-transition.start-middle.tt-leave-from .theme-transition-outer,
.theme-transition.start-middle.tt-leave-from .theme-transition-inner {
    /* middle open */
    clip-path: polygon(0% 0%, 0% 100%, 50% 100%, 50% 0, 50% 0, 50% 100%, 100% 100%, 100% 0%);
}

.theme-transition.end-middle.tt-enter-from.clip-slot:deep(.clip-target),
.theme-transition.end-middle.tt-leave-to.clip-slot:deep(.clip-target),
.theme-transition.end-middle.tt-enter-from .theme-transition-outer,
.theme-transition.end-middle.tt-enter-from .theme-transition-inner,
.theme-transition.start-middle.tt-leave-to .theme-transition-outer,
.theme-transition.start-middle.tt-leave-to .theme-transition-inner {
    /* middle closed */
    clip-path: polygon(50% 0, 50% 100%, 50% 100%, 50% 0%, 50% 0%, 50% 100%, 50% 100%, 50% 0);
}

/*.tt-enter-from .theme-transition-inner,*/
/*.tt-enter-from .theme-transition-outer {*/
/*    clip-path: polygon(0 0, -10% 0, 0 100%, 0% 100%);*/
/*}*/

.tt-enter-active .theme-transition-inner { transition-delay: calc(var(--tt-starting-delay) + var(--tt-inner-delay)); }
.tt-leave-active .theme-transition-outer { transition-delay: calc(var(--tt-leaving-delay) + var(--tt-inner-delay)); }


.theme-transition.clear-after-entered.entered:not(.tt-enter-active) .theme-transition-outer,
.theme-transition.clear-after-entered.entered:not(.tt-enter-active) .theme-transition-inner {
    transition: background-color .5s ease .5s, border-color .5s ease .5s, color .5s ease .5s;
}
.theme-transition.clear-after-entered.entered .theme-transition-outer,
.theme-transition.clear-after-entered.entered .theme-transition-inner {
    background-color: transparent !important;
    border-color: transparent !important;
    color: transparent !important;
}
</style>

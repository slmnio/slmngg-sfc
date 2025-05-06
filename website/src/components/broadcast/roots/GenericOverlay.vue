<template>
    <div class="generic-overlay flex-center flex-column" :class="{'full': full}">
        <TourneyBar
            v-if="top === 'st4'"
            class="st4-top"
            :broadcast="broadcast"
            left="Schedule"
            :right="title" />
        <div v-if="!hideTitle" class="g-title-wrapper">
            <theme-transition
                :theme="theme"
                :active="$root.animationActive"
                one-color
                end="middle"
                :duration="500"
                :inner-delay="150">
                <div class="generic-overlay-title g-title overlay--bg flex-center flex-column" :style="{borderColor: _accentColor, ...(titleStyle || {})}">
                    <slot name="title"></slot>
                    <Squeezable v-if="!$slots.title" align="middle" :disabled="(title || '').includes('\\n')" class="w-100 flex-center industry-align">
                        <transition name="fade" mode="out-in">
                            <div
                                :key="title"
                                class="title-text"
                                :class="{'has-br': title?.includes('\\n') }"
                                v-html="nbr(title)"></div>
                        </transition>
                    </Squeezable>
                    <Squeezable v-if="!$slots.title" align="middle" :disabled="(subtitle || '').includes('\\n')" class="w-100 flex-center industry-align">
                        <transition name="fade" mode="out-in">
                            <div
                                :key="subtitle"
                                class="subtitle-text"
                                :class="{'has-br': subtitle?.includes('\\n') }"
                                v-html="nbr(subtitle)"></div>
                        </transition>
                    </Squeezable>
                </div>
            </theme-transition>
        </div>
        <div class="g-body-wrapper">
            <div v-if="noBottomAnimate" class="generic-overlay-body g-body overlay--bg flex-center" :style="bodyStyle">
                <slot></slot>
            </div>
            <theme-transition
                v-else
                :active="$root.animationActive"
                one-color
                :theme="theme"
                :starting-delay="100"
                :clear-style-after-entered="clearBottomStyle"
                end="middle"
                :duration="500"
                :inner-delay="150">
                <div class="generic-overlay-body g-body overlay--bg flex-center" :style="bodyStyle">
                    <slot></slot>
                </div>
            </theme-transition>
        </div>
    </div>
</template>

<script>
import TourneyBar from "@/components/broadcast/TourneyBar";
import ThemeTransition from "@/components/broadcast/ThemeTransition";
import Squeezable from "@/components/broadcast/Squeezable.vue";
export default {
    name: "GenericOverlay",
    components: { Squeezable, ThemeTransition, TourneyBar },
    props: ["title", "subtitle", "accentColor", "bodyColor", "top", "broadcast", "noBottom", "noBottomAnimate", "clearBottomStyle", "titleStyle", "customTheme", "full", "hideTitle"],
    computed: {
        theme() {
            return this.customTheme || this.$root?.broadcast?.event?.theme;
        },
        _accentColor() {
            return this.accentColor || this.$root?.broadcast?.event?.theme?.color_theme;
        },
        bodyStyle() {
            const css = {
                backgroundColor: this.bodyColor,
                borderColor: this._accentColor
            };
            if (this.noBottom) {
                css.borderColor = "transparent";
                css.borderBottomWidth = "0";
                css.padding = "0";
            }
            return css;
        }
    },
    methods: {
        nbr(text) {
            if (!text) return "";
            return text.replace(/\\n/g, "<br>");
        }
    }
};
</script>

<style scoped>

.generic-overlay {
    position: absolute;
    overflow: hidden;
    background: transparent;
    background-color: transparent;

    height: 100%;
    width: 100%;
    color: white;
    font-family: "SLMN-Industry", "Industry", sans-serif;

    padding: 60px 320px;
}

.generic-overlay.full {
    padding: 60px 120px;
}

.schedule-overlay .generic-overlay-body {
    padding: 0;
}

.generic-overlay-title, .generic-overlay-body {
    background-color: #222;
    border-bottom: 8px solid transparent;
}
.generic-overlay-title {
    background-color: #222;
    font-size: 96px;
    font-weight: bold;
    text-transform: uppercase;
    flex-shrink: 0;
    line-height: 1;
    text-align: center;
    height: 100%;
    padding: 0 .4em;
}
.g-title-wrapper {
    width: 100%;
    height: 160px;
    flex-shrink: 0;
}
.generic-overlay-body {
    flex-grow: 1;
    width: 100%;
    padding: 40px;
    height: 100%;
}
.g-body-wrapper {
    margin-top: 60px;
    width: 100%;
    flex-grow: 1;
    overflow: hidden;
}

span.industry-align {
    transform: var(--overlay-line-height-adjust, translate(0, -0.0925em));
}
.st4-top {
    margin: 20px 0;
}
.generic-overlay-title .has-br {
    font-size: 0.72em;
}

.broadcast-mid-split-enter-active {
    overflow: hidden;
    max-width: 100%;
    transition: all 800ms ease;
}
.broadcast-mid-split-leave-active {
    overflow: hidden;
    max-width: 100%;
    transition: opacity 0s;
}
.broadcast-mid-split-enter-from {
    /*clip-path: polygon(0 0, 0 0, 0 100%, 0% 100%);*/
    /*clip-path: polygon(0% 0%, 0% 100%, 0% 100%, 0% 0, 100% 0, 100% 100%, 100% 100%, 100% 0%);*/
    clip-path: polygon(50% 0, 50% 100%, 50% 100%, 50% 0%, 50% 0%, 50% 100%, 50% 100%, 50% 0);
}
.broadcast-mid-split-enter-to {
    /*clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);*/
    /*clip-path: polygon(0% 0%, 0% 100%, 50% 100%, 50% 0, 50% 0, 50% 100%, 100% 100%, 100% 0%); */
    clip-path: polygon(0% 0, 0% 100%, 50% 100%, 50% 0%, 50% 0%, 50% 100%, 100% 100%, 100% 0);
}

.broadcast-mid-split-leave-to {
    opacity: 0;
}
.generic-overlay-body.broadcast-mid-split-enter-active {
    transition-delay: 200ms !important;
}

.subtitle-text, .g-title:deep(.subtitle-text) {
    font-size: 0.3em;
    margin-top: 0.1em;
    font-weight: 400;
}
</style>

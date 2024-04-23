<template>
    <div class="hero-color-controls">
        <div class="color" v-for="(color, i) in themeColors" :key="color">
            <div class="color-name"><span class="color-swatch" :style="{ backgroundColor: color }"></span> {{ color }} (b={{ getHexBrightness(color).toFixed(2) }})</div>

            <b-form-group class="mb-0" :label="`${type} ${colorControls[i][type]}`" label-class="font-weight-bold text-right" label-cols="3" v-for="type in ['hue', 'overlay', 'multiply', 'saturation']" :key="type">
                <b-form-input class="d-flex h-100" type="range" v-model="colorControls[i][type]" min="0" max="1" step="0.01"></b-form-input>
            </b-form-group>
        </div>

        {{ $root.colorControls }}
    </div>
</template>

<script>
import { logoBackground } from "@/utils/theme-styles";

function deHex(hexString) {
    if (!hexString) return null;
    hexString = hexString.replace("#", "");
    const [r, g, b] = [hexString.slice(0, 2), hexString.slice(2, 4), hexString.slice(4, 6)].map(str => parseInt(str, 16));
    return [r, g, b];
}
function getHexBrightness(hexString) {
    if (!hexString) return 0;
    const [r, g, b] = deHex(hexString);
    return ((0.299 * r) + (0.587 * g) + (0.114 * b)) / 255;
}
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
function getOpacityAdjustment(color, inversionMode = "normal", multiplier, boost, minOpacity, maxOpacity) {
    // more bright = more opacity
    // if inverted, more bright = less opacity
    const brightness = getHexBrightness(color);
    let value = brightness * multiplier;
    console.log(color, value);
    value += boost;
    console.log(color, value);
    if (inversionMode === "inverted" || inversionMode === true) {
        value = Math.abs(value - 1);
        console.log(color, value);
    } else if (inversionMode === "updown") {
        value = (Math.abs(value - 0.5)) * 2;
    }
    console.log({ color, inversionMode, multiplier, boost, minOpacity, maxOpacity, brightness, value });
    return clamp(value, minOpacity, maxOpacity);
}

export default {
    name: "HeroColorControls",
    props: ["theme"],
    data: () => ({
        colorControls: [
            {
                hue: 1,
                overlay: 0.8,
                multiply: 0.5,
                saturation: 1
            },
            {
                hue: 1,
                overlay: 0.8,
                multiply: 0.5,
                saturation: 1
            }
        ]
    }),
    computed: {
        themeColors() {
            const style = logoBackground(this.theme);
            return [
                style.backgroundColor,
                style.borderColor || style.color
            ];
        }
    },
    watch: {
        colorControls: {
            deep: true,
            handler(controls) {
                this.updateToRoot(controls);
            }
        },
        themeColors: {
            deep: true,
            handler(oldColors, newColors) {
                newColors.forEach((color, i) => {
                    this.colorControls[i].hue = 1;
                    this.colorControls[i].overlay = getOpacityAdjustment(color, "updown", 1, 0.1, 0, 0.8);
                    this.colorControls[i].multiply = getOpacityAdjustment(color, "updown", 1, -0.5, 0, 0.5);
                    this.colorControls[i].saturation = 1;
                });
                this.updateToRoot(this.colorControls);
            }
        }
    },
    methods: {
        updateToRoot(controls) {
            controls.forEach((control, i) => {
                if (!this.themeColors?.[i]) return;
                this.$root.colorControls[this.themeColors[i]] = control;
            });
        },
        getHexBrightness
    },
    mounted() {
        this.updateToRoot(this.colorControls);
    }
};

</script>

<style scoped>
    .hero-color-controls {
        width: 500px;
    }
    .color-swatch {
        width: 1em;
        height: 1em;
        display: inline-block;
        border-radius: 50%;
        margin-right: .5em;
        margin-top: 2px;
    }
    .color-name {
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>

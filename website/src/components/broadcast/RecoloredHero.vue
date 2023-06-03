<template>
    <div class="recolored-hero">
        <div class="color-holder">
            <div class="hero-image-base" :style="mainImage || fallbackImage" :class="{ 'fallback-image': !mainImage && fallbackImage }"></div>

            <div :class="`color color-${i+1}`" v-for="(layer, i) in layers" :key="layer.id">
                <canvas :class="`adjustment-layer hue-layer target-color-${i+1}`" :ref="`hue-color-${i+1}`"></canvas>
                <canvas :class="`adjustment-layer overlay-layer target-color-${i+1}`" :ref="`overlay-color-${i+1}`"></canvas>
                <canvas :style="{ opacity: getOpacityAdjustment(themeColors[i], false, 1, -0.5, 0, 0.5) }" :class="`adjustment-layer multiply-layer target-color-${i+1}`" :ref="`multiply-color-${i+1}`"></canvas>
                <canvas :class="`adjustment-layer saturation-layer target-color-${i+1}`" :ref="`saturation-color-${i+1}`"></canvas>
            </div>

        </div>
    </div>
</template>

<script>
import { Image } from "image-js";
import { heroRecolorColors } from "@/utils/theme-styles";
import { bg, resizedAttachment } from "@/utils/images";

function deHex(hexString) {
    if (!hexString) return null;
    hexString = hexString.replace("#", "");
    const [r, g, b] = [hexString.slice(0, 2), hexString.slice(2, 4), hexString.slice(4, 6)].map(str => parseInt(str, 16));
    return [r, g, b];
}

async function recolorImage(imageURL, toColor, fromColor) {
    const [from, to] = [fromColor, toColor].map(deHex);
    const image = await Image.load(imageURL);
    // console.log("image width", image.bitmap.width);
    const frame = image.data;

    const outputFrame = new Uint8Array(frame);// (new Uint8Array(frame)).slice(0, image.bitmap.width * image.bitmap.height * 4);

    if (from) {
        // basically a filter, only replace if fromColor = [r,g,b]
    } else {
        for (let i = 0; i < frame.length; i += 4) {
            outputFrame[i] = to[0];
            outputFrame[i + 1] = to[1];
            outputFrame[i + 2] = to[2];
            // outputFrame[i + 3] = frame[i + 3]; // alpha
            outputFrame[i + 3] = frame[i + 3];
        }
    }

    // console.log("output should be", (image.bitmap.width * image.bitmap.height * 4));
    // console.log("output is", frame.length, outputFrame.length);
    return {
        pixels: {
            ...image,
            data: outputFrame
        },
        width: image.width
    };
}

function getHexBrightness(hexString) {
    const [r, g, b] = deHex(hexString);
    return ((0.299 * r) + (0.587 * g) + (0.114 * b)) / 255;
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

function getOpacityAdjustment(color, inverted, multiplier, boost, minOpacity, maxOpacity) {
    // more bright = more opacity
    // if inverted, more bright = less opacity
    const brightness = getHexBrightness(color);
    let value = brightness * multiplier;
    // console.log(color, value);
    value += boost;
    // console.log(color, value);
    if (inverted) {
        value = Math.abs(value - 1);
        // console.log(color, value);
    }
    // console.log({ color, inverted, multiplier, boost, minOpacity, maxOpacity, brightness, value });
    return clamp(value, minOpacity, maxOpacity);
}


export default {
    name: "RecoloredHero",
    props: ["hero", "theme"],
    data: () => ({
        colorData: [
            {
                hue: 1,
                overlay: 1,
                multiply: 1,
                saturation: 1
            },
            {
                hueOpacity: 1,
                overlayOpacity: 1,
                multiplyOpacity: 1,
                saturationOpacity: 1
            }
        ],
        lastRecolor: {
            colors: [],
            images: []
        }
    }),
    computed: {
        mainImage() {
            const img = this.hero?.recolor_base?.[0];
            if (!img) return null;
            return bg(resizedAttachment(img, "orig"));
        },
        fallbackImage() {
            const img = this.hero?.main_image?.[0];
            if (!img) return null;
            return bg(resizedAttachment(img, "orig"));
        },
        layers() {
            if (!this?.hero?.recolor_layers) return [];
            return this.hero.recolor_layers.map(layer => resizedAttachment(layer, "orig"));
        },
        themeColors() {
            const style = heroRecolorColors(this.theme);
            return [
                style.primary,
                style.secondary
            ];
        }
    },
    mounted() {
        this.colorImageTheme();
    },
    watch: {
        themeColors: {
            deep: true,
            handler() {
                this.colorImageTheme();
            }
        },
        hero: {
            deep: true,
            handler() {
                this.colorImageTheme();
            }
        }
    },
    methods: {
        getOpacityAdjustment,
        async recolor(imageURL, color, number) {
            // console.log("recolor", { imageURL, color, number });
            if (!imageURL || !color) return;
            const { pixels, width } = await recolorImage(imageURL, color);

            this.$emit("recolor_width", width);

            let hue = (this.$refs[`hue-color-${number}`]);
            if (!hue.id && hue?.[0]) hue = hue?.[0];
            if (!hue) return;

            const layers = [
                {
                    id: "overlay",
                    processing(overlay) {
                        // overlay.style.opacity = getOpacityAdjustment(color, true, 0.8, 0.1, 0, 1);
                    }
                },
                {
                    id: "multiply",
                    processing(multiply) {
                        multiply.style.opacity = getOpacityAdjustment(color, false, 1, -0.5, 0, 0.5);
                    }
                },
                {
                    id: "hue"
                },
                {
                    id: "saturation",
                    processing(multiply) {
                        // multiply.style.opacity = getOpacityAdjustment(color, false, 2, -0.5, 0.5, 1);
                    }
                }
            ];

            const imageData = new ImageData(new Uint8ClampedArray(pixels.data), pixels.width, pixels.height);
            // console.log(imageData);


            for (const layer of layers) {
                let element = this.$refs[`${layer.id}-color-${number}`];
                if (!element.id && element?.[0]) element = element?.[0];
                if (!element) return console.warn("No canvas element", layer.id, number);
                const context = element.getContext("2d");
                element.width = pixels.width;
                element.height = pixels.height;
                context.putImageData(imageData, 0, 0);
                if (layer.processing) {
                    layer.processing(element);
                }
            }
        },
        async colorImageTheme() {
            const colors = this.themeColors;

            const payload = {
                colors: colors,
                images: [this.mainImage?.backgroundImage, ...this.layers]
            };
            // muffling stops some colours mix down properly on changes, not sure why
            if (JSON.stringify(payload) === JSON.stringify(this.lastRecolor)) return console.warn("[muffle]", "Same payload requested", payload, this.lastRecolor);
            this.lastRecolor = payload;

            console.log("[recolor]", "starting");
            this.$emit("recolor_starting");
            for (let i = 0; i < this.layers.length; i++) {
                const layer = this.layers[i];
                await this.recolor(layer, colors[i], i + 1);
            }
            console.log("[recolor]", "complete");
            this.$emit("recolor_complete");
        }
    }
};
</script>

<style scoped>
    .color-holder {
        position: relative;
        /*background: white;*/
    }

    .color-holder div,
    .color-holder canvas {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        object-fit: contain;
    }

    .alter-overlay {
        background: red;
        mix-blend-mode: hue;
    }

    /*.hero-image-base { background-image: url(https://cdn.discordapp.com/attachments/782502500765794376/1012474572932657262/3.png) }*/
    .hero-image-base {
        background-size: contain !important;
    }

    /*.color-2 { background-image: url() } !* #ec008c *!*/
    /*.color-1 { background-image: url() } !* #009a4d *!*/

    .multiply-layer { mix-blend-mode: multiply; }
    .hue-layer { mix-blend-mode: hue; }
    .overlay-layer { mix-blend-mode: overlay; opacity: 0.5; }
    .saturation-layer { mix-blend-mode: saturation; }

    .recolored-hero, .color-holder {
        height: 100%;
        width: 100%;
    }

</style>

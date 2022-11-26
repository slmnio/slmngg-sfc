<template>
    <div class="icon-holder flex-center" :style="bgStyle">
        <div class="icon bg-center" :style="logo"></div>
    </div>
</template>

<script>
import { resizedImage } from "@/utils/images";

function sizePadding(val, defaultVal) {
    if (!val) return defaultVal;
    if (["px", "em", "%"].some(test => val.includes(test))) {
        // use raw input
        return val;
    }
    return `${val}px`;
}

export default {
    name: "ThemeLogo",
    props: ["theme", "iconPadding", "borderWidth", "logoSize", "small"],
    computed: {
        image() {
            if (this.small || (this.logoSize && parseInt(this.logoSize) <= 100)) {
                // use smalls if possible
                return resizedImage(this.theme, ["small_logo", "default_logo"], this.logoSize);
            }
            return resizedImage(this.theme, ["default_logo"], this.logoSize);
        },
        logo () {
            if (!this.theme) return {};
            return {
                ...this.image,
                width: `calc(100% - ${sizePadding(this.iconPadding, "12px")})`,
                height: `calc(100% - ${sizePadding(this.iconPadding, "12px")})`
            };
        },
        bgStyle () {
            if (!this.theme) {
                return {
                    borderBottom: `${sizePadding(this.borderWidth, "10px")} solid rgba(255,255,255,0.2)`
                };
            }
            return {
                backgroundColor: this.theme.color_logo_background || this.theme.color_theme,
                borderBottom: `${sizePadding(this.borderWidth, "10px")} solid ${this.theme.color_logo_accent || this.theme.color_accent || "rgba(255,255,255,0.2)"}`,
                color: this.theme.color_text_on_logo_background || this.theme.color_text_on_theme
            };
        }
    }
};
</script>

<style scoped>
    .icon-holder {
        width: 200px;
        height: 160px;
        /*border-bottom: 10px solid transparent;*/
        flex-shrink: 0;

        /* default colouring */
        background-color: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
        color: rgba(255, 255, 255, 0.5);

        transition: background-color .2s, border-color .2s, color .2s;
    }
</style>

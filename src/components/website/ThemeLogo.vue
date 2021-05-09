<template>
    <div class="icon-holder flex-center" :style="bgStyle">
        <div class="icon bg-center" :style="logo"></div>
    </div>
</template>

<script>
import { image } from "@/utils/content-utils";

export default {
    name: "ThemeLogo",
    props: ["theme"],
    methods: {
    },
    computed: {
        logo () {
            if (!this.theme) return {};
            return { backgroundImage: image(this.theme, "default_logo") };
        },
        bgStyle () {
            if (!this.theme) return { };
            return {
                backgroundColor: this.theme.color_logo_background || this.theme.color_theme,
                borderColor: this.theme.color_logo_accent || this.theme.color_accent,
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
        border-bottom: 10px solid transparent;
        flex-shrink: 0;

        /* default colouring */
        background-color: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
        color: rgba(255, 255, 255, 0.5);

        transition: background-color .2s, border-color .2s, color .2s;
    }
    .icon {
        width: calc(100% - 12px);
        height: calc(100% - 12px);
    }
</style>

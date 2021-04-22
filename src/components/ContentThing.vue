<template>
    <router-link :to="url(type, linkTo || thing)" class="link content-thing" :style="bgStyle">
        <span
            class="icon-internal bg-center icon-internal-left"
            :style="logo"
            v-if="showLogo && logo && !logoRight && theme"></span>

        <span class="name">{{ text || thing.name }}</span>

        <i class="fas fa-badge-check fa-fw" title="REAL" v-if="thing.verified"></i>

        <i class="fas fa-spinner fa-pulse" v-if="thing.__loading"></i>

        <span
            class="icon-internal bg-center icon-internal-right"
            :style="logo"
            v-if="showLogo && logo && logoRight && theme"></span></router-link>
</template>

<script>
import { resizedImage, url } from "@/utils/content-utils";

export default {
    name: "ContentThing",
    props: ["theme", "thing", "showLogo", "type", "text", "logoRight", "linkTo"],
    methods: {
        url
    },
    computed: {
        logo () {
            if (!this.theme) return {};
            return { backgroundImage: `url(${resizedImage(this.theme, "default_logo", 30)})` };
        },
        bgStyle () {
            if (!this.theme) return {};
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
    .content-thing {
        padding: .25em .5em;
        margin: .25em .25em;
        border-bottom: .2em solid transparent;
        display: flex;
        justify-content: center;
        align-items: center;

        /* default colouring */
        background-color: rgba(255,255,255,0.1);
        border-color: rgba(255,255,255,0.2);
        color: rgba(255,255,255,0.5);

        transition: background-color .2s, border-color .2s, color .2s;
    }

    .icon-internal {
        height: 1.5em;
        width: 1.5em;
    }
    .icon-internal.icon-internal-left { margin-right: .3em }
    .icon-internal.icon-internal-right { margin-left: .3em }
</style>

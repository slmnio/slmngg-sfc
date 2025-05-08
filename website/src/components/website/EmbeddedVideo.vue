<template>
    <div class="embed ratio ratio-16x9" :class="{'embed--pdf': embed.service === 'pdf', 'embed--iframe': embed.service === 'unknown'}" v-html="renderEmbed"></div>
</template>

<script>
import { getEmbedData, renderEmbed } from "@/utils/content-utils";

export default {
    name: "EmbeddedVideo",
    props: ["src"],
    computed: {
        embed() {
            return getEmbedData(this.src);
        },
        renderEmbed() {
            return renderEmbed(this.embed) || `<div class="embed-fail">The VOD couldn't be embedded here. Head to the full link on the external website.<br><a href="${this.src}" target="_blank"></a></div>`;
        }
    }
};
</script>

<style scoped>
    .embed.embed--pdf, .embed.embed--iframe {
        min-height: max(720px, calc(100vh - 300px)) !important;
    }
    .embed.embed--pdf:before, .embed.embed--iframe:before {
        display: none;
    }
    .embed {
        background-color: #222;
    }
</style>

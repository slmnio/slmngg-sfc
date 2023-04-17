<template>
    <div class="embed embed-responsive embed-responsive-16by9" :class="{'embed--pdf': embed.service === 'pdf', 'embed--iframe': embed.service === 'unknown'}" v-html="renderEmbed"></div>
</template>

<script>
import { getEmbedData } from "@/utils/content-utils";

export default {
    name: "EmbeddedVideo",
    props: ["src"],
    computed: {
        embed() {
            return getEmbedData(this.src);
        },
        renderEmbed() {
            if (this.embed.service === "youtube") {
                return `<iframe src="https://youtube.com/embed/${this.embed.key}?autoplay=true${this.embed.timestamp ? `&start=${this.embed.timestamp}` : ""}" allowfullscreen="true"></iframe>`;
            }
            if (this.embed.service === "twitch") {
                return `<iframe src="https://player.twitch.tv/?video=${this.embed.key}&parent=${window.location.hostname}${this.embed.timestamp ? `&t=${this.embed.timestamp}` : ""}" allowfullscreen="true"></iframe>`;
            }
            if (this.embed.service === "twitch-live") {
                return `<iframe src="https://player.twitch.tv/?channel=${this.embed.key}&parent=${window.location.hostname}${this.embed.timestamp ? `&t=${this.embed.timestamp}` : ""}" allowfullscreen="true"></iframe>`;
            }
            if (this.embed.service === "unknown-video") {
                return `<video src="${this.embed.url}" autoplay controls></video>`;
            }
            if (this.embed.service === "pdf") {
                return `<iframe src="https://docs.google.com/gview?embedded=true&url=${this.embed.url}" class="embed-pdf"></iframe>`;
            }
            if (this.embed.service === "unknown") {
                return `<iframe src="${this.embed.url}" class="embed-iframe"></iframe>`;
            }
            return `<div class="embed-fail">The VOD couldn't be embedded here. Head to the full link on the external website.<br><a href="${this.src}" target="_blank"></a></div>`;
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

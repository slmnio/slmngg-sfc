<template>
    <iframe class="w-100 h-100 border-0" v-if="extended" :src="processedURL"></iframe>
    <GenericOverlay class="iframe-overlay" v-else-if="!extended" :title="title">
        <iframe class="w-100 h-100 border-0" :src="processedURL"></iframe>
    </GenericOverlay>
</template>

<script>
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay";
export default {
    name: "IframeOverlay",
    props: ["broadcast", "title", "url", "extended"],
    components: { GenericOverlay },
    computed: {
        processedURL() {
            const url = this.url;
            if (url?.includes("twitch.tv")) {
                if (url.split("/").length === 3) {
                    // VOD
                    console.log("vod", url);
                } else {
                    // LIVE
                    const channel = url.split("/").slice(-1)?.[0];
                    console.log("live", channel);
                    return `https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}`;
                }
            }
            return url;
        }
    },
    metaInfo() {
        return {
            title: `Iframe "${this.title}" | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

<style scoped>
    .iframe-overlay >>> .g-body {
        /*padding: 0;*/
    }
</style>

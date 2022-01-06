<template>
    <GenericOverlay class="iframe-overlay" :title="title">
        <iframe class="w-100 h-100 border-0" :src="url"></iframe>
    </GenericOverlay>
</template>

<script>
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay";
export default {
    name: "IframeOverlay",
    props: ["broadcast", "title", "url"],
    components: { GenericOverlay }
};
</script>

<style scoped>
    .iframe-overlay >>> .generic-overlay-body {
        padding: 0;
        height: 720px;
        width: 1280px;
        flex-grow: 0;
    }
</style>

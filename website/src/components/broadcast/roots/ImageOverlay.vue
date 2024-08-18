<template>
    <div v-if="extended" class="image image-overlay-raw w-100 h-100 position-absolute" :style="bg(imageURL)"></div>
    <GenericOverlay v-else-if="!extended" class="image-overlay" :title="title">
        <div class="image w-100 h-100" :style="bg(imageURL)"></div>
    </GenericOverlay>
</template>

<script>
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay";
import { bg, getNewURL } from "@/utils/images";
export default {
    name: "ImageOverlay",
    components: { GenericOverlay },
    props: ["broadcast", "title", "image", "url", "extended"],
    computed: {
        imageURL() {
            return this.image ? getNewURL(this.image, "w-1920") : this.url;
        }
    },
    methods: { bg },
    head() {
        return {
            title: `Image "${this.title}" | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

<style scoped>
    .image {
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
    }
</style>

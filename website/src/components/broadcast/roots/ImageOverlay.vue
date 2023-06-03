<template>
    <div class="image w-100 h-100 position-absolute" v-if="extended" :style="bg(imageURL)"></div>
    <GenericOverlay class="image-overlay" v-else-if="!extended" :title="title">
        <div class="image w-100 h-100" :style="bg(imageURL)"></div>
    </GenericOverlay>
</template>

<script>
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay";
import { bg, getNewURL } from "@/utils/images";
export default {
    name: "ImageOverlay",
    methods: { bg },
    props: ["broadcast", "title", "image", "url", "extended"],
    components: { GenericOverlay },
    computed: {
        imageURL() {
            return this.image ? getNewURL(this.image, "w-1920") : this.url;
        }
    },
    metaInfo() {
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

<template>
    <GenericOverlay class="text-overlay" :title="title">
        <Markdown class="overlay-markdown w-100 h-100" :markdown="markdown" />
    </GenericOverlay>
</template>

<script>
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay.vue";
import Markdown from "@/components/website/Markdown.vue";

export default {
    name: "TextOverlay",
    components: { Markdown, GenericOverlay },
    props: ["broadcast", "title", "markdown", "extended"]
};
</script>

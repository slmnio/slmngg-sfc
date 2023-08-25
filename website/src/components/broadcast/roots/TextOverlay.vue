<template>
    <GenericOverlay :title="title">
        <Markdown class="overlay-markdown w-100 h-100" :markdown="markdown"></Markdown>
    </GenericOverlay>
</template>

<script>
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay.vue";
import Markdown from "@/components/website/Markdown.vue";

export default {
    name: "TextOverlay",
    props: ["broadcast", "title", "markdown", "extended"],
    components: { Markdown, GenericOverlay }
};
</script>

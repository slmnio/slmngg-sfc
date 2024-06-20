<template>
    <div v-if="event" class="container">
        <Markdown class="about" :markdown="event.about" />
    </div>
</template>

<script>
import Markdown from "@/components/website/Markdown.vue";
export default {
    name: "EventAbout",
    components: { Markdown },
    props: ["event"]
};
</script>

<style scoped>
    .container .markdown {
        margin: 16px 0;
        padding: 16px;
        background-color: #252525;
        box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.5);
    }
</style>

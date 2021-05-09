<template>
    <router-link :to="url('news', news)" class="news no-link-style">
        <NewsThumbnail :item="news"/>
        <div class="news-headline">{{ news.headline }}</div>
    </router-link>
</template>

<script>
import NewsThumbnail from "@/components/website/NewsThumbnail";
import { url } from "@/utils/content-utils";
export default {
    name: "News",
    props: ["item"],
    components: { NewsThumbnail },
    computed: {
        news() {
            if (!this.item) return {};
            return this.item;
        }
    },
    methods: {
        url
    }
};
</script>

<style scoped>
    .news-headline {
        text-align: center;
        line-height: 1;
        padding: 4px 0;
    }
</style>

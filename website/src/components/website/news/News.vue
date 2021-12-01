<template>
    <router-link :to="`/news/${news.slug}`" class="news no-link-style">
        <NewsThumbnail :item="news"/>
        <div class="news-headline">{{ news.headline }}</div>
    </router-link>
</template>

<script>
import NewsThumbnail from "@/components/website/news/NewsThumbnail";
import { url } from "@/utils/content-utils";
import { ReactiveRoot, ReactiveThing } from "@/utils/reactive";
export default {
    name: "News",
    props: ["item"],
    components: { NewsThumbnail },
    computed: {
        news() {
            if (!this.item) return {};
            return {
                ...this.item,
                event: this.event
            };
        },
        event() {
            if (!this.item?.event) return {};
            return ReactiveRoot(this.item?.event?.id || this.item?.event[0], {
                theme: ReactiveThing("theme")
            });
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

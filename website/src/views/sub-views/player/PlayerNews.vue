<template>
    <div class="div">
        <div class="container">
            <div class="row">
                <News v-for="item in news" :key="item.id" class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3" :item="item" />
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import News from "@/components/website/news/News.vue";

export default {
    name: "PlayerNews",
    components: {
        News
    },
    props: ["player"],
    computed: {
        news() {
            if (!this.player?.news) return [];
            return ReactiveArray("news", {
                event: ReactiveThing("event", {
                    theme: ReactiveThing("theme")
                }),
                team: ReactiveThing("team", {
                    theme: ReactiveThing("theme")
                })
            })(this.player)
                .filter(news => news.enabled && (!news.hide_from_global_listing || !news.hide_from_local_listing));
        }
    }
};
</script>

<style scoped>

</style>

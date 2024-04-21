<template>
    <div class="div">
        <div class="container">
            <div class="row">
                <News class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3" v-for="item in news" :item="item" :key="item.id" />
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import News from "@/components/website/news/News.vue";

export default {
    name: "PlayerNews",
    props: ["player"],
    components: {
        News
    },
    computed: {
        news() {
            if (!this.player || !this.player.news) return [];
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

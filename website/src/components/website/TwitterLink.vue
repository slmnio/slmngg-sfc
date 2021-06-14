<template>
    <a v-if="twitter" :href="twitter.url" target="_blank">@{{ twitterHandle }}</a>
    <span v-else>-</span>
</template>

<script>
import { ReactiveArray, ReactiveRoot } from "@/utils/reactive";

export default {
    name: "TwitterLink",
    props: ["thing"],
    computed: {
        _thing() {
            return ReactiveRoot(this.thing.id, {
                socials: ReactiveArray("socials")
            });
        },
        twitter() {
            if (!this._thing?.socials?.length) return null;
            return this._thing.socials.find(social => social.type === "Twitter");
        },
        twitterHandle() {
            if (!this.twitter) return;
            if (this.twitter.url.lastIndexOf("/") === -1) return;
            return this.twitter.url.slice(this.twitter.url.lastIndexOf("/") + 1);
        }
    }
};
</script>

<style scoped>

</style>

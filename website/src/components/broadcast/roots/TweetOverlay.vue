<template>
    <div class="h-100 flex flex-center">
        <Tweet :id="identifier"/>
    </div>
</template>

<script>
import { Tweet } from "vue-tweet-embed";

export default {
    name: "TweetOverlay",
    props: ["broadcast", "identifier"],
    components: { Tweet },
    metaInfo() {
        return {
            title: `Tweet "${this.identifier}" | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    },
    mounted() {
        // wait for an item with id twitter-widget-0
        const interval = setInterval(() => {
            const tweet = document.getElementById("twitter-widget-0");
            if (tweet && tweet.style.height !== "0px") {
                // increase height by 10px
                tweet.style.height = tweet.style.height.replace("px", "") * 1 + 10 + "px";
                // stop the interval
                clearInterval(interval);
            }
        }, 100);
    }
};
</script>


<style>
#twitter-widget-0 {
    min-width: 550px;
    transform: scale(2);
}
</style>

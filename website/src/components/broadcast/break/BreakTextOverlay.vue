<template>
    <div class="break-text-overlay flex-center text-center">
        <div class="event-logo bg-center" :style="eventLogo"></div>
        <div class="break-text" v-html="nbr(title)"></div>
    </div>
</template>

<script>
import { resizedImage } from "@/utils/images";

export default {
    name: "BreakTextOverlay",
    props: ["broadcast", "title"],
    computed: {
        eventLogo() {
            return resizedImage(this.broadcast?.event?.theme, ["allmode_logo", "default_wordmark", "default_logo"], "w-1920");
        }
    },
    methods: {
        nbr(text) {
            if (!text) return "";
            return text.replace(/\\n/g, "<br>");
        }
    }
};
</script>

<style scoped>
    .break-text-overlay {
        flex-direction: column;
        height: 100vh;
    }
    .event-logo {
        width: 65vw;
        height: 50vh;
    }
    .break-text {
        margin-top: 2vh;
        font-size: 8em;
        font-weight: bold;
        text-transform: uppercase;
        line-height: 1;
    }
</style>

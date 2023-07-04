<template>
    <div class="break-text-overlay flex-center">
        <div class="event-logo bg-center" :style="eventLogo"></div>
        <div class="break-text">{{ title }}</div>
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
    }
</style>

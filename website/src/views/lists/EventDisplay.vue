<template>
    <router-link :to="url('event', event)" class="event no-link-style d-flex">
        <div class="event-block flex-center" :style="blockTheme">
            <div class="event-block-logo bg-center" :style="blockLogo"></div>
        </div>
        <div class="event-name">
            {{ event.name }}
        </div>
    </router-link>
</template>

<script>
import { resizedImage, url } from "@/utils/content-utils";

export default {
    name: "EventDisplay",
    props: ["event"],
    methods: { url },
    computed: {
        blockTheme() {
            if (!this.event || !this.event.theme) return {};
            return {
                backgroundColor: this.event.theme.color_logo_background,
                borderColor: this.event.theme.color_logo_accent
            };
        },
        blockLogo() {
            if (!this.event || !this.event.theme) return {};
            return {
                backgroundImage: `url(${resizedImage(this.event.theme, "default_logo", 50)})`
            };
        }
    }
};
</script>

<style scoped>
.event-block {
    width: 50px;
    height: 40px;
    border-bottom: 4px solid;
    margin-right: 12px;
    background-color: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    transition: background-color .2s, border-color .2s, color .2s;
}
.event {
    align-items: center;
    margin-bottom: 6px;
}
.event-block-logo {
    width: calc(100% - 8px);
    height: calc(100% - 6px);
}
.event-name {
    font-size: 1.2em;
    margin-bottom: 4px;
}
.event.team-display .event-name {
    font-weight: bold;
    /*font-size: 1.4em;*/
}
</style>

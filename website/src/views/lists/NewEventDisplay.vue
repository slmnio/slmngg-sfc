<template>
    <a v-if="useRawTag" :href="url('event', event, {subdomain: event.subdomain, partial_subdomain: event.partial_subdomain})" class="event no-link-style d-flex default-thing" :style="blockTheme">
        <div class="event-block flex-center">
            <div class="event-block-logo bg-center" :style="blockLogo"></div>
        </div>
        <div class="event-name">
            {{ event.name }}
        </div>
    </a>
    <router-link v-else :to="url('event', event)" class="event no-link-style d-flex default-thing" :style="blockTheme">
        <div class="event-block flex-center">
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
    name: "NewEventDisplay",
    props: ["event"],
    methods: { url },
    data: () => ({ useRawTag: false }),
    computed: {
        blockTheme() {
            if (!this.event || !this.event.theme) return {};
            return {
                backgroundColor: this.event.theme.color_logo_background || this.event.theme.color_theme,
                borderColor: this.event.theme.color_logo_accent || this.event.theme.color_text_on_theme,
                color: this.event.theme.color_text_on_logo_background || this.event.theme.color_text_on_theme
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
.event {
    border-bottom-width: 4px;
    border-bottom-style: solid;
    min-height: 58px;
}
.event:hover {
    color: inherit;
}
.event-block {
    width: 50px;
    height: 40px;
    flex-shrink: 0;
    margin-right: 2px;
}
.event {
    align-items: center;
}
.event-block-logo {
    width: calc(100% - 8px);
    height: calc(100% - 6px);
}
.event-name {
    font-size: 1.2em;
    line-height: 1;
    margin: 0 4px 4px 0;
}
.event.team-display .event-name {
    font-weight: bold;
    /*font-size: 1.4em;*/
}
</style>

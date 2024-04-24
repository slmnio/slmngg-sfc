<template>
    <a v-if="useRawTag" :href="url('event', event, {subdomain: event.subdomain, partial_subdomain: event.partial_subdomain})" class="event no-link-style d-flex default-thing" :style="blockTheme">
        <div class="event-block flex-center">
            <div class="event-block-logo bg-center" :style="blockLogo"></div>
        </div>
        <div class="event-name industry-align">
            {{ event.name }}
        </div>
    </a>
    <router-link v-else :to="url('event', event)" class="event no-link-style d-flex default-thing" :style="blockTheme">
        <div class="event-block flex-center">
            <div class="event-block-logo bg-center" :style="blockLogo"></div>
        </div>
        <div class="event-name industry-align">
            {{ event.name }}
        </div>
    </router-link>
</template>

<script>
import { url } from "@/utils/content-utils";
import { resizedImage } from "@/utils/images";

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
            return resizedImage(this.event.theme, ["default_logo"], "h-50");
        }
    }
};
</script>

<style scoped>
.event {
    border-bottom-width: .25em;
    border-bottom-style: solid;
    min-height: 58px;
}
.event:hover {
    color: inherit;
}
.event-block {
    width: 3em;
    height: 2.5em;
    flex-shrink: 0;
    margin-right: .125em;
}
.event {
    align-items: center;
}
.event-block-logo {
    width: calc(100% - .5em);
    height: calc(100% - .3em);
}
.event-name {
    font-size: 1.2em;
    line-height: 1;
    margin-right: .33em;
}
.event.team-display .event-name {
    font-weight: bold;
    /*font-size: 1.4em;*/
}
</style>

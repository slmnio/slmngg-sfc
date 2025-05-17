<template>
    <b-button squared class="broadcast-display default-thing" :disabled :style="style">
        <template v-if="broadcast">
            <div class="event-logo flex-center">
                <div class="event-logo-inner bg-center" :style="logo"></div>
            </div>
            <div class="broadcast-name text-left">{{ text || broadcast.name }}</div>
        </template>
        <LoadingIcon v-else />
    </b-button>
</template>

<script>
import LoadingIcon from "@/components/website/LoadingIcon";
import { logoBackground } from "@/utils/theme-styles";
import { resizedImage } from "@/utils/images";
export default {
    name: "BroadcastDisplay",
    components: { LoadingIcon },
    props: ["broadcast", "disabled", "text"],
    computed: {
        theme() {
            return this.broadcast?.theme_override ?? this.broadcast?.event?.theme;
        },
        style() {
            if (!this.theme) return {};
            return logoBackground(this.theme);
        },
        logo() {
            if (!this.theme) return {};
            return resizedImage(this.theme, ["default_logo"], "h-50");
        }
    }
};
</script>

<style scoped>
    .broadcast-display {
        width: 300px;
        padding: .25em .5em;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        background-color: #555;
        min-height: 3em;
        border: none;
    }

    .event-logo {
        height: 2.5em;
        width: 2.5em;
        margin-right: .75em;
    }
    .event-logo-inner {
        width: 100%;
        height: 100%;
    }
    .broadcast-name {
        line-height: 1;
    }
</style>

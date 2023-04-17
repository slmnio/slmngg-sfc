<template>
    <div class="broadcast-display default-thing" :style="style" @click="handleClick">
        <LoadingIcon v-if="!broadcast"/>
        <div class="event-logo flex-center" v-if="broadcast">
            <div class="event-logo-inner bg-center" :style="logo"></div>
        </div>
        <div class="broadcast-name" v-if="broadcast">{{ broadcast.name }}</div>
    </div>
</template>

<script>
import LoadingIcon from "@/components/website/LoadingIcon";
import { logoBackground } from "@/utils/theme-styles";
import { resizedImage } from "@/utils/images";
export default {
    name: "BroadcastDisplay",
    components: { LoadingIcon },
    props: ["broadcast", "setMethod"],
    computed: {
        theme() {
            return this.broadcast?.event?.theme;
        },
        style() {
            if (!this.theme) return {};
            return logoBackground(this.theme);
        },
        logo() {
            if (!this.theme) return {};
            return resizedImage(this.theme, ["default_logo"], "h-50");
        }
    },
    methods: {
        handleClick() {
            if (this.setMethod) {
                this.setMethod(this.broadcast);
            }
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
    }
    .broadcast-display[disabled] {
        pointer-events: none;
        opacity: 0.6;
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
</style>

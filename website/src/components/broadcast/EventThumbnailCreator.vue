<template>
    <div class="event-thumbnail-creator w-100 h-100 position-absolute flex-center" :class="{'has-title': !!title}" :style="thumbnailBackground">
        <span class="hover-reveal">SOLID:<br>LOGO BACKGROUND</span>

        <div class="top-content w-100 flex-center flex-column">
            <div class="event-icon-holder flex-center">
                <div class="event-icon bg-center" :style="eventIcon"></div>
            </div>
            <div class="title" v-if="title" :style="textColor" contenteditable="true">{{ title }}</div>
        </div>

        <div class="event-gradient position-absolute w-100 h-100" :style="gradient">
            <span class="hover-reveal">GRADIENT:<br>TRANSPARENT<br>TO<br>LOGO ACCENT</span>
        </div>
        <div class="event-lower-bar position-absolute w-100" :style="lowerBar">
            <span class="hover-reveal">ALT</span>
        </div>
    </div>
</template>

<script>
import { ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { resizedImage } from "@/utils/images";

export default {
    name: "EventThumbnailCreator",
    props: ["broadcast", "title"],
    computed: {
        event() {
            if (!this.broadcast || !this.broadcast.event) return null;
            return ReactiveRoot(this.broadcast.event.id, {
                theme: ReactiveThing("theme")
            });
        },
        eventIcon() {
            if (!this.event || !this.event.theme) return {};
            return resizedImage(this.event.theme, ["default_wordmark", "default_logo", "small_logo"], "orig");
        },
        thumbnailBackground() {
            if (!this.event || !this.event.theme) return {};
            return {
                backgroundColor: this.event.theme.color_logo_background
            };
        },
        gradient() {
            if (!this.event || !this.event.theme) return {};
            return {
                backgroundImage: `linear-gradient(0deg, ${this.event.theme.color_logo_accent},transparent)`
            };
        },
        lowerBar() {
            if (!this.event || !this.event.theme) return {};
            return {
                backgroundColor: this.event.theme.color_alt
            };
        },
        textColor() {
            if (!this.event || !this.event.theme) return {};
            return {
                color: this.event.theme.color_text_on_logo_background || this.event.theme.color_text_on_theme
            };
        }
    }
};
</script>

<style scoped>
    .event-icon-holder {
        width: 60%;
        height: 75%;
    }
    .event-icon {
        width: 100%;
        height: 100%;
    }


    .event-lower-bar {
        bottom: 0;
        height: 8%;
    }

    .event-gradient {
        opacity: 0.5;
    }
    span.hover-reveal {
        position: absolute;
        color: gray;
        font-weight: bold;
        font-size: 3em;
        left: 10px;
        display: none;
    }
    .event-thumbnail-creator:hover .hover-reveal {
        display: initial;
    }

    .event-thumbnail-creator {
        align-items: flex-start;
    }

    .top-content {
        height: 92%;
        z-index: 1;
    }

    .title {
        font-size: 15vh;
        line-height: 0.9;
        padding: 2vh 0;
        white-space: pre-wrap;
        text-align: center;
    }

</style>

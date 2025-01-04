<template>
    <div class="news-thumbnail default-thing" :style="border">
        <div class="icons">
            <i v-if="item.redirect_url" class="fa-fw fas fa-external-link"></i>
        </div>
        <div v-if="customThumbnail" class="news-custom-thumbnail w-100 bg-center" :style="customThumbnail"></div>
        <div v-else class="news-generated-thumbnail w-100 flex-center flex-column" :class="{'has-thumbnail-text': !!item?.thumbnail_text}" :style="{ backgroundColor: generatedThumbnail.backgroundColor, color: generatedThumbnail.color }">
            <div class="news-generated-thumbnail-logo bg-center" :style="{backgroundImage: generatedThumbnail.backgroundImage}"></div>
            <Squeezable v-if="item.thumbnail_text" class="news-thumbnail-text flex-center" align="center">
                <div class="industry-align">{{ item?.thumbnail_text }}</div>
            </Squeezable>
        </div>
    </div>
</template>

<script>
import { bg, resizedImage } from "@/utils/images";
import Squeezable from "@/components/broadcast/Squeezable.vue";

export default {
    name: "NewsThumbnail",
    components: { Squeezable },
    props: ["item"],
    computed: {
        border() {
            return {
                borderColor: this.customThumbnail
                    ? (this.connectionTheme?.color_theme || this.connectionTheme?.color_logo_background || this.connectionTheme?.color_logo_accent)
                    : (this.connectionTheme?.color_accent || this.connectionTheme?.color_logo_accent || this.connectionTheme?.color_theme)
            };
        },
        customThumbnail() {
            if (!this.item.thumbnail) {
                if (this.item.embed && this.item.use_embed_thumbnail) {
                    const vodURL = new URL(this.item.embed);
                    if (["www.youtube.com", "youtube.com"].includes(vodURL.host)) {
                        return bg(`https://i.ytimg.com/vi/${vodURL.searchParams.get("v")}/maxresdefault.jpg`);
                    }
                    if (["youtu.be"].includes(vodURL.host)) {
                        return bg(`https://i.ytimg.com/vi/${vodURL.pathname.slice(1)}/maxresdefault.jpg`);
                    }
                }
                return null;
            }

            return resizedImage(this.item, ["thumbnail"], "h-300"); // gets centered vertically
        },
        connectionTheme() {
            if (this.item?.event?.theme && this.item?.prefer_event) return this.item.event.theme;
            if (this.item?.team?.theme) return this.item.team.theme;
            if (this.item?.event?.theme) return this.item.event.theme;
            return null;
        },
        generatedThumbnail() {
            if (!this.connectionTheme) return {};

            return {
                backgroundColor: this.connectionTheme.color_logo_background,
                color: this.connectionTheme.color_text_on_logo_background,
                ...resizedImage(this.connectionTheme, ["default_wordmark", "default_logo"], "h-200")
            };
        }
    }
};
</script>

<style scoped>
    .news-thumbnail:before {
        padding-top: 50%;
        display: block;
        content: " "
    }
    .news-thumbnail {
        background: #333;
        display: flex;
        border-bottom-width: 4px;
        border-bottom-style: solid;
        position: relative;
    }
    .news-custom-thumbnail {
        background-size: cover;
        /* crops 16:9 to 2:1 */
    }
    .news-generated-thumbnail-logo {
        width: calc(100% - 16px);
        height: calc(100% - 24px);
    }

    .news-generated-thumbnail.has-thumbnail-text {
        justify-content: flex-end;
    }
    .news-generated-thumbnail.has-thumbnail-text .news-generated-thumbnail-logo {
        height: 100%;
        margin-top: .5em;
        margin-bottom: .1em;
        flex-grow: 0;
    }

    .news-thumbnail-text {
        font-weight: bold;
        text-transform: uppercase;
        font-size: 2em;
        width: 100%;
        flex-shrink: 0;
        margin-top: 0.1em;
        margin-bottom: 0.1em;
        height: 1.25em;
    }
    .news-thumbnail-text div {
        text-align: center;
        padding: 0 0.3em;
    }

    .icons {
        position: absolute;
        top: 0;
        right: 0;
        padding: .5em .25em;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .icons i {
        color: white;
        text-shadow: 0 0 5px black;
    }
</style>

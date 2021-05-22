<template>
    <div class="news-thumbnail" :style="border">
        <div class="news-custom-thumbnail w-100 bg-center" v-if="customThumbnail" :style="customThumbnail"></div>
        <div class="news-generated-thumbnail w-100 flex-center" v-else :style="{ backgroundColor: generatedThumbnail.backgroundColor }">
            <div class="news-generated-thumbnail-logo bg-center" :style="{backgroundImage: generatedThumbnail.backgroundImage}"></div>
        </div>
    </div>
</template>

<script>
import { resizedImage } from "@/utils/content-utils";

export default {
    name: "NewsThumbnail",
    props: ["item"],
    computed: {
        border() {
            return {
                borderColor: this.customThumbnail
                    ? (this.item?.event?.theme?.color_theme || this.item?.event?.theme?.color_logo_background)
                    : (this.item?.event?.theme?.color_accent || this.item?.event?.theme?.color_logo_accent || this.item?.event?.theme?.color_theme)
            };
        },
        customThumbnail() {
            if (!this.item.thumbnail) return null;

            return { backgroundImage: `url(${resizedImage(this.item, "thumbnail", 150)})` };
        },
        generatedThumbnail() {
            if (!this.item?.event?.theme) return {};

            return {
                backgroundColor: this.item.event.theme.color_logo_background,
                backgroundImage: `url(${resizedImage(this.item.event.theme, "default_wordmark", 150) || resizedImage(this.item.event.theme, "default_logo", 150)})`
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
        border-bottom: 4px solid transparent;
        position: relative;
    }
    .news-custom-thumbnail {
        background-size: 100%;
        /* crops 16:9 to 2:1 */
    }
    .news-generated-thumbnail-logo {
        width: calc(100% - 16px);
        height: calc(100% - 24px);
    }
</style>

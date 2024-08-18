<template>
    <component
        :is="noLink ? 'div' : 'router-link'"
        :to="noLink ? null : this.overrideURL || url(this.type, this.linkTo || this.thing, this.linkOptions || {})"
        class="link content-thing default-thing"
        :style="bgStyle"
        :class="{ 'has-headshot' : showHeadshot && headshot }">
        <span v-if="showHeadshot" class="link-headshot">
            <span class="headshot" :style="headshot"></span>
        </span>
        <span class="link-text">
            <span
                v-if="shouldShowLogo && !logoRight"
                class="icon-internal bg-center icon-internal-left"
                :style="logo"></span>

            <span v-if="text !== ''" class="name">{{ text || thing.name }}</span>

            <i v-if="thing.verified" class="fas fa-badge-check fa-fw" title="REAL"></i>

            <LoadingIcon v-if="loading" />

            <span
                v-if="shouldShowLogo && logoRight"
                class="icon-internal bg-center icon-internal-right"
                :style="logo"></span>
        </span>
    </component>
</template>

<script>
import { url } from "@/utils/content-utils";
import { resizedImage, resizedImageNoWrap } from "@/utils/images";
import LoadingIcon from "@/components/website/LoadingIcon";

export default {
    name: "ContentThing",
    components: { LoadingIcon },
    props: ["theme", "thing", "showLogo", "type", "text", "logoRight", "linkTo", "showHeadshot", "overrideURL", "noLink", "linkOptions"],
    computed: {
        shouldShowLogo() {
            /*
            * Show logo when:
            * - requested and loading
            * - requested and found
            *
            * Hide logo when:
            * - not requested
            * - requested and not found
            * */

            if (this.showLogo) {
                // console.log(this.thing.name, this.theme);
                if (this.logo) return true;
                if ((this.text || this.thing.name) && (this.theme && !this.theme.id)) return true; // theme not started loading
                // there is team.has_theme but that's not universal
                if (this.theme?.__loading) return true; // theme loading
            }
            return false;
        },
        loading() {
            if (this.thing?.limited) return false;
            return this.thing.__loading;
        },
        logo () {
            if (!this.theme?.default_logo) return null;
            return resizedImage(this.theme, ["small_logo", "default_logo"], "s-120");
        },
        headshot () {
            if (!this.thing) return null;
            return {
                backgroundImage: `url(${resizedImageNoWrap(this.thing, "headshot", 100) ?? resizedImageNoWrap(this.theme, "default_logo", 100)})`,
                backgroundColor: this.theme.color_accent || this.theme.color_alt
            };
        },
        bgStyle () {
            if (!this.theme) return {};
            return {
                backgroundColor: this.theme.color_logo_background || this.theme.color_theme,
                borderColor: this.theme.color_logo_accent || this.theme.color_accent,
                color: this.theme.color_text_on_logo_background || this.theme.color_text_on_theme
            };
        }
    },
    methods: {
        url
    }
};
</script>

<style scoped>
    .content-thing {
        padding: .25em .5em;
        margin: .25em .25em;
        border-bottom-width: .2em;
        border-bottom-style: solid;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .content-thing:hover {
        color: inherit;
        text-decoration: underline;
    }

    .icon-internal {
        height: 1.5em;
        width: 1.5em;
    }
    .icon-internal.icon-internal-left + .name { margin-left: .3em }
    .icon-internal.icon-internal-right + .name { margin-right: .3em }
    .content-thing i {
      margin: 5px 0;
    }

    .content-thing.has-headshot {
      display: inline-flex;
      flex-direction: column;
    }

    .headshot {
      display: inline-flex;
      width: 180px;
      height: 180px;
      margin-top: 4px;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: bottom;
    }
    .link-text {
      display: inline-flex;
    }
</style>

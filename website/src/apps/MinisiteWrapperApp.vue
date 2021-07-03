<template>
    <div class="minisite-wrapper-app">
        <div id="app" v-if="event && (event._original_data_id || event.__loading)">
            <WebsiteNav :minisite="event"/>
            <v-style id="minisite-css">
                body.minisite {
                    background-color: {{ theme.color_body }};
                    color: {{ theme.color_text_on_body }};
                }
                body.minisite nav {
                    background-color: {{ theme.color_navbar }};
                }
                body.minisite .website-nav nav,
                body.minisite .website-nav .navbar-brand,
                body.minisite .website-nav .navbar-text {
                    color: {{ nav_color }};
                }
                body.minisite .website-nav .nav-link { color: {{ nav_color }}7f !important; }
                body.minisite .website-nav .nav-link:hover { color: {{ nav_color }}bf !important; }
                body.minisite .website-nav .nav-link.active { color: {{ nav_color }}ff !important; }
            </v-style>
            <router-view class="my-3 slmngg-page"/>
        </div>
        <NotFoundPage v-else/>
    </div>
</template>

<script>
import NotFoundPage from "@/views/NotFoundPage";
import WebsiteNav from "@/components/website/WebsiteNav";
import { ReactiveThing } from "@/utils/reactive";

export default {
    name: "MinisiteWrapperApp",
    components: {
        NotFoundPage,
        // Event,
        // WebsiteApp,
        WebsiteNav
    },
    computed: {
        event () {
            return this.$root.minisiteEvent;
        },
        theme() {
            return ReactiveThing("theme")(this.event);
        },
        nav_color() {
            if (!this.theme) return "#ffffff";
            if (this.theme.color_navbar === this.theme.color_body) return this.theme.color_text_on_body;
            if (this.theme.color_navbar === this.theme.color_theme) return this.theme.color_text_on_theme;
            if (this.theme.color_navbar === this.theme.color_logo_background) return this.theme.color_text_on_logo_background;

            return "#ffffff";
        }
    },
    mounted () {
        document.body.classList.add("website", "minisite");
    }
};
</script>

<style scoped>
@import "~@/assets/bootstrap.css";
@import "~@/assets/app.css";

</style>

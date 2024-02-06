<template>
    <div class="minisite-wrapper-app">
        <div id="app" v-if="event && (event._original_data_id || event.__loading)">
            <WebsiteNav :minisite="event" :activeEventID="activeEventID" />
            <v-style id="minisite-css">
                body.minisite {
                    background-color: {{ theme.color_body }};
                    color: {{ theme.color_text_on_body }};
                    /* Having an empty string (eg --theme-passive: ; ) won't trigger the fallbacks below */
                    {{ theme.color_website_passive && `--theme-passive: ${theme.color_website_passive};` }}
                    {{ theme.color_website_active && `--theme-active: ${theme.color_website_active};` }}
                    {{ theme.color_website_dark && `--theme-dark: ${theme.color_website_dark};` }}
                    {{ theme.color_website_text_on_dark && `--theme-ondark: ${theme.color_website_text_on_dark};` }}
                }
                body.minisite .ct-passive { color: var(--theme-passive, #ffffff); }
                body.minisite .ct-active { color: var(--theme-active, #66d9ff); }
                body.minisite .ct-dark { color: var(--theme-dark, #222222); }
                body.minisite .ct-ondark { color: var(--theme-ondark, #ffffff); }

                body.minisite a.ct-passive:hover,
                body.minisite .ct-passive a:hover {
                    color: var(--theme-active, #66d9ff);
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
            <router-view @id_change="(id) => activeEventID = id" class="my-3 slmngg-page"/>
        </div>
        <NotFoundPage v-else/>
    </div>
</template>

<script>
import NotFoundPage from "@/views/NotFoundPage";
import WebsiteNav from "@/components/website/WebsiteNav";
import { ReactiveThing } from "@/utils/reactive";
import "@/assets/bootstrap.css";
import "@/assets/app.css";
export default {
    name: "MinisiteWrapperApp",
    data: () => ({
        activeEventID: null
    }),
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

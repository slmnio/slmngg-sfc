<template>
    <div class="minisite-wrapper-app">
        <div id="app" v-if="event && (event._original_data_id || event.__loading)">
            <WebsiteNav :minisite="event"/>
            <router-view class="my-3 slmngg-page"/>
        </div>
        <NotFoundPage v-else/>
    </div>
</template>

<script>
import Event from "@/views/Event";
import NotFoundPage from "@/views/NotFoundPage";
import WebsiteApp from "@/apps/WebsiteApp";
import WebsiteNav from "@/components/website/WebsiteNav";

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
        }
    },
    beforeCreate () {
        document.body.className = "website";
    }
};
</script>

<style scoped>
@import "~@/assets/bootstrap.css";
@import "~@/assets/app.css";

</style>

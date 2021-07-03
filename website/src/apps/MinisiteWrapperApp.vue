<template>
    <div class="minisite-wrapper-app">
        <WebsiteApp v-if="event && (event._original_data_id || event.__loading)" :id="event._original_data_id"/>
        <NotFoundPage v-else/>
    </div>
</template>

<script>
import Event from "@/views/Event";
import NotFoundPage from "@/views/NotFoundPage";
import WebsiteApp from "@/apps/WebsiteApp";

export default {
    name: "MinisiteWrapperApp",
    components: {
        NotFoundPage,
        // Event,
        WebsiteApp
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

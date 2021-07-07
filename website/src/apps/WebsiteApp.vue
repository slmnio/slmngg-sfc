<template>
    <div id="app">
        <WebsiteNav/>
        <router-view class="my-3 slmngg-page"/>
    </div>
</template>

<script>
import WebsiteNav from "@/components/website/WebsiteNav";

export default {
    name: "WebsiteApp",
    components: {
        WebsiteNav
    },
    beforeCreate () {
        document.body.className = "website";
    }
};
</script>

<style scoped>
@import "~@/assets/bootstrap.css";
@import "~@/assets/app.css";

.nav-link-match {
    color: rgba(255,255,255,0.8) !important;
}
.nav-link-match:hover {
    color: rgba(255,255,255,1) !important;
}

</style>

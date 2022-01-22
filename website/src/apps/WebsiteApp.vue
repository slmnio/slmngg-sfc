<template>
    <div id="app">
        <WebsiteNav/>
        <QuickSwitcher ref="qs" />
        <router-view class="my-3 slmngg-page"/>
    </div>
</template>

<script>
import WebsiteNav from "@/components/website/WebsiteNav";
import QuickSwitcher from "@/components/QuickSwitcher";

export default {
    name: "WebsiteApp",
    components: {
        QuickSwitcher,
        WebsiteNav
    },
    beforeCreate () {
        document.body.className = "website";
    },
    mounted() {
        document.body.addEventListener("keydown", (e) => {
            if ((e.key === "k") && e.ctrlKey) {
                e.preventDefault();
                this.$refs.qs.trigger();
            }
        });
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

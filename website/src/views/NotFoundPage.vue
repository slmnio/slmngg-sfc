<template>
    <div id="app">
        <WebsiteNav/>
        <div class="container my-3">
            <h1 class="text-center">Not Found</h1>
        </div>
    </div>
</template>

<script>
import WebsiteNav from "@/components/website/WebsiteNav";

export default {
    name: "NotFoundPage",
    components: { WebsiteNav },
    beforeCreate () {
        document.body.className = "website";
    }
};
</script>

<style scoped>
@import "~@/assets/bootstrap.css";
@import "~@/assets/app.css";

</style>

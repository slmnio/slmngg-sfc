<template>
    <GenericOverlay class="custom-overlay" :title="title" />
</template>

<script>
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay";

export default {
    name: "StandingsOverlay",
    components: { GenericOverlay },
    props: ["broadcast", "title"],
    head() {
        return {
            title: `Custom "${this.title}" | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

<style scoped>

</style>

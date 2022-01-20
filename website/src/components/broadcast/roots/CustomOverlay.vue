<template>
    <GenericOverlay :title="title" />
</template>

<script>
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay";

export default {
    name: "StandingsOverlay",
    components: { GenericOverlay },
    props: ["broadcast", "title"]
};
</script>

<style scoped>

</style>

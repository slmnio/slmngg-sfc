<template>
    <GenericOverlay class="other-broadcasts-overlay" :title="title || 'Other broadcasts'">
        <OtherBroadcasts :starting-broadcast="broadcast" />
    </GenericOverlay>
</template>

<script>
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay";
import OtherBroadcasts from "@/components/broadcast/OtherBroadcasts";
export default {
    name: "OtherBroadcastsOverlay",
    components: { OtherBroadcasts, GenericOverlay },
    props: ["broadcast", "title"],
    metaInfo() {
        return {
            title: `Other Broadcasts | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

<style scoped>

</style>

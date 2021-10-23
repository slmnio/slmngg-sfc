<template>
    <div class="syncer-overlay">
        <transition name="fade">
            <IngameOverlay id="overlay" :broadcast="broadcast" v-if="showOverlay" />
        </transition>
        <transition name="fade">
            <iframe class="w-100 h-100 position-absolute border-0" src="https://syncer.live/?embed" v-if="showSyncer"/>
        </transition>
    </div>
</template>

<script>
import IngameOverlay from "@/components/broadcast/IngameOverlay";
export default {
    name: "SyncerOverlay",
    components: { IngameOverlay },
    props: ["broadcast"],
    computed: {
        settings() {
            if (!this.broadcast) return;
            return this.broadcast?.observer_settings || [];
        },
        showSyncer() {
            return this.settings.includes("Show syncer");
        },
        showOverlay() {
            return this.settings.includes("Show overlay");
        }
    }
};
</script>

<style scoped>

</style>

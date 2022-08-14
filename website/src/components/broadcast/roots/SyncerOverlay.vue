<template>
    <div class="syncer-overlay">
        <transition name="fade">
            <IngameOverlay id="overlay" :broadcast="broadcast" v-if="showOverlay" :animation-active="true" />
        </transition>
        <transition name="fade">
            <iframe class="w-100 h-100 position-absolute border-0" :src="syncerURL" v-show="showSyncer"/>
        </transition>
    </div>
</template>

<script>
import IngameOverlay from "@/components/broadcast/roots/IngameOverlay";
export default {
    name: "SyncerOverlay",
    components: { IngameOverlay },
    props: ["broadcast", "client"],
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
        },
        syncerURL() {
            let base = "https://syncer.live/?embed&noCenter";
            if (this.client?.name) base += `&label=${this.client.name}`;
            return base;
        }
    },
    metaInfo() {
        return {
            title: `Syncer | ${this.client?.name || this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

<style scoped>

</style>

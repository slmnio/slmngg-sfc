<template>
    <div class="container">
        <h3>Choosing a broadcast</h3>
        <p>Solo overlays are connected to an ongoing event on SLMN.GG.</p>
        <p>The events that have solo overlays enabled are shown here, you can choose which one you wish to use.</p>

        <div v-if="broadcasts?.length" class="broadcasts-list mb-3">
            <BroadcastDisplay
                v-for="broadcast in broadcasts"
                :key="broadcast.id"
                class="broadcast"
                :broadcast="broadcast"
                :text="broadcast?.event?.name"
                :class="{'selected': selectedBroadcast?.id === broadcast?.id}"
                @click="selectedBroadcast = broadcast"
            />
        </div>
        <b-alert v-else-if="broadcasts && broadcasts.length === 0" variant="warning" class="mb-3" :model-value="true">
            <b>No events are enabled for the solo overlay right now.</b>
        </b-alert>

        <p v-if="selectedBroadcast">
            The overlay link for <b>{{ selectedBroadcast?.event?.name }}</b> is: <code><copy-text-button>{{ overlayURL }}</copy-text-button></code>
        </p>
        <p v-else-if="broadcasts?.length">
            Select a broadcast above to generate a link.
        </p>

        <h3>Installing into OBS</h3>
        <div class="mb-1">
            Create a <b>Browser Source</b> in OBS:
        </div>
        <img alt="Screenshot of OBS showing the 'Browser' option selected" class="guide-image" :src="obsNewBrowser">
        <div>
            Set the following settings:
            <ul>
                <li><b>URL:</b> <code v-if="overlayURL"><copy-text-button>{{ overlayURL }}</copy-text-button></code><span v-else>An overlay link generated above</span></li>
                <li><b>Width:</b> <copy-text-button>1920</copy-text-button></li>
                <li><b>Height:</b> <copy-text-button>630</copy-text-button></li>
            </ul>
        </div>
        <img alt="Screenshot of an OBS Browser Source properties screen" class="guide-image" :src="obsSourceProperties">
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive.js";
import BroadcastDisplay from "@/components/website/dashboard/BroadcastDisplay.vue";
import CopyTextButton from "@/components/website/CopyTextButton.vue";

import obsNewBrowser from "@/assets/guide/solo/OBS-new-browser-source.png";
import obsSourceProperties from "@/assets/guide/solo/OBS-source-properties.png";

export default {
    name: "SoloOverlayGuideInstallation",
    components: { CopyTextButton, BroadcastDisplay },
    data: () => ({
        selectedBroadcast: null,
        obsNewBrowser,
        obsSourceProperties,
    }),
    computed: {
        broadcasts() {
            return ReactiveRoot("special:solo-broadcasts", {
                "broadcasts": ReactiveArray("broadcasts", {
                    "event": ReactiveThing("event", {
                        "theme": ReactiveThing("theme")
                    })
                })
            })?.broadcasts;
        },
        overlayURL() {
            if (!this.selectedBroadcast?.key) return null;
            return `https://slmn.gg/broadcast/${this.selectedBroadcast?.key}/solo?modules=stacked`;
        }
    },
};
</script>

<style scoped>
    .broadcast:not(.selected) {
        opacity: 0.6;
    }
    .broadcast.selected {
        outline: 2px solid var(--theme) !important;
        outline-offset: 2px;
    }
</style>

<template>
    <div class="broadcast-editor d-flex flex-wrap align-items-center justify-content-center">
        <div class="area left-area">
            <div class="group">
                <div class="group-top">Flip Teams</div>
                <div class="group-bottom">
                    <b-form-checkbox :checked="match.flip_teams" @change="(state) => toggleFlipTeams(state)"
                                     button size="sm" :button-variant="match.flip_teams ? 'primary' : ''">
                        Flip Teams
                    </b-form-checkbox>
                </div>
            </div>
            <div class="group map-attack">
                <div class="group-top">Attacker Side</div>
                <div class="group-bottom">
                    <b-button-group>
                        <b-button size="sm" v-for="side in ['Left', 'Right', 'Both']" :key="side"
                                  :variant="broadcast.map_attack === side ? 'danger' : 'secondary'"
                                  :disabled="updateData?.mapAttack !== undefined"
                                  @click="() => setAttack(side)">{{ side }}</b-button>
                    </b-button-group>
                </div>
            </div>
            <div class="group">
                <div class="group-top">Player Cams</div>
                <div class="group-bottom">
                    <b-form-checkbox :checked="broadcast.show_cams" @change="(state) => togglePlayerCams(state)"
                                     :disabled="updateData?.playerCams !== undefined"
                                     button size="sm" :button-variant="broadcast.show_cams ? 'primary' : ''">
                        Show Cams
                    </b-form-checkbox>
                </div>
            </div>
        </div>
        <div class="spacer flex-grow-1"></div>
        <div class="area right-area">
            <div class="group text-end">
                <div class="group-top">Break match</div>
                <div class="group-bottom">
                    <b-button size="sm" :variant="broadcast.show_live_match ? 'primary' : 'secondary'" :pressed="broadcast.show_live_match"
                              :disabled="updateData?.showLiveMatch !== undefined"
                              @click="() => setLiveMatchVisibility(!broadcast.show_live_match)">Show live match</b-button>
                </div>
            </div>
            <div class="group text-end">
                <div class="group-top">Break Settings</div>
                <div class="group-bottom">
                    <div class="fake-btn-group">
                        <BreakDisplayMultiModal :broadcast="broadcast"/>
                    </div>
                </div>
            </div>
            <div class="group text-end">
                <div class="group-top">Observers</div>
                <div class="group-bottom">
                    <ObserverSettingsModal :broadcast="broadcast"/>
                </div>
            </div>
            <div class="group text-end">
                <div class="group-top">Advertise</div>
                <div class="group-bottom">
                    <b-form-checkbox :checked="broadcast.advertise" @change="(state) => advertiseBroadcast(state)"
                                     :disabled="updateData?.advertise !== undefined"
                                     button size="sm" :button-variant="broadcast.advertise ? 'primary' : ''">
                        {{ broadcast.advertise ? "Advertising" : "Advertise" }}
                    </b-form-checkbox>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {
    toggleFlipTeams,
    updateBroadcastData
} from "@/utils/dashboard";
import ObserverSettingsModal from "@/components/website/dashboard/ObserverSettingsModal.vue";
import BreakDisplayMultiModal from "@/components/website/dashboard/BreakDisplayMultiModal.vue";

export default {
    name: "BroadcastEditor",
    props: ["client"],
    data: () => ({
        updateData: { },
        broadcastUpdateTimeout: null
    }),
    components: {
        BreakDisplayMultiModal,
        ObserverSettingsModal
    },
    computed: {
        broadcast() {
            return this.client.broadcast?.[0] || {};
        },
        match() {
            return this.broadcast?.live_match || {};
        }
    },
    methods: {
        async toggleFlipTeams(state) {
            await toggleFlipTeams();
        },
        async advertiseBroadcast(state) {
            this.updateData.advertise = state;
            return this.updateBroadcast();
        },
        async togglePlayerCams(state) {
            this.updateData.playerCams = state;
            return this.updateBroadcast();
        },
        async setAttack(side) {
            const set = side === this.broadcast.map_attack ? null : side;
            this.updateData.mapAttack = set;
            return this.updateBroadcast();
        },
        async setLiveMatchVisibility(visible) {
            this.updateData.showLiveMatch = visible;
            return this.updateBroadcast();
        },
        async updateBroadcast() {
            if (this.broadcastUpdateTimeout) clearTimeout(this.broadcastUpdateTimeout);

            // this.broadcastUpdateTimeout = setTimeout(async () => {
            await updateBroadcastData(this.updateData);
            this.updateData = {};
            // }, 500);
        }

    }
};
</script>

<style scoped>
    .area {
        display: flex;
        gap: 1em;
        margin-bottom: .5rem;
    }
    .right-area {
        margin-left: auto;
    }
    .group-top {
        font-size: 0.9em;
        text-transform: uppercase;
        font-weight: bold;
        margin-bottom: 0.25em;
    }
    .map-attack .btn {
        outline: none !important;
        box-shadow: none !important;
    }

    .fake-btn-group {
        position: relative;
        display: inline-flex;
        vertical-align: middle;
    }
    .fake-btn-group div:not(:first-child) >>> .btn {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }
    .fake-btn-group div:not(:last-child) >>> .btn {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }

</style>

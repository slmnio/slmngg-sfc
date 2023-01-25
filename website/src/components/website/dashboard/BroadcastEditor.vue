<template>
    <div class="broadcast-editor d-flex">
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
                              @click="() => setAttack(side)">{{ side }}</b-button>
                </b-button-group>
            </div>
        </div>
        <div class="group">
            <div class="group-top">Player Cams</div>
            <div class="group-bottom">
                <b-form-checkbox :checked="broadcast.show_cams" @change="(state) => togglePlayerCams(state)"
                                 button size="sm" :button-variant="broadcast.show_cams ? 'primary' : ''">
                    Show Cams
                </b-form-checkbox>
            </div>
        </div>
        <div class="spacer flex-grow-1"></div>
        <div class="group text-right">
            <div class="group-top">Break Display</div>
            <div class="group-bottom">
                <div class="fake-btn-group">
                    <BreakDisplayMultiModal :broadcast="broadcast" />
                </div>
            </div>
        </div>
        <div class="group text-right">
            <div class="group-top">Observers</div>
            <div class="group-bottom">
                <ObserverSettingsModal :broadcast="broadcast" />
            </div>
        </div>
        <div class="group text-right">
            <div class="group-top">Advertise</div>
            <div class="group-bottom">
                <b-form-checkbox :checked="broadcast.advertise" @change="(state) => advertiseBroadcast(state)"
                                 button size="sm" :button-variant="broadcast.advertise ? 'primary' : ''">{{ broadcast.advertise ? 'Advertising' : 'Advertise' }}</b-form-checkbox>
            </div>
        </div>
    </div>
</template>

<script>
import { BButton, BButtonGroup, BFormCheckbox } from "bootstrap-vue";
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
        ObserverSettingsModal,
        BFormCheckbox,
        BButtonGroup,
        BButton
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
            await toggleFlipTeams(this.$root.auth);
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
        async updateBroadcast() {
            if (this.broadcastUpdateTimeout) clearTimeout(this.broadcastUpdateTimeout);

            // this.broadcastUpdateTimeout = setTimeout(async () => {
            updateBroadcastData(this.$root.auth, this.updateData);
            this.updateData = {};
            // }, 500);
        }

    }
};
</script>

<style scoped>
    .broadcast-editor {
        gap: 1em;
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

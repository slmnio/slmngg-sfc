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
        <div class="spacer flex-grow-1"></div>
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
import { setBroadcastAdvertise, setMapAttack, toggleFlipTeams } from "@/utils/dashboard";

export default {
    name: "BroadcastEditor",
    props: ["client"],
    components: {
        BFormCheckbox, BButtonGroup, BButton
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
            await setBroadcastAdvertise(this.$root.auth, state);
        },
        async setAttack(side) {
            const set = side === this.broadcast.map_attack ? null : side;
            const response = await setMapAttack(this.$root.auth, set);
            if (response.error) {
                this.$notyf.error({
                    message: response.errorMessage
                });
            }
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
</style>

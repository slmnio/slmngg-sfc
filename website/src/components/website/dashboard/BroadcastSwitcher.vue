<template>
    <div class="broadcast-switcher">
        <div v-b-modal.broadcast-switcher>
            <BroadcastDisplay :broadcast="activeBroadcast" />
        </div>

        <b-modal ref="broadcast-switcher" id="broadcast-switcher" title="Broadcast Switcher" hide-footer>
            <div class="error text-danger mb-2" v-if="error"><i class="fas fa-exclamation-circle fa-fw"></i> Error: {{ error }}</div>
            <div class="broadcasts flex-center flex-column">
                <BroadcastDisplay class="broadcast" :disabled="bi === 0 || setting" v-for="(broadcast, bi) in broadcasts" :broadcast="broadcast" :key="broadcast.id" :set-method="switchBroadcast" />
            </div>
        </b-modal>
    </div>
</template>

<script>
import BroadcastDisplay from "@/components/website/dashboard/BroadcastDisplay";
import { BModal, VBModal } from "bootstrap-vue";
import { setActiveBroadcast } from "@/utils/dashboard";
export default {
    name: "BroadcastSwitcher",
    components: { BroadcastDisplay, BModal },
    directives: {
        BModal: VBModal
    },
    props: ["broadcasts"],
    data: () => ({
        setting: false,
        attemptedFirst: null,
        error: null
    }),
    computed: {
        activeBroadcast() {
            return this.broadcasts?.[0];
        }
    },
    methods: {
        async switchBroadcast(broadcast) {
            this.setting = true;
            this.attemptedFirst = broadcast;
            this.error = null;

            const request = await setActiveBroadcast(this.$root.auth, "self", broadcast);
            if (request.error) this.error = request.errorMessage;
            // this.setting = false;
        }
    },
    watch: {
        broadcasts(newBroadcasts) {
            if (!(this.attemptedFirst && newBroadcasts?.[0])) return;
            if (newBroadcasts[0]?.id === this.attemptedFirst.id) {
                this.setting = false;
            }
        },
        setting(isProcessing) {
            if (!isProcessing) {
                this.$refs["broadcast-switcher"].hide();
            }
        }
    }
};
</script>

<style scoped>
    .broadcasts .broadcast {
        margin: 0.25em 0;
        cursor: pointer;
    }
</style>

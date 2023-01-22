<template>
    <div class="broadcast-switcher">
        <div v-b-modal.broadcast-switcher>
            <BroadcastDisplay :broadcast="activeBroadcast" />
        </div>

        <b-modal ref="broadcast-switcher" id="broadcast-switcher" title="Broadcast Switcher" hide-footer>
            <div class="broadcasts flex-center flex-column">
                <BroadcastDisplay class="broadcast" :disabled="bi === 0 || setting" v-for="(broadcast, bi) in broadcastGroups.active" :broadcast="broadcast" :key="broadcast.id" :set-method="switchBroadcast" />
                <div class="broadcasts-text inactive" v-if="broadcastGroups.inactive.length">Inactive broadcasts</div>
                <BroadcastDisplay class="broadcast inactive" :disabled="bi === 0 || setting" v-for="(broadcast, bi) in broadcastGroups.inactive" :broadcast="broadcast" :key="broadcast.id" :set-method="switchBroadcast" />

            </div>

            <template v-slot:modal-footer>
                <div class="w-100 flex-center text-center">
                    Changing your broadcast will completely change your show's graphics.<br>
                    Make sure that you are not streaming and ready for these graphics to change.
                </div>
            </template>
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
        attemptedFirst: null
    }),
    computed: {
        activeBroadcast() {
            return this.broadcasts?.[0];
        },
        broadcastGroups() {
            const groups = {
                active: [],
                inactive: []
            };

            (this.broadcasts || []).forEach(broadcast => {
                if (broadcast?.active) {
                    groups.active.push(broadcast);
                } else {
                    groups.inactive.push(broadcast);
                }
            });

            return groups;
        }
    },
    methods: {
        async switchBroadcast(broadcast) {
            this.setting = true;
            this.attemptedFirst = broadcast;

            await setActiveBroadcast(this.$root.auth, "self", broadcast);
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

    .broadcast.inactive {
        opacity: 0.8;
        font-size: 12px;
        width: 18.75em;
    }

    .broadcasts-text.inactive {
        margin: .5em 0;
    }
</style>

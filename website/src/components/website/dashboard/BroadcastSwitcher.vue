<template>
    <div class="broadcast-switcher">
        <div v-b-modal.broadcast-switcher>
            <BroadcastDisplay :broadcast="activeBroadcast" />
        </div>

        <b-modal ref="broadcast-switcher" id="broadcast-switcher" title="Broadcast Switcher" hide-footer>
            <div class="broadcasts flex-center flex-column">
                <BroadcastDisplay class="broadcast" :class="{'active-broadcast': activeBroadcast.id === broadcast.id}" :disabled="activeBroadcast.id === broadcast.id || setting" v-for="broadcast in broadcastGroups.active" :broadcast="broadcast" :key="broadcast.id" :set-method="switchBroadcast" />
                <b-button class="broadcasts-text inactive" v-if="broadcastGroups.inactive.length"
                          :variant="showInactive ? 'primary' : 'secondary'" :class="{'active': showInactive}"
                          @click="showInactive = !showInactive">Show inactive broadcasts ({{ broadcastGroups.inactive.length }})</b-button>
                <div class="inactive-broadcasts" v-if="showInactive">
                    <BroadcastDisplay class="broadcast"
                                      :disabled="activeBroadcast.id === broadcast.id || setting"
                                      v-for="broadcast in broadcastGroups.inactive" :broadcast="broadcast"
                                      :key="broadcast.id" :set-method="switchBroadcast"/>
                </div>
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
import { setActiveBroadcast } from "@/utils/dashboard";
export default {
    name: "BroadcastSwitcher",
    components: { BroadcastDisplay },
    props: ["broadcasts"],
    data: () => ({
        setting: false,
        attemptedFirst: null,
        showInactive: false
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
                if (broadcast.id === this.activeBroadcast.id || broadcast?.active) {
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

    .inactive-broadcasts .broadcast {
        font-size: 12px;
        width: 18.75em;
    }

    .broadcasts-text.inactive {
        margin: .5em 0;
    }
</style>

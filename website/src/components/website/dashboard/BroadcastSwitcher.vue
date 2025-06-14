<template>
    <div class="broadcast-switcher">
        <div v-b-modal.broadcast-switcher>
            <BroadcastDisplay :broadcast="activeBroadcast" />
        </div>

        <b-modal id="broadcast-switcher" ref="broadcast-switcher" title="Broadcast Switcher" @show="showing = true">
            <div class="broadcasts flex-center flex-column">
                <BroadcastDisplay
                    v-for="broadcast in broadcastGroups.active"
                    :key="broadcast.id"
                    class="broadcast"
                    :class="{'active-broadcast': activeBroadcast.id === broadcast.id}"
                    :disabled="activeBroadcast.id === broadcast.id || setting"
                    :broadcast="broadcast"
                    @click="switchBroadcast(broadcast)" />
                <b-button
                    v-if="broadcastGroups.inactive.length"
                    class="broadcasts-text inactive"
                    :variant="showInactive ? 'primary' : 'secondary'"
                    :class="{'active': showInactive}"
                    @click="showInactive = !showInactive">
                    Show inactive broadcasts
                    ({{ broadcastGroups.inactive.length }})
                </b-button>
                <div v-if="showInactive" class="inactive-broadcasts">
                    <BroadcastDisplay
                        v-for="broadcast in broadcastGroups.inactive"
                        :key="broadcast.id"
                        class="broadcast"
                        :disabled="activeBroadcast.id === broadcast.id || setting"
                        :broadcast="broadcast"
                        @click="switchBroadcast(broadcast)" />
                </div>
            </div>

            <template #footer>
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
import { authenticatedRequest } from "@/utils/dashboard";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";

export default {
    name: "BroadcastSwitcher",
    components: { BroadcastDisplay },
    props: ["client"],
    data: () => ({
        setting: false,
        attemptedFirst: null,
        showInactive: false,
        showing: false
    }),
    computed: {
        broadcasts() {
            if (!this.showing) return [];
            if (!this.client?.id) return [];
            return ReactiveRoot(this.client?.id, {
                broadcast: ReactiveArray("broadcast", {
                    event: ReactiveThing("event", {
                        theme: ReactiveThing("theme")
                    })
                })
            })?.broadcast;
        },
        activeBroadcast() {
            return this.client?.broadcast;
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

            await authenticatedRequest("actions/set-active-broadcast", {
                client: "self",
                broadcast: broadcast.id || broadcast
            });
            this.setting = false;
        }
    },
    watch: {
        broadcasts: {
            deep: true,
            handler(newBroadcasts) {
                if (!(this.attemptedFirst && newBroadcasts?.[0])) return;
                if (newBroadcasts[0]?.id === this.attemptedFirst.id) {
                    this.setting = false;
                }
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

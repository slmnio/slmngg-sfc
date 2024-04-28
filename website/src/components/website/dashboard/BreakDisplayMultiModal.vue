<template>
    <div class="break-display-modal">
        <div v-b-modal.break-display>
            <b-button-group>
                <b-button size="sm" :class="{ active: broadcast?.countdown_end }" :variant="broadcast?.countdown_end ? 'primary' : 'secondary'"
                          @click="selectedTab = 'Countdown'">
                    <i class="fal fa-clock"></i>
                </b-button>
                <b-button size="sm" :class="{ active: automationIsActive }" :variant="automationIsActive ? 'primary' : 'secondary'">
                    <DashboardModalIcon/>
                    {{ autoText }}
                </b-button>
            </b-button-group>
        </div>
        <b-modal ref="modal" id="break-display" title="Break display settings">
            <b-form-radio-group class="w-100 mb-3" v-model="selectedTab" :options="tabs" buttons button-variant="outline-primary" />
            <BreakTimeControls :broadcast="broadcast" v-if="selectedTab === 'Countdown'" />
            <BreakTextTab :broadcast="broadcast" v-if="selectedTab === 'Text'" />
            <BreakDisplayTab :broadcast="broadcast" v-if="selectedTab === 'Display'"/>
            <BreakAutomationTab :broadcast="broadcast" v-if="selectedTab === 'Automation'" />

            <template #footer>
                <div v-if="selectedTab === 'Display'" class="w-100 flex-center text-center">
                    These buttons will change the break scene's display instantly.
                </div>
            </template>
        </b-modal>
    </div>
</template>

<script>
import DashboardModalIcon from "@/components/website/dashboard/DashboardModalIcon.vue";
import BreakDisplayTab from "@/components/website/dashboard/BreakDisplayTab.vue";
import BreakAutomationTab from "@/components/website/dashboard/BreakAutomationTab.vue";
import BreakTextTab from "@/components/website/dashboard/BreakTextTab.vue";
import BreakTimeControls from "@/components/website/dashboard/BreakTimeControls.vue";

export default {
    name: "BreakDisplayMultiModal",
    components: { BreakTimeControls, BreakTextTab, BreakAutomationTab, BreakDisplayTab, DashboardModalIcon },
    props: {
        broadcast: Object
    },
    data: () => ({
        selectedTab: "Display",
        tabs: [
            "Countdown",
            "Text",
            "Display",
            "Automation"
        ]
    }),
    computed: {
        autoText() {
            return this.broadcast?.break_display ? `Break: ${this.broadcast.break_display}` : "Break Settings";
        },
        automationIsActive() {
            return this.broadcast?.break_display === "Automated";
        }
    }
};
</script>

<style scoped>

</style>

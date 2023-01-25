<template>
    <div class="break-display-modal">
        <div v-b-modal.break-display>
            <b-button size="sm" :class="{ active: automationIsActive }" :variant="automationIsActive ? 'primary' : ''">
                <DashboardModalIcon/> {{ autoText }}
            </b-button>
        </div>
        <b-modal ref="modal" id="break-display" title="Break display settings" @show="selectedTab = 'Display'" :hide-footer="selectedTab !== 'Display'">
            <b-form-radio-group class="w-100 mb-3" v-model="selectedTab" :options="tabs" buttons button-variant="outline-primary" />
            <BreakDisplayTab :broadcast="broadcast" v-if="selectedTab === 'Display'"/>
            <BreakAutomationTab :broadcast="broadcast" v-if="selectedTab === 'Automation'" />

            <template v-slot:modal-footer>
                <div v-if="selectedTab === 'Display'" class="w-100 flex-center text-center">
                    These buttons will change the break scene's display instantly.
                </div>
            </template>
        </b-modal>
    </div>
</template>

<script>
import DashboardModalIcon from "@/components/website/dashboard/DashboardModalIcon.vue";
import { BButton, BFormRadioGroup, BModal, VBModal } from "bootstrap-vue";
import BreakDisplayTab from "@/components/website/dashboard/BreakDisplayTab.vue";
import BreakAutomationTab from "@/components/website/dashboard/BreakAutomationTab.vue";

export default {
    name: "BreakDisplayMultiModal",
    components: { BreakAutomationTab, BreakDisplayTab, BFormRadioGroup, BModal, BButton, DashboardModalIcon },
    directives: { BModal: VBModal },
    props: {
        broadcast: Object
    },
    data: () => ({
        selectedTab: "Display",
        tabs: [
            "Display",
            "Automation"
        ]
    }),
    computed: {
        autoText() {
            return this.broadcast?.break_display ? `Display: ${this.broadcast.break_display}` : "Display";
        },
        automationIsActive() {
            return this.broadcast?.break_display === "Automated";
        }
    }
};
</script>

<style scoped>

</style>

<template>
    <div class="break-display-modal">
        <b-button-group class="quick-button">
            <b-button v-b-modal.break-display size="sm" :class="{ active: broadcast?.countdown_end }" :variant="broadcast?.countdown_end ? 'primary' : 'secondary'"
                      @click="selectedTab = 'Countdown'">
                <div class="icon-stack">
                    <i class="fal fa-clock"></i>
                    <i class="fas fa-fw fa-sliders-h top-describer-button"></i>
                    <div class="icon-text">
                        <Countdown :to="broadcast.countdown_end"/>
                    </div>
                </div>
            </b-button>
            <b-button v-b-modal.break-display size="sm" :class="{ active: automationIsActive }" :variant="automationIsActive ? 'primary' : 'secondary'"
                      @click="selectedTab = 'Display'">
                <div class="icon-stack">
                    <i class="fas fa-fw fa-bed"></i>
                    <i class="fas fa-fw fa-sliders-h top-describer-button"></i>
                    <squeezable class="icon-text" align="center">
                        <div>{{ autoText }}</div>
                    </squeezable>
                </div>
            </b-button>
            <b-button v-b-modal.break-display size="sm" @click="selectedTab = 'Text'" :disabled="processing?.title">
                <div class="icon-stack">
                    <i class="fas fa-fw fa-text"></i>
                    <i class="fas fa-fw fa-sliders-h top-describer-button"></i>
                    <squeezable class="icon-text" align="center">
                        <div style="font-size: 0.75em">{{ broadcast?.title }}</div>
                    </squeezable>
                </div>
            </b-button>
            <BDropdown right split class="quick-button no-main-button" size="sm" :disabled="processing?.title">
                <b-dropdown-group header="Quick titles">
                    <b-dropdown-item-button  :disabled="processing?.title" v-for="title in quickTitles" :key="title" @click="setTitle(title)">{{ title }}</b-dropdown-item-button>
                </b-dropdown-group>
            </BDropdown>
        </b-button-group>
        <b-modal ref="modal" id="break-display" title="Break display settings" :hide-footer="selectedTab !== 'Display'">
            <b-form-radio-group class="w-100 mb-3" v-model="selectedTab" :options="tabs" buttons button-variant="outline-primary" />
            <BreakTimeControls :broadcast="broadcast" v-if="selectedTab === 'Countdown'" />
            <BreakTextTab :broadcast="broadcast" v-if="selectedTab === 'Text'" :title-processing="processing?.title" />
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
import Squeezable from "@/components/broadcast/Squeezable.vue";
import { authenticatedRequest } from "@/utils/dashboard";

export default {
    name: "BreakDisplayMultiModal",
    components: { Squeezable, BreakTimeControls, BreakTextTab, BreakAutomationTab, BreakDisplayTab, DashboardModalIcon },
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
        ],
        quickTitles: [
            "Starting Soon",
            "Be Right Back",
            "Thanks for Watching"
        ],
        processing: {

        }
    }),
    computed: {
        autoText() {
            if (this.broadcast?.break_display === "Automated") return "Auto";
            return this.broadcast?.break_display;
        },
        automationIsActive() {
            return this.broadcast?.break_display === "Automated";
        }
    },
    methods: {
        async setTitle(title) {
            this.processing.title = true;
            try {
                const response = await authenticatedRequest("actions/update-broadcast", { title });
                if (!response.error) {
                    this.$notyf.success(`Break title set to ${data.title}`);
                }
            } finally {
                this.processing.title = false;
            }
        }
    }
};
</script>

<style scoped>

</style>

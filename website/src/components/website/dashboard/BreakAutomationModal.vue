<template>
    <div class="break-automation-modal">
        <div v-b-modal.break-automation>
            <b-button size="sm" :class="{ active: automationIsActive }" :variant="automationIsActive ? 'primary' : ''">
                <DashboardModalIcon/> Automation<span v-if="activeRotationOptions"> ({{ activeRotationOptions.length }})</span>
            </b-button>
        </div>

        <b-modal id="break-automation" ref="modal" title="Break Automation" @show="resetOptions(activeOptions)"
                 ok-only ok-title="Save" ok-variant="success" :ok-disabled="processing" @ok.prevent="saveOptions">
            <div class="mb-3">
                <p class="mb-0">Automation is currently <b :class="automationIsActive ? 'text-success' : 'text-danger'">{{ automationIsActive ? 'active' : 'inactive' }}</b>.</p>
                <p class="mb-0" v-if="!automationIsActive && broadcastBreakDisplay">Break display is currently <b>{{ broadcastBreakDisplay }}</b>.</p>
            </div>

            <b-form-group label="Break display rotation options" label-class="font-weight-bold">
                <b-form-checkbox v-for="option in rotationOptions" :key="option.value" :value="option.value" v-model="selectedRotationOptions">
                    <span v-if="option.text === 'Matchup' && matchupText" class="text-muted">
                        {{ option.text }} (Won't show, {{ matchupText }})
                    </span>
                    <span v-else>{{ option.text }}</span>
                </b-form-checkbox>
            </b-form-group>

            <b-form-group label="Ending break display (countdown 30 seconds or lower)" label-class="font-weight-bold">
                <b-form-checkbox v-for="option in endingOptions" :key="option.value" :value="option.value" v-model="selectedEndingOptions">
                    <span v-if="option.text === 'Matchup' && matchupText" class="text-muted">
                        {{ option.text }} (Won't show, {{ matchupText }})
                    </span>
                    <span v-else>{{ option.text }}</span>
                </b-form-checkbox>
            </b-form-group>
        </b-modal>

    </div>
</template>

<script>
import { BButton, BFormCheckbox, BFormGroup, BModal, VBModal } from "bootstrap-vue";
import { updateBreakAutomation } from "@/utils/dashboard";
import DashboardModalIcon from "@/components/website/dashboard/DashboardModalIcon.vue";

export default {
    name: "BreakAutomationModal",
    components: {
        DashboardModalIcon,
        BFormCheckbox,
        BFormGroup,
        BModal,
        BButton
    },
    directives: {
        BModal: VBModal
    },
    props: {
        broadcast: Object
    },
    data: () => ({
        processing: false,
        rotationOptions: [
            { text: "Schedule", value: "use: Schedule" },
            { text: "Standings", value: "use: Standings" },
            { text: "Bracket", value: "use: Bracket" },
            { text: "Matchup", value: "use: Matchup" },
            { text: "Image", value: "use: Image" },
            { text: "Event Staff", value: "use: Staff" },
            { text: "Title", value: "use: Title" },
            { text: "Other Broadcast Matches", value: "use: Other Info" }
        ],
        selectedRotationOptions: [],
        endingOptions: [
            { value: "setting: Always do 30s Matchup", text: "Matchup" },
            { value: "setting: Always do 30s Schedule", text: "Schedule" }
        ],
        selectedEndingOptions: []
    }),
    computed: {
        activeOptions() {
            return this.broadcast?.break_automation || [];
        },
        chosenOptions() {
            return [...this.selectedRotationOptions, ...this.selectedEndingOptions];
        },
        broadcastBreakDisplay() {
            return this.broadcast?.break_display;
        },
        automationIsActive() {
            return this.broadcastBreakDisplay === "Automated";
        },
        matchupText() {
            if (!this.broadcast?.live_match) {
                return "no live match selected";
            }
            if (!this.broadcast?.show_live_match) {
                return "live match isn't showing";
            }
            return null;
        },
        activeRotationOptions() {
            return this.activeOptions.filter(option => this.rotationOptions.find(ro => ro.value === option));
        }
    },
    watch: {
        activeOptions: {
            immediate: true,
            handler(newOptions) {
                this.resetOptions(newOptions);
            }
        },
        selectedEndingOptions(options) {
            if (options.length > 1) {
                this.selectedEndingOptions = [options.pop()];
            }
        }
    },
    methods: {
        async saveOptions() {
            this.processing = true;
            try {
                const response = await updateBreakAutomation(this.$root.auth, this.chosenOptions);
                if (!response.error) {
                    this.$notyf.success("Break automation updated");
                }
            } finally {
                this.processing = false;
                this.$refs.modal.hide();
            }
        },
        resetOptions(options) {
            this.selectedRotationOptions = [];
            this.selectedEndingOptions = [];

            (options || []).forEach((option) => {
                if (this.rotationOptions.find(o => o.value === option)) {
                    this.selectedRotationOptions.push(option);
                } else if (this.endingOptions.find(o => o.value === option)) {
                    this.selectedEndingOptions.push(option);
                }
            });
        }
    }
};
</script>

<style scoped>

</style>

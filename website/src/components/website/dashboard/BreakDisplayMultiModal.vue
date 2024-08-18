<template>
    <div class="break-display-modal">
        <b-button-group class="quick-button">
            <b-button
                v-b-modal.break-display
                size="sm"
                :class="{ active: broadcast?.countdown_end }"
                :variant="broadcast?.countdown_end ? 'primary' : 'secondary'"
                @click="selectedTab = 'Countdown'">
                <div class="icon-stack">
                    <i class="fal fa-clock"></i>
                    <i class="fas fa-fw fa-sliders-h top-describer-button"></i>
                    <div class="icon-text">
                        <Countdown :to="broadcast.countdown_end" />
                    </div>
                </div>
            </b-button>
            <b-button
                v-b-modal.break-display
                size="sm"
                :class="{ active: automationIsActive }"
                :variant="automationIsActive ? 'primary' : 'secondary'"
                @click="selectedTab = 'Display'">
                <div class="icon-stack">
                    <i class="fas fa-fw fa-bed"></i>
                    <i class="fas fa-fw fa-sliders-h top-describer-button"></i>
                    <squeezable class="icon-text" align="center">
                        <div>{{ autoText }}</div>
                    </squeezable>
                </div>
            </b-button>
            <b-button v-b-modal.break-display size="sm" :disabled="processing?.title" @click="selectedTab = 'Text'">
                <div class="icon-stack">
                    <i class="fas fa-fw fa-text"></i>
                    <i class="fas fa-fw fa-sliders-h top-describer-button"></i>
                    <div class="icon-text" style="font-size: 0.3em;">{{ broadcast?.title }}</div>
                </div>
            </b-button>
            <BDropdown
                right
                split
                class="quick-button no-main-button"
                size="sm"
                :disabled="processing?.title">
                <b-dropdown-group header="Quick titles">
                    <b-dropdown-item-button v-for="title in quickTitles" :key="title" :disabled="processing?.title" @click="setTitle(title)">{{ title }}</b-dropdown-item-button>
                </b-dropdown-group>
                <b-dropdown-group header="Presets">
                    <b-dropdown-item-button v-for="preset in presets" :key="preset.title" :disabled="processing?.preset" @click="runPreset(preset)">{{ preset.title }}</b-dropdown-item-button>
                </b-dropdown-group>
            </BDropdown>
        </b-button-group>
        <b-modal id="break-display" ref="modal" title="Break display settings" :hide-footer="selectedTab !== 'Display'">
            <b-form-radio-group
                v-model="selectedTab"
                class="w-100 mb-3"
                :options="tabs"
                buttons
                button-variant="outline-primary" />
            <BreakTimeControls v-if="selectedTab === 'Countdown'" :broadcast="broadcast" />
            <BreakTextTab v-if="selectedTab === 'Text'" :broadcast="broadcast" :title-processing="processing?.title" />
            <BreakDisplayTab v-if="selectedTab === 'Display'" :broadcast="broadcast" />
            <BreakAutomationTab v-if="selectedTab === 'Automation'" :broadcast="broadcast" />

            <template #footer>
                <div v-if="selectedTab === 'Display'" class="w-100 flex-center text-center">
                    These buttons will change the break scene's display instantly.
                </div>
            </template>
        </b-modal>
    </div>
</template>

<script>
import BreakDisplayTab from "@/components/website/dashboard/BreakDisplayTab.vue";
import BreakAutomationTab from "@/components/website/dashboard/BreakAutomationTab.vue";
import BreakTextTab from "@/components/website/dashboard/BreakTextTab.vue";
import BreakTimeControls from "@/components/website/dashboard/BreakTimeControls.vue";
import Squeezable from "@/components/broadcast/Squeezable.vue";
import { authenticatedRequest } from "@/utils/dashboard";

export default {
    name: "BreakDisplayMultiModal",
    components: { Squeezable, BreakTimeControls, BreakTextTab, BreakAutomationTab, BreakDisplayTab },
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
        presets: [
            {
                title: "Start of stream",
                getCommands: (ref) => {
                    console.log(ref);
                    return [
                        ref.setTitle(ref.broadcast?.event?.short || this.broadcast?.event?.name || this.broadcast?.name),
                        ref.setBreakDisplayOption("Automated"),
                    ];
                }
            },
            {
                title: "End of stream",
                getCommands: (ref) => {
                    console.log(ref);
                    return [
                        ref.setTitle("Thanks for watching!"),
                        ref.setBreakDisplayOption("Staff"),
                        ref.setCountdownEnd(null),
                    ];
                }
            }
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
        async runPreset(preset) {
            console.log(preset);
            this.processing.preset = true;
            try {
                await Promise.all(preset.getCommands(this));
            } finally {
                this.processing.preset = false;
            }
        },
        async setTitle(title) {
            this.processing.title = true;
            try {
                const response = await authenticatedRequest("actions/update-broadcast", { title });
                if (!response.error) {
                    this.$notyf.success(`Break title set to ${title}`);
                }
            } finally {
                this.processing.title = false;
            }
        },
        async setBreakDisplayOption(option) {
            this.processing.breakDisplay = true;
            try {
                const response = await authenticatedRequest("actions/update-break-display", {
                    option: option
                });
                if (!response.error) {
                    this.$notyf.success(`Break display set to ${option}`);
                }
            } finally {
                this.processing.breakDisplay = false;
            }
        },
        async setCountdownFromNow(seconds) {
            return await this.setCountdownEnd(Date.now() + (seconds * 1000));
        },
        async setCountdownEnd(date) {
            this.processing = true;
            try {
                await authenticatedRequest("actions/update-broadcast", {
                    countdownEnd: date
                });
            } catch (e) {
                console.error(e);
            } finally {
                this.processing = false;
                this.manualProcessing = false;
            }
        }
    }
};
</script>

<style scoped>

</style>

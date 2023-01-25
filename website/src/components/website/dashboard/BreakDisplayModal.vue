<template>
    <div class="break-display-modal">
        <div v-b-modal.break-display>
            <b-button size="sm" :class="{ active: broadcast && broadcast.break_display }" :variant="broadcast && broadcast.break_display ? 'primary' : ''">
                <DashboardModalIcon/> {{ autoText }}
            </b-button>
        </div>
        <b-modal ref="modal" id="break-display" title="Break display">
            <div class="flex-center">
                <div class="buttons d-inline-flex flex-column">
                    <b-button class="mb-1" v-for="option in options" :key="option.value"
                              @click="setOption(option.value)"
                              :disabled="processing && (selected === option.value)"
                              :class="{ 'active': selected === option.value }"
                              :variant="selected === option.value && !processing ? 'primary' : 'secondary'">
                        {{ option.text }}
                    </b-button>
                </div>
            </div>

            <template v-slot:modal-footer>
                <div class="w-100 flex-center text-center">
                    These buttons will change the break scene's display instantly.<br>
                    Make sure that your show is ready for these graphics to appear.
                </div>
            </template>
        </b-modal>
    </div>
</template>

<script>
import DashboardModalIcon from "@/components/website/dashboard/DashboardModalIcon.vue";
import { BButton, BModal, VBModal } from "bootstrap-vue";
import { updateBreakDisplay } from "@/utils/dashboard";

export default {
    name: "BreakDisplayModal",
    components: { BModal, BButton, DashboardModalIcon },
    directives: { BModal: VBModal },
    props: { broadcast: Object },
    data: () => ({
        options: [
            { value: "Automated", text: "Automated break display" },
            { value: "Schedule", text: "Schedule" },
            { value: "Standings", text: "Standings" },
            { value: "Image", text: "Image" },
            { value: "Bracket", text: "Bracket" },
            { value: "Staff", text: "Event staff" },
            { value: "Matchup", text: "Matchup" },
            { value: "Title", text: "Title" },
            { value: "Other Streams", text: "Other Streams" },
            { value: "Other Info", text: "Other Info" }
        ],
        selected: null,
        processing: false
    }),
    computed: {
        autoText() {
            if (this.broadcast?.break_display === "Automated") return "Display";
            return this.broadcast?.break_display ? `Display: ${this.broadcast.break_display}` : "Display";
        },
        activeOption() {
            return this.broadcast?.break_display;
        }
    },
    watch: {
        activeOption: {
            immediate: true,
            handler(newOption) {
                this.resetOption(newOption);
            }
        },
        selectedEndingOptions(options) {
            if (options.length > 1) {
                this.selectedEndingOptions = [options.pop()];
            }
        }
    },
    methods: {
        async setOption(option) {
            this.selected = option;
            this.processing = true;
            try {
                const response = await updateBreakDisplay(this.$root.auth, this.selected);
                if (!response.error) {
                    this.$notyf.success(`Break display set to ${this.selected}`);
                }
            } finally {
                this.processing = false;
                this.$refs.modal.hide();
            }
        },
        resetOption(option) {
            this.selected = option;
        }
    }
};
</script>

<style scoped>

</style>

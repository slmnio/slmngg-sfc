<template>
    <div class="break-display-tab">
        <div class="flex-center">
            <div class="buttons d-inline-flex flex-column">
                <b-button
                    v-for="option in options"
                    :key="option.value"
                    class="mb-1"
                    :disabled="processing && (selected === option.value)"
                    :class="{ 'active': selected === option.value }"
                    :variant="selected === option.value && !processing ? 'primary' : 'secondary'"
                    @click="setOption(option.value)">
                    {{ option.text }}
                </b-button>
            </div>
        </div>
    </div>
</template>

<script>
import { authenticatedRequest } from "@/utils/dashboard";

export default {
    name: "BreakDisplayTab",
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
            { value: "Other Info", text: "Other Broadcasts" },
            { value: "Other Streams", text: "Other Stream Feeds" }
        ],
        selected: null,
        processing: false
    }),
    computed: {
        activeOption() {
            return this.broadcast?.break_display;
        }
    },
    methods: {
        async setOption(option) {
            this.selected = option;
            this.processing = true;
            try {
                const response = await authenticatedRequest("actions/update-break-display", {
                    option: this.selected
                });
                if (!response.error) {
                    this.$notyf.success(`Break display set to ${this.selected}`);
                }
            } finally {
                this.processing = false;
            }
        },
        resetOption(option) {
            this.selected = option;
        }
    },
    watch: {
        activeOption: {
            immediate: true,
            handler(newOption) {
                this.resetOption(newOption);
            }
        },
        selectedEndingOptions: {
            deep: true,
            handler(options) {
                if (options.length > 1) {
                    this.selectedEndingOptions = [options.pop()];
                }
            }
        }
    }
};
</script>

<style scoped>

</style>

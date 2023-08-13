<template>
    <div class="break-display-tab">
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
    </div>
</template>

<script>
import { BButton } from "bootstrap-vue";
import { updateBreakDisplay } from "@/utils/dashboard";

export default {
    name: "BreakDisplayTab",
    components: { BButton },
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

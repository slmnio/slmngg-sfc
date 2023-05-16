<template>
    <div class="desk-text-editor p-2">
        <div class="d-flex gap-2">
            <b-form-input class="opacity-changes disabled-low-opacity" :disabled="chosenDisplayOption?.hasText === false"
                          @keydown.ctrl.enter="saveData({mode: 'show'})"
                          type="text" v-model="deskTextPrefix" placeholder="Text prefix"/>
            <b-form-input class="opacity-changes disabled-low-opacity" :disabled="chosenDisplayOption?.hasText === false"
                          @keydown.ctrl.enter="saveData({mode: 'show'})"
                          type="text" v-model="deskText" placeholder="Desk text"/>
            <b-form-select class="w-auto" :options="displayOptions" v-model="chosenDisplayOption"></b-form-select>
            <b-button @click="saveData({ mode: 'show'})" class="flex-shrink-0" :disabled="processing" :variant="dataDeskMode ? 'primary' : 'secondary'"><i class="fas fa-fw fa-eye"></i> Show</b-button>
            <b-button @click="saveData({ mode: 'hide'})" class="flex-shrink-0" :disabled="processing" :variant="dataDeskMode ? 'secondary' : 'primary'"><i class="fas fa-eye-slash"></i> Hide</b-button>
        </div>
    </div>
</template>

<script>
import { BButton, BFormInput, BFormSelect } from "bootstrap-vue";
import { updateBroadcastData } from "@/utils/dashboard";

export default {
    name: "DeskTextEditor",
    components: {
        BFormSelect,
        BFormInput,
        BButton
    },
    props: {
        broadcast: {}
    },
    data: () => ({
        processing: false,
        deskTextPrefix: null,
        deskText: null,
        chosenDisplayOption: null,
        displayOptions: [
            {
                text: "Match (default)",
                value: {
                    hasText: false,
                    text: "Match"
                }
            },
            {
                text: "Predictions",
                value: {
                    hasText: false,
                    text: "Predictions"
                }
            },
            {
                text: "Maps",
                value: {
                    hasText: false,
                    text: "Maps"
                }
            },
            {
                text: "Text (Event)",
                value: {
                    hasText: true,
                    text: "Notice (Event)"
                }
            },
            {
                text: "Text (Team 1)",
                value: {
                    hasText: true,
                    text: "Notice (Team 1)"
                }
            },
            {
                text: "Text (Team 2)",
                value: {
                    hasText: true,
                    text: "Notice (Team 2)"
                }
            }
        ]
    }),
    methods: {
        async saveData({ mode }) {
            if (this.processing) return;
            this.processing = true;

            const data = {
                deskDisplayText: this.combinedDeskText
            };

            if (mode === "hide") {
                data.deskDisplayMode = null;
            } else if (mode === "show") {
                if (!this.chosenDisplayOption?.text) {
                    return this.$notyf.error("You must choose a display mode");
                }
                data.deskDisplayMode = this.chosenDisplayOption?.text;
            }

            try {
                const response = await updateBroadcastData(this.$root.auth, data);
                if (!response.error) {
                    this.$notyf.success("Updated desk display");
                }
            } finally {
                this.processing = false;
            }
        }
    },
    computed: {
        dataDeskText() {
            return this.broadcast?.notice_text;
        },
        dataDeskMode() {
            const display = this.broadcast?.desk_display;
            return display === "Match" ? null : display;
        },
        combinedDeskText() {
            return [
                this.deskTextPrefix,
                this.deskText
            ].filter(Boolean).join("|");
        }
    },
    watch: {
        dataDeskText: {
            immediate: true,
            handler(text) {
                const parts = (text || "").split("|");
                if (parts.length >= 2) {
                    this.deskTextPrefix = parts.shift();
                    this.deskText = parts.pop();
                } else {
                    this.deskText = text;
                }
            }
        },
        dataDeskMode: {
            immediate: true,
            handler(mode) {
                if (mode) {
                    this.chosenDisplayOption = this.displayOptions.find(opt => opt.value?.text === mode)?.value;
                } else {
                    this.chosenDisplayOption = this.displayOptions.find(opt => opt.value?.text === "Match")?.value;
                }
            }
        }
    }
};
</script>

<style scoped>

.opacity-changes {
    opacity: 1;
    transition: opacity .3s ease;
}
.low-opacity, [disabled].disabled-low-opacity {
    opacity: 0.5;
    pointer-events: none;
    user-select: none;
    cursor: wait;
}
</style>

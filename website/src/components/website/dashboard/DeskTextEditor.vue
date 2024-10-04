<template>
    <div class="desk-text-editor p-2 gap-3 d-flex flex-column">
        <div class="d-flex gap-2">
            <b-button class="flex-shrink-0" :disabled="processing || chosenDisplayOption?.hasText === false" @click="autoSetPrefixText()">Team scores</b-button>
            <b-form-input
                v-model="deskTextPrefix"
                class="opacity-changes disabled-low-opacity"
                :disabled="chosenDisplayOption?.hasText === false"
                type="text"
                placeholder="Text prefix"
                @keydown.ctrl.enter="saveData({mode: 'show'})" />
            <b-form-input
                v-model="deskText"
                class="opacity-changes disabled-low-opacity"
                :disabled="chosenDisplayOption?.hasText === false"
                type="text"
                placeholder="Desk text"
                @keydown.ctrl.enter="saveData({mode: 'show'})" />
            <b-form-select v-model="chosenDisplayOption" class="w-auto" :options="displayOptions" />
            <b-button class="flex-shrink-0" :disabled="processing" :variant="!dataDeskMode ? 'primary' : 'secondary'" @click="saveData({ mode: 'show'})"><i class="fas fa-fw fa-eye"></i> Show</b-button>
            <b-button class="flex-shrink-0" :disabled="processing" :variant="!dataDeskMode ? 'secondary' : 'primary'" @click="saveData({ mode: 'hide'})"><i class="fas fa-eye-slash"></i> Hide</b-button>
        </div>
        <div class="d-flex gap-2 align-items-center justify-content-center flex-wrap">
            <b-button
                v-for="option in noTextDisplayOptions"
                :key="option?.text"
                :disabled="processing"
                :variant="(broadcast?.desk_display === option?.value?.text) ? 'primary' : 'secondary'"
                @click="chosenDisplayOption = option?.value; saveData({ mode: 'show' })">
                {{ option?.text }}
            </b-button>
        </div>
    </div>
</template>

<script>
import { authenticatedRequest } from "@/utils/dashboard";

export default {
    name: "DeskTextEditor",
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
                text: "Scoreboard",
                value: {
                    hasText: false,
                    text: "Scoreboard"
                }
            },
            {
                text: "Scoreboard Bans",
                value: {
                    hasText: false,
                    text: "Scoreboard Bans"
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
                text: "Drafted Maps",
                value: {
                    hasText: false,
                    text: "Drafted Maps"
                }
            },
            {
                text: "Interview",
                value: {
                    hasText: false,
                    text: "Interview"
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
            },
            {
                text: "Hidden",
                value: {
                    hasText: false,
                    text: "Hidden"
                }
            },
            {
                text: "Casters",
                value: {
                    hasText: false,
                    text: "Casters"
                }
            }
        ]
    }),
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
        },
        noTextDisplayOptions() {
            return this.displayOptions.filter(option => !option?.value?.hasText);
        }
    },
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
                const response = await authenticatedRequest("actions/update-broadcast", data);
                if (!response.error) {
                    this.$notyf.success("Updated desk display");
                }
            } finally {
                this.processing = false;
            }
        },
        autoSetPrefixText() {
            console.log(this.broadcast?.match);
            this.deskTextPrefix = this.broadcast?.live_match?.teams.map((t, i) => {
                let text = [
                    t.name,
                    this.broadcast?.live_match[`score_${i + 1}`]
                ];
                console.log(text);
                if (i === 1) text = text.reverse();
                return text.join(" ");
            }).join("-");
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

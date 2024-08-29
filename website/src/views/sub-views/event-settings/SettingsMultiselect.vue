<template>
    <div class="settings-multiselect d-flex flex-column gap-1">
        <div class="selected d-flex flex-wrap gap-1">
            <div
                v-for="selection in hydratedSelection"
                :key="selection"
                class="badge pill bg-primary"
                :style="selection.style"
                @click="remove(selection)">
                {{ selection.text }}
                <i class="fas fa-times fa-fw"></i>
            </div>
            <div v-if="!hydratedSelection.length" class="badge pill bg-secondary">Nothing selected</div>
        </div>
        <div class="bottom d-flex gap-1">
            <b-button :size="size" variant="secondary" @click="sortAlpha = !sortAlpha">
                <i v-if="sortAlpha" class="fas fa-sort-alpha-down fa-fw"></i>
                <i v-else class="fas fa-sort-amount-down-alt fa-fw"></i>
            </b-button>
            <b-form-select v-model="formSelectSelected" :size="size" placeholder="Choose role" :options="optionsWithNull" />
            <b-button :size="size" variant="success" :disabled="!formSelectSelected" @click="() => select(formSelectSelected)"><i class="fas fa-plus fa-fw"></i></b-button>
        </div>
    </div>
</template>

<script>
import { sortAlpha } from "@/utils/sorts";

export default {
    name: "SettingsMultiselect",
    props: {
        options: Array,
        modelValue: Array,
        placeholder: String,
        size: String
    },
    emits: [
        "update:modelValue"
    ],
    data: () => ({
        selected: [],
        formSelectSelected: null,
        sortAlpha: false
    }),
    computed: {
        sortedOptions() {
            if (this.sortAlpha) {
                return [...this.options].sort((a,b) => sortAlpha(a, b, "text"));
            } else {
                return this.options;
            }
        },
        optionsWithNull() {
            return [
                {
                    value: null,
                    text: this.placeholder ?? "Choose from dropdown",
                    disabled: true
                },
                ...(this.sortedOptions || [])
            ];
        },
        hydratedSelection() {
            return this.selected.map(val => this.options.find(opt => opt.value === val));
        }
    },
    methods: {
        select(val) {
            console.log(this.selected, val);
            if (!this.selected.includes(val)) {
                this.selected.push(val);
            }
            this.formSelectSelected = null;
        },
        remove(val) {
            this.selected.splice(this.selected.indexOf(val), 1);
        }
    },
    watch: {
        selected: {
            deep: true,
            handler(opts) {
                this.$emit("update:modelValue", opts);
            }
        },
        modelValue: {
            deep: true,
            immediate: true,
            handler(opts) {
                this.selected = opts ?? [];
            }
        }
    }
};
</script>

<style scoped>
    .badge {
        cursor: pointer;
    }
    .badge:hover {
        opacity: 0.9;
    }
</style>

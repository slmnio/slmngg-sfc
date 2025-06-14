<template>
    <div class="theme-eye-dropper d-flex gap-1 flex-center">
        <div class="title mr-2">{{ title }}</div>
        <b-button :disabled="!isSupported" size="sm" class="eye-dropper-button flex-center" @click="open">
            <i class="fas fa-eye-dropper fa-fw" style="font-weight: 100 !important;"></i>
        </b-button>
        <input v-model="model" type="color" class="color-input">
        <input
            v-model="model"
            :style="{ backgroundColor: model, color: calculateContrastHex(model, '#FFFFFF') < 5 ? '#000000': '#ffffff' }"
            class="hex rounded px-2 flex-center"
            type="text"
            contenteditable="true"
            :placeholder="title"
            :always-show-icon="true">
        <CopyTextButton class="copy" :content="copyHex" always-show-icon="true" />
    </div>
</template>

<script setup lang="ts">
import { useEyeDropper } from "@vueuse/core";
import { watch, computed } from "vue";
import { storeToRefs } from "pinia";
import { calculateContrastHex } from "@/utils/content-utils";
import CopyTextButton from "@/components/website/CopyTextButton.vue";
import { useSettingsStore } from "@/stores/settingsStore.js";

const model = defineModel();
const props = defineProps(["title"]);

const { isSupported, open, sRGBHex } = useEyeDropper();

console.log(sRGBHex);
watch(sRGBHex, (val) => {
    console.log("val", val, model, model.value);
    model.value = val;
});

const {removeHashInHex} = storeToRefs(useSettingsStore());

const copyHex = computed(() => {
    console.log(model.value, removeHashInHex.value);
    if (removeHashInHex.value) return model.value.replace("#", "");
    return model.value;
});
</script>

<style scoped>
    .hex {
        vertical-align: middle;
        border: none;
        width: 100px;
    }
    .copy:deep(> span) {
        margin-right: -0.25em;
    }
    .title {
        font-weight: bold;
        text-transform: uppercase;
    }
    .copy {
        height: 1.5em;
        margin-right: 1.25em;
    }
    input.color-input {
        width: 2em;
        border-radius: .25em;
        height: 1.625em;
        border: 1px solid white;
    }
    .eye-dropper-button {
        height: 1.8575em;
        width: 2em;
    }
</style>

<template>
    <b-button v-b-modal.liqui-modal size="sm">
        <i class="far fa-horse-head"></i>
    </b-button>
    <BModal
        id="liqui-modal"
        size="lg"
        title="Liquipedia Data"
        ok-variant="success">
        <textarea :value="data" class="w-100 bg-dark text-light" rows="9"></textarea>
        <template #footer="{close}">
            <div class="d-flex gap-2">
                <copy-text-button class="btn btn-primary copy-text flex-center ps-3 gap-1" :content="data" :always-show-icon="true">Copy</copy-text-button>
                <b-button variant="secondary" @click="close()">Dismiss</b-button>
            </div>
        </template>
    </BModal>
</template>

<script lang="ts">
import CopyTextButton from "@/components/website/CopyTextButton.vue";

export default {
    name: "LiquipediaModal",
    components: {CopyTextButton},
    props: ["data"],
};
</script>

<style scoped>
    .copy-text {

    }
    .copy-text, .copy-text:deep(*) {
        display: flex;
        position: relative;
        top: auto;
    }
</style>

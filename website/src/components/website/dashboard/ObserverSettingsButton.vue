<template>
    <b-button
        :class="{'active': isOn}"
        :variant="isOn ? 'primary' : 'secondary'"
        :disabled="processing"
        @click="() => setObserverSetting(setting, !isOn)">
        {{ setting }}
    </b-button>
</template>

<script>
import { authenticatedRequest } from "@/utils/dashboard";

export default {
    name: "ObserverSettingsButton",
    props: {
        setting: String,
        isOn: Boolean
    },
    data: () => ({
        processing: false
    }),
    methods: {
        async setObserverSetting(setting, value) {
            this.processing = true;
            try {
                await authenticatedRequest("actions/set-observer-setting", {
                    setting,
                    value
                });
            } finally {
                this.processing = false;
            }
        }
    }
};
</script>

<style scoped>

</style>

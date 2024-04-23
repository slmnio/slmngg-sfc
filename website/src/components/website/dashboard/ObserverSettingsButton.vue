<template>
    <b-button @click="() => setObserverSetting(setting, !isOn)" :class="{'active': isOn}"
              :variant="isOn ? 'primary' : 'secondary'" :disabled="processing">
        {{ setting }}
    </b-button>
</template>

<script>
import { setObserverSetting } from "@/utils/dashboard";

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
                await setObserverSetting(this.$root.auth, setting, value);
            } finally {
                this.processing = false;
            }
        }
    }
};
</script>

<style scoped>

</style>

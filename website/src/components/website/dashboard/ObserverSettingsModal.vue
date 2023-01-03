<template>
    <div class="observer-settings-modal">
        <div v-b-modal.observer-settings >
            <b-button size="sm" :variant="hasSettingOn ? 'primary' : 'secondary'" :class="{'active': hasSettingOn}">{{ autoText }}</b-button>
        </div>

        <b-modal ref="observer-settings" id="observer-settings" title="Observer Settings">
            <ObserverSettingsButton  v-for="setting in settings" :key="setting" :setting="setting" :is-on="settingIsOn(setting)" />
            <template v-slot:modal-footer>
                <div class="w-100 flex-center text-center">
                    These settings will change instantly once you click them.<br>
                    Make sure that your show is ready for these graphics to appear.
                </div>
            </template>
        </b-modal>
    </div>
</template>

<script>
import { BButton, BModal, VBModal } from "bootstrap-vue";
import ObserverSettingsButton from "@/components/website/dashboard/ObserverSettingsButton.vue";

export default {
    name: "ObserverSettingsModal",
    props: {
        broadcast: Object
    },
    components: {
        ObserverSettingsButton,
        BModal,
        BButton
    },
    directives: {
        BModal: VBModal
    },
    data: () => ({
        settings: [
            "Show syncer",
            "Show overlay"
        ]
    }),
    computed: {
        autoText() {
            const settings = this.broadcast?.observer_settings || [];
            if (!settings.length) {
                return "All off";
            }
            const on = [];
            if (settings.includes("Show overlay")) on.push("overlay");
            if (settings.includes("Show syncer")) on.push("syncer");
            if (on[0]) on[0] = on[0].slice(0, 1).toUpperCase() + on[0].slice(1);
            return `${on.join(" & ")} on`;
        },
        hasSettingOn() {
            return !!this.broadcast?.observer_settings?.length;
        }
    },
    methods: {
        settingIsOn(setting) {
            return (this.broadcast?.observer_settings || []).includes(setting);
        }
    }
};
</script>

<style scoped>

</style>

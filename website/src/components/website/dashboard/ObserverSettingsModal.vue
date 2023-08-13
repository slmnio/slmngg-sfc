<template>
    <div class="observer-settings-modal">
        <div v-b-modal.observer-settings >
            <b-button size="sm" :variant="hasSettingOn ? 'primary' : 'secondary'" :class="{'active': hasSettingOn}"><DashboardModalIcon/> {{ autoText }}</b-button>
        </div>
        <b-modal ref="observer-settings" id="observer-settings" title="Observer Settings">
            <div class="w-100 flex-center">
                <div class="d-inline-flex flex-column">
                    <ObserverSettingsButton class="mb-2" v-for="setting in settings" :key="setting" :setting="setting"
                                            :is-on="settingIsOn(setting)"/>
                </div>
            </div>
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
import DashboardModalIcon from "@/components/website/dashboard/DashboardModalIcon.vue";

export default {
    name: "ObserverSettingsModal",
    props: {
        broadcast: Object
    },
    components: {
        DashboardModalIcon,
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
            "Show overlay",
            "Use basic overlay"
        ]
    }),
    computed: {
        liveSettings() {
            return this.broadcast?.observer_settings || [];
        },
        autoText() {
            if (!this.settingsGroups.disruptive.length) {
                return "All off";
            }
            const on = [];
            if (this.liveSettings.includes("Show overlay")) on.push(this.liveSettings.includes("Use basic overlay") ? "basic overlay" : "overlay");
            if (this.liveSettings.includes("Show syncer")) on.push("syncer");
            if (on[0]) on[0] = on[0].slice(0, 1).toUpperCase() + on[0].slice(1);
            return `${on.join(" & ")} on`;
        },
        settingsGroups() {
            const disruptive = ["Show overlay", "Show syncer"];
            const options = ["Use basic overlay"];
            return { disruptive: disruptive.filter(key => this.liveSettings.includes(key)), options: options.filter(key => this.liveSettings.includes(key)) };
        },
        hasSettingOn() {
            return !!this.settingsGroups.disruptive?.length;
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

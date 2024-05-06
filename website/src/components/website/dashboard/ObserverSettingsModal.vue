<template>
    <div class="observer-settings-modal">
        <div v-b-modal.observer-settings>
            <b-button class="quick-button" :variant="hasSettingOn ? 'primary' : 'secondary'">
                <div class="icon-stack">
                    <i class="fas fa-eye"></i>
                    <i class="fas fa-fw fa-sliders-h top-describer-button"></i>
                    <div class="icon-text" :style="{ fontSize: autoText.includes('&') ? '0.4em' : ''}">{{ autoText }}</div>
                </div>
            </b-button>
        </div>
        <b-modal ref="observer-settings" id="observer-settings" title="Observer Settings">
            <div class="w-100 flex-center">
                <div class="d-inline-flex flex-column">
                    <ObserverSettingsButton class="mb-2" v-for="setting in settings" :key="setting" :setting="setting"
                                            :is-on="settingIsOn(setting)"/>
                </div>
            </div>
            <template #footer>
                <div class="w-100 flex-center text-center">
                    These settings will change instantly once you click them.<br>
                    Make sure that your show is ready for these graphics to appear.
                </div>
            </template>
        </b-modal>
    </div>
</template>

<script>
import ObserverSettingsButton from "@/components/website/dashboard/ObserverSettingsButton.vue";

export default {
    name: "ObserverSettingsModal",
    props: {
        broadcast: Object
    },
    components: {
        ObserverSettingsButton
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
            return `${on.join(" & ")}`;
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

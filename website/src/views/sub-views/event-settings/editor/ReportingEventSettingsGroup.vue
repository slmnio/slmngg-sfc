<template>
    <EventSettingsGroup title="Reporting">
        <div class="py-2">
            <event-settings-checkbox
                :active="reportingData?.score?.use"
                @update:active="val => updateData('score', 'use', val)">
                Allow map score reporting
            </event-settings-checkbox>
            <event-settings-checkbox
                :active="reportingData?.score?.opponentApprove"
                @update:active="val => updateData('score', 'opponentApprove', val)">
                Opponents must approve
            </event-settings-checkbox>
            <event-settings-checkbox
                :active="reportingData?.score?.staffApprove"
                @update:active="val => updateData('score', 'staffApprove', val)">
                Staff must approve
            </event-settings-checkbox>
        </div>
    </EventSettingsGroup>
</template>

<script>


import EventSettingsGroup from "@/views/sub-views/event-settings/editor/EventSettingsGroup.vue";
import EventSettingsCheckbox from "@/views/sub-views/event-settings/editor/EventSettingsCheckbox.vue";

export default {
    name: "ReportingEventSettingsGroup",
    components: { EventSettingsCheckbox, EventSettingsGroup },
    props: {
        modelValue: Object,
        event: Object,
        allSettings: Object
    },
    emits: ["update:modelValue"],
    data: () => ({
        reportingData: {},
    }),
    methods: {
        updateData(group, field, value) {
            if (this.reportingData[group]) {
                this.reportingData[group][field] = value;
            } else {
                this.reportingData[group] = {
                    [field]: value
                };
            }
        }
    },
    watch: {
        modelValue: {
            immediate: true,
            deep: true,
            handler(data) {
                if (JSON.stringify(data) === JSON.stringify(this.reportingData)) return;
                this.reportingData = data || {
                    attributes: {},
                    score: {}
                };

            }
        },
        reportingData: {
            immediate: true,
            deep: true,
            handler(data) {
                this.$emit("update:modelValue", {
                    ...data,
                });
            }
        }
    }
};
</script>

<style scoped>

</style>

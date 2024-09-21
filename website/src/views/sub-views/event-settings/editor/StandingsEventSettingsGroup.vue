<template>
    <EventSettingsGroup
        class="w-100"
        title="Standings"
        always-active>
        <div class="d-flex flex-column gap-2 py-1">
            <StandingsSubEditor v-for="(standing, i) in standingsData" :key="i" v-model="standingsData[i]" :event="event">
                <b-button
                    variant="primary"
                    size="sm"
                    :disabled="i === 0"
                    @click="() => [standingsData[i-1], standingsData[i]] = [standingsData[i], standingsData[i-1]]">
                    <i class="fas fa-chevron-up"></i>
                </b-button>
                <b-button
                    variant="primary"
                    size="sm"
                    :disabled="standingsData.length - 1 === i"
                    @click="() => [standingsData[i], standingsData[i+1]] = [standingsData[i + 1], standingsData[i]]">
                    <i class="fas fa-chevron-down"></i>
                </b-button>
                <b-button
                    variant="danger"
                    size="sm"
                    @click="() => standingsData.splice(i, 1)">
                    <i class="fas fa-minus fa-fw"></i> Remove
                </b-button>
            </StandingsSubEditor>

            <div class="d-flex justify-content-end mt-1">
                <b-button
                    variant="success"
                    size="sm"
                    @click="() => standingsData.push({show:[],sort:[]})">
                    <i class="fas fa-plus fa-fw"></i> New standings group
                </b-button>
            </div>
        </div>
    </EventSettingsGroup>
</template>

<script>
import EventSettingsGroup from "@/views/sub-views/event-settings/editor/EventSettingsGroup.vue";
import StandingsSubEditor from "@/views/sub-views/event-settings/editor/StandingsSubEditor.vue";

export default {
    name: "StandingsEventSettingsGroup",
    components: {
        StandingsSubEditor,
        EventSettingsGroup
    },
    props: {
        modelValue: Array,
        event: Object,
        allSettings: Object
    },
    emits: ["update:modelValue"],
    data: () => ({
        standingsData: [],
        groupCount: 0,
        calculateData: []
    }),
    methods: {
        updateData(field, value) {
            if (this.standingsData) {
                this.standingsData[field] = value;
            } else {
                this.standingsData = {
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
                if (JSON.stringify(data) === JSON.stringify(this.standingsData)) return;
                this.standingsData = data || [];

            }
        },
        standingsData: {
            immediate: true,
            deep: true,
            handler(data) {
                this.$emit("update:modelValue", data);
            }
        }
    }
};
</script>

<style scoped>

</style>

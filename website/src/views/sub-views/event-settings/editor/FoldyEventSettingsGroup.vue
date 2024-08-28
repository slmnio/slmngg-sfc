<template>
    <EventSettingsGroup
        class="w-100"
        title="Foldy">
        <div class="d-flex flex-column gap-2 py-2">
            <event-settings-checkbox
                :active="foldyData?.use"
                @update:active="val => updateData('use', val)">
                Use foldy sheet
            </event-settings-checkbox>
            <b-form-group
                v-if="foldyData.groups"
                label="Groups"
                description=""
                label-cols="2"
                content-cols="10"
            >
                <div class="d-flex flex-column gap-1">
                    <div
                        v-for="i in foldyData?.groups?.length || 0"
                        :key="i"
                        class="d-flex gap-1">
                        <div
                            class="text-nowrap match-count flex-center bg-primary px-2"
                            :class="{'bg-danger': countMatches(foldyData.groups[i - 1]) === 0}">
                            {{ countMatches(foldyData.groups[i - 1]) }} matches
                        </div>
                        <b-form-input v-model="foldyData.groups[i - 1]" size="sm" />
                        <b-button
                            variant="danger"
                            size="sm"
                            @click="() => foldyData.groups.splice(i - 1, 1)">
                            <i class="fas fa-minus"></i>
                        </b-button>
                    </div>
                </div>
                <div class="d-flex justify-content-end mt-1">
                    <b-button
                        variant="success"
                        size="sm"
                        @click="() => foldyData.groups.push('')">
                        <i class="fas fa-plus fa-fw"></i> New group
                    </b-button>
                </div>
            </b-form-group>

            <b-form-group
                v-if="foldyData.calculate && calculateData"
                label="Calculate"
                label-cols="2"
                content-cols="10">
                <div class="d-flex flex-column gap-1">
                    <div
                        v-for="i in foldyData?.calculate?.length"
                        :key="i"
                        class="d-flex gap-1">
                        <b-form-radio-group v-model="calculateData[i-1].direction" :options="['top', 'bottom']" buttons size="sm" />
                        <b-form-input v-model="calculateData[i-1].count" number size="sm" />
                        <b-button
                            variant="danger"
                            size="sm"
                            @click="() => calculateData.splice(i - 1, 1)">
                            <i class="fas fa-minus"></i>
                        </b-button>
                    </div>
                </div>
                <div class="d-flex justify-content-end mt-1">
                    <b-button
                        variant="success"
                        size="sm"
                        @click="() => calculateData.push({ direction: 'top', count: 1})">
                        <i class="fas fa-plus fa-fw"></i> New calculation line
                    </b-button>
                </div>
            </b-form-group>
        </div>
    </EventSettingsGroup>
</template>

<script>
import EventSettingsGroup from "@/views/sub-views/event-settings/editor/EventSettingsGroup.vue";
import EventSettingsCheckbox from "@/views/sub-views/event-settings/editor/EventSettingsCheckbox.vue";

export default {
    name: "FoldyEventSettingsGroup",
    components: {
        EventSettingsCheckbox,
        EventSettingsGroup
    },
    props: {
        modelValue: Object,
        event: Object,
        allSettings: Object
    },
    emits: ["update:modelValue"],
    data: () => ({
        foldyData: {},
        calculateData: []
    }),
    methods: {
        updateData(field, value) {
            if (this.foldyData) {
                this.foldyData[field] = value;
            } else {
                this.foldyData = {
                    [field]: value
                };
            }
        },
        countMatches(matchGroup) {
            if (!matchGroup) return 0;
            const setting = (this.allSettings?.standings || [])?.find(standing => standing.group === matchGroup);
            return (this.event?.matches || []).filter(m => m?.match_group === matchGroup || (setting?.groups || [])?.includes(m?.match_group))?.length;
        }
    },
    watch: {
        modelValue: {
            immediate: true,
            deep: true,
            handler(data) {
                if (JSON.stringify(data) === JSON.stringify(this.foldyData)) return;
                this.foldyData = data || {};

                if (!this.foldyData?.calculate) {
                    this.foldyData.calculate = [];
                }

                this.calculateData = this.foldyData.calculate.map(obj => ({
                    direction: Object.keys(obj)?.[0],
                    count: Object.values(obj)?.[0]
                }));

                if (!this.foldyData?.groups) {
                    this.foldyData.groups = [];
                }
            }
        },
        foldyData: {
            immediate: true,
            deep: true,
            handler(data) {
                this.$emit("update:modelValue", {
                    ...data,
                });
            }
        },
        calculateData: {
            immediate: true,
            deep: true,
            handler(data) {
                this.foldyData.calculate = data.map(({ direction, count}) => ({
                    [direction]: count
                }));
            }
        }
    }
};
</script>

<style scoped>
    .match-count {
        min-width: 6em;

    }
</style>

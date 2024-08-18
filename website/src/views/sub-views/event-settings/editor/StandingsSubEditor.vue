<template>
    <div class="standings-sub-editor dark-border d-flex flex-column gap-1">
        <div class="title fw-bold bb-dark px-2 py-1 d-flex justify-content-between align-items-center">
            <div>{{ internalData.group || "New standings" }}</div>
            <div class="d-flex gap-1"><slot></slot></div>
        </div>
        <div class="p-1">
            <b-form-group
                content-cols="9"
                label-cols="3"
                label="Multi group">
                <b-form-checkbox v-model="multiGroup" />
            </b-form-group>
            <b-form-group
                class="fg"
                label="Match group"
                content-cols="9"
                label-cols="3"
                :description="multiGroup ? 'Identifying name for the multi group.' : 'Internal name that must match the Match Group listed on a match.'">
                <div class="d-flex gap-1 w-100">
                    <div
                        v-if="!multiGroup"
                        class="text-nowrap match-count flex-center bg-primary px-2"
                        :class="{'bg-danger': countMatches(internalData.group) === 0}">
                        {{ countMatches(internalData.group) }} matches
                    </div>
                    <b-form-input v-model="internalData.group" class="w-100 flex-grow-1" size="sm" />
                </div>
                <div v-if="multiGroup" class="d-flex flex-column gap-1 mt-1 w-100">
                    <div
                        v-for="(groupText, i) in internalData.groups"
                        :key="i"
                        class="d-flex gap-1">
                        <div
                            class="text-nowrap match-count flex-center bg-primary px-2"
                            :class="{'bg-danger': countMatches(groupText) === 0}">
                            {{ countMatches(groupText) }} matches
                        </div>
                        <b-form-input v-model="internalData.groups[i]" size="sm" />
                        <b-button
                            variant="danger"
                            size="sm"
                            @click="() => internalData.groups.splice(i, 1)">
                            <i class="fas fa-minus"></i>
                        </b-button>
                    </div>
                    <div class="d-flex justify-content-end mt-1">
                        <b-button
                            variant="success"
                            size="sm"
                            @click="() => internalData.groups.push('')">
                            <i class="fas fa-plus fa-fw"></i> New group
                        </b-button>
                    </div>
                </div>
            </b-form-group>
            <b-form-group
                label="Key"
                content-cols="9"
                label-cols="3"
                description="Lower case key for targeting with some overlays.">
                <b-form-input
                    v-model="internalData.key"
                    size="sm"
                    :formatter="(v) => v.toLowerCase().trim().replaceAll(' ', '-')" />
            </b-form-group>
            <b-form-group
                label="Show"
                content-cols="9"
                label-cols="3">
                <div class="d-flex flex-column gap-1 mt-1 w-100">
                    <div v-for="(showText, i) in internalData.show" :key="i" class="d-flex gap-1 w-100">
                        <b-form-select v-model="internalData.show[i]" size="sm" :options="showKeys" />
                        <b-button
                            variant="danger"
                            size="sm"
                            @click="() => internalData.show.splice(i, 1)">
                            <i class="fas fa-minus"></i>
                        </b-button>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-1">
                        <small>Columns to show on standings for this group.</small>
                        <b-button
                            variant="success"
                            size="sm"
                            @click="() => internalData.show.push('')">
                            <i class="fas fa-plus fa-fw"></i> New show
                        </b-button>
                    </div>
                </div>
            </b-form-group>
            <b-form-group
                label="Sort"
                content-cols="9"
                label-cols="3">
                <div class="d-flex flex-column gap-1 mt-1 w-100">
                    <div v-for="(sortText, i) in internalData.sort" :key="i" class="d-flex gap-1 w-100">
                        <b-form-select v-model="internalData.sort[i]" size="sm" :options="sortKeys" />
                        <b-button
                            variant="danger"
                            size="sm"
                            @click="() => internalData.sort.splice(i, 1)">
                            <i class="fas fa-minus"></i>
                        </b-button>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-1">
                        <small>How to sort the standings for this group.</small>
                        <b-button
                            variant="success"
                            size="sm"
                            @click="() => internalData.sort.push('')">
                            <i class="fas fa-plus fa-fw"></i> New sort
                        </b-button>
                    </div>
                </div>
            </b-form-group>
        </div>
    </div>
</template>

<script>
import { StandingsShowKeys, StandingsSortKeys } from "@/utils/standings";

export default {
    name: "StandingsSubEditor",
    props: {
        modelValue: Object,
        event: Object
    },
    emits: ["update:modelValue"],
    data: () => ({
        internalData: {},
        multiGroup: false
    }),
    computed: {
        showKeys() {
            return Object.entries(StandingsShowKeys(this.event?.game)).map(([key, data]) => ({
                text: `${key} - ${data.title}`,
                value: key
            }));
        },
        sortKeys() {
            return Object.entries(StandingsSortKeys()).map(([key, data]) => ({
                text: `${key} - ${data.description}`,
                value: key
            }));
        }
    },
    methods: {
        countMatches(matchGroup) {
            if (!matchGroup) return 0;
            return (this.event?.matches || []).filter(m => m?.match_group === matchGroup)?.length;
        }
    },
    watch: {
        modelValue: {
            immediate: true,
            deep: true,
            handler(data) {
                if (JSON.stringify(data) === JSON.stringify(this.internalData)) return;
                this.internalData = data || [];

                this.multiGroup = ((this.internalData?.groups || [])?.length) > 0;
            }
        },
        internalData: {
            immediate: true,
            deep: true,
            handler(data) {
                this.$emit("update:modelValue", data);
            }
        },
        // multiGroup: {
        //     immediate: true,
        //     handler(isMulti) {
        //         if (isMulti) {
        //             this.internalData = {
        //                 ...this.internalData,
        //                 groups: undefined
        //             };
        //         } else {
        //             this.internalData = {
        //                 ...this.internalData,
        //                 groups: this.internalData.groups || []
        //             };
        //         }
        //     }
        // }
    },
};
</script>

<style scoped>
    .standings-sub-editor:deep(.row > .col-3),
    .standings-sub-editor:deep(.row > .col-9) {
        padding: 2px 18px;
        display: flex;
        align-items: flex-start;
        justify-content: flex-start;
        flex-direction: column;
    }
    .standings-sub-editor:deep(.row > .col-3) {
        padding-top: 4px;
    }
    .standings-sub-editor:deep(small) {
        margin-top: 0;
    }
    .match-count {
        min-width: 6em;
    }
    .bb-dark {
        border-bottom: 1px solid #454d55;
    }

</style>

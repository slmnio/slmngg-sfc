<template>
    <div class="event-settings-general">
        <div class="d-flex">
            <div class="w-50">
                <div @click="syncBlocks()">out of sync? {{ outOfSync }}</div>
                <pre>{{ editableBlocks }}</pre>
            </div>
            <div v-if="editableBlocks" class="w-50 d-flex flex-column gap-2">
                <FoldyEventSettingsGroup v-model="editableBlocks.foldy" :event="event" :all-settings="editableBlocks" />
                <StandingsEventSettingsGroup v-model="editableBlocks.standings" :event="event" :all-settings="editableBlocks" />
                <AuctionEventSettingsGroup v-model="editableBlocks.auction" :event="event" :all-settings="editableBlocks" />
                <EventSettingsGroup title="Composition">
                    <div class="d-flex flex-column gap-2 py-2">
                        <event-settings-checkbox
                            :active="editableBlocks?.composition?.use"
                            @update:active="val => updateData('composition', 'use', val)">
                            Use composition
                        </event-settings-checkbox>
                        <event-settings-checkbox
                            :active="editableBlocks?.composition?.useCalculator"
                            @update:active="val => updateData('composition', 'useCalculator', val)">
                            Show link to calculator
                        </event-settings-checkbox>
                        <b-form-group
                            label="Text"
                            description="Show a link to the auction on the event page."
                            label-cols="2"
                            content-cols="10">
                            <b-form-textarea :model-value="editableBlocks?.composition?.text" size="sm" @update:model-value="(val) => updateData('composition', 'text', val)" />
                        </b-form-group>
                    </div>
                </EventSettingsGroup>
            </div>
        </div>
    </div>
</template>

<script>
import FoldyEventSettingsGroup from "@/views/sub-views/event-settings/editor/FoldyEventSettingsGroup.vue";
import AuctionEventSettingsGroup from "@/views/sub-views/event-settings/editor/AuctionEventSettingsGroup.vue";
import StandingsEventSettingsGroup from "@/views/sub-views/event-settings/editor/StandingsEventSettingsGroup.vue";
import EventSettingsGroup from "@/views/sub-views/event-settings/editor/EventSettingsGroup.vue";
import EventSettingsCheckbox from "@/views/sub-views/event-settings/editor/EventSettingsCheckbox.vue";

export default {
    name: "EventSettingsGeneral",
    components: { EventSettingsCheckbox, EventSettingsGroup, StandingsEventSettingsGroup, AuctionEventSettingsGroup, FoldyEventSettingsGroup },
    props: {
        event: {}
    },
    data: () => ({
        editableBlocks: null,
        outOfSync: false,
    }),
    computed: {
        blocks() {
            if (!this.event?.blocks) return null;
            try {
                const blocks = JSON.parse(this.event.blocks);
                return blocks || null;
            } catch (e) {
                return null;
            }
        }
    },
    methods: {
        updateData(group, field, value) {
            if (this.editableBlocks[group]) {
                this.editableBlocks[group][field] = value;
            } else {
                this.editableBlocks[group] = {
                    [field]: value
                };
            }
        },
        syncBlocks() {
            this.editableBlocks = structuredClone(this.blocks);
        }
    },
    watch: {
        blocks: {
            immediate: true,
            deep: true,
            handler(newData, oldData) {
                if (!oldData) {
                    this.editableBlocks = structuredClone(newData) || {};
                    return;
                }
                if (JSON.stringify(newData) !== JSON.stringify(oldData)) {
                    this.outOfSync = true;
                }
            }
        },
        editableBlocks: {
            immediate: true,
            deep: true,
            handler(newData) {
                this.outOfSync = (JSON.stringify(newData) !== JSON.stringify(this.blocks));
            }
        }
    },
};
</script>

<style scoped>

</style>

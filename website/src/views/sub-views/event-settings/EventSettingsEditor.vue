<template>
    <div class="event-settings-general d-flex flex-column gap-2">
        <div class="border-secondary border p-2 rounded d-flex justify-content-between align-items-center">
            <div class="d-flex flex-center gap-2">
                <b-button variant="secondary" :disabled="!outOfSync" @click="syncBlocks"><i class="fas fa-redo fa-fw"></i> Reset</b-button>
                <div v-if="outOfSync">
                    <i class="fas fa-exclamation fa-fw"></i> Out of sync with server
                </div>
                <div v-else class="ml-2">
                    <i class="fas fa-check fa-fw"></i> In sync with server
                </div>
            </div>
            <b-button variant="success" :disabled="processing" @click="() => saveToEvent()"><i class="fas fa-save fa-fw"></i> Save to event</b-button>
        </div>
        <div class="d-flex gap-2 main-content flex-column flex-md-row">
            <div class="d-flex flex-column gap-2 w-100 w-md-33">
                <div>Event settings JSON</div>
                <textarea rows="20" :value="JSON.stringify(editableBlocks, null, 2)" class="bg-dark text-white font-monospace p-2 rounded" @input="e => jsonEdit(e.target.value)"></textarea>
            </div>
            <div v-if="editableBlocks" class="w-md-67 w-100 d-flex flex-column gap-2 opacity-changes" :class="{'low-opacity': processing}">
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
                            Show link to SLMN.io calculator
                        </event-settings-checkbox>
                        <b-form-group
                            label="CTA Text"
                            description="Text for the call-to-action button on composition pages"
                            label-cols="2"
                            content-cols="10">
                            <b-form-textarea :model-value="editableBlocks?.composition?.ctaText" size="sm" @update:model-value="(val) => updateData('composition', 'ctaText', val)" />
                        </b-form-group>
                        <b-form-group
                            label="CTA Link"
                            description="Link for the call-to-action button"
                            label-cols="2"
                            content-cols="10">
                            <b-form-textarea :model-value="editableBlocks?.composition?.ctaLink" size="sm" @update:model-value="(val) => updateData('composition', 'ctaLink', val)" />
                        </b-form-group>
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
import { authenticatedRequest } from "@/utils/dashboard";

export default {
    name: "EventSettingsGeneral",
    components: { EventSettingsCheckbox, EventSettingsGroup, StandingsEventSettingsGroup, AuctionEventSettingsGroup, FoldyEventSettingsGroup },
    props: {
        event: {}
    },
    data: () => ({
        editableBlocks: null,
        outOfSync: false,
        processing: false
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
        },
        jsonEdit(data) {
            console.log(data);
            try {
                const jsonData = JSON.parse(data);
                this.editableBlocks = structuredClone(jsonData);
            } catch (e) {
                console.warn("Edited JSON data is not valid");
            }
        },
        async saveToEvent() {
            try {
                this.processing = true;
                const response = await authenticatedRequest("actions/set-event-settings", {
                    eventID: this.event?.id,
                    settings: JSON.stringify(this.editableBlocks)
                });
                if (response.error) return;
                this.$notyf.success("Saved event settings");
            } catch (e) {
                console.error(e);
            } finally {
                this.processing = false;
            }
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

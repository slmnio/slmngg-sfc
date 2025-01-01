<template>
    <div class="date-editor">
        <div class="date-editor-button">
            <b-button v-b-modal.date-editor-modal :disabled="isProcessing" class="py-2 px-3">
                <LoadingIcon v-if="isProcessing" />
                <i v-else class="fas fa-fw fa-calendar-alt"></i>
                <span v-if="$slots.default?.()" class="ml-1"><slot></slot></span>
            </b-button>
        </div>

        <b-modal id="date-editor-modal" :ok-disabled="isValid === false" @ok="$emit('submit', airtableSafeDate)">
            <template #modal-title>Time editor</template>

            <div class="d-flex mb-3 flex-center">
                <TimezoneSwapper align="left" />
            </div>
            <b-form-checkbox v-model="editTimeInSiteTimezone" class="mb-3" switch name="use-site-timezone">
                Use site timezone to edit?
            </b-form-checkbox>
            <b-form-input
                class="mb-2"
                name="datetime-editor"
                type="datetime-local"
                :model-value="temporaryTime || safeSavedTime"
                @update:model-value="(val) => temporaryTime = val" />

            <div class="earliest-latest-warning py-2 flex-center text-center my-2 border border-primary rounded" :class="{'bg-danger text-white': isValid === false}">
                <div v-if="earliestTime && !latestTime">
                    This match must start at or after <b>{{ formatTime(earliestTime) }}</b>
                </div>
                <div v-else-if="!earliestTime && latestTime">
                    This match must start at or before <b>{{ formatTime(latestTime) }}</b>
                </div>
                <div v-else-if="earliestTime && latestTime">
                    This match must start between <b>{{ formatTime(earliestTime) }}</b> and<br><b>{{ formatTime(latestTime) }}</b>
                </div>
            </div>

            <div v-if="earliestTime || latestTime" class="earliest-latest-buttons flex-center mb-2">
                <div v-if="earliestTime" class="left flex-shrink-0">
                    <b-button variant="primary" size="sm" @click="temporaryTime = safeTime(earliestTime)"><i class="fas fa-arrow-to-left fa-fw mr-1"></i> Set to earliest</b-button>
                </div>
                <div class="flex-grow-1"></div>
                <div v-if="latestTime" class="right flex-shrink-0">
                    <b-button variant="primary" size="sm" @click="temporaryTime = safeTime(latestTime)">Set to latest <i class="fas fa-arrow-to-right fa-fw ml-1"></i></b-button>
                </div>
            </div>

            <div class="text-center mb-2">Editing in <b>{{ editTimeInSiteTimezone ? 'the site' : 'your local' }} timezone</b> ({{ timezoneName }})</div>
            <div class="flex-center text-center timezones">
                <div class="group">
                    <div class="top fw-bold" :class="{'text-muted': editTimeInSiteTimezone}">Local timezone</div>
                    <div class="bottom">{{ localTimezone }}</div>
                    <div class="bottom">{{ formatTime(spaceTimeRef.toLocalDate(), { tz: localTimezone, use24HourTime: $store.state.use24HourTime }) }}</div>
                </div>
                <div class="group ml-3">
                    <div class="top fw-bold" :class="{'text-muted': !editTimeInSiteTimezone}">Site timezone</div>
                    <div class="bottom">{{ siteTimezone }}</div>
                    <div class="bottom">{{ formatTime(spaceTimeRef.toLocalDate(), { tz: siteTimezone, use24HourTime: $store.state.use24HourTime }) }}</div>
                </div>
            </div>
        </b-modal>
    </div>
</template>

<script>
import { formatTime, getAbbrev, getTimezone } from "@/utils/content-utils";
import spacetime from "spacetime";
import TimezoneSwapper from "@/components/website/schedule/TimezoneSwapper.vue";
import LoadingIcon from "@/components/website/LoadingIcon.vue";
import { useSettingsStore } from "@/stores/settingsStore";
import { mapWritableState } from "pinia";

const SafeTimeFormat = "{year}-{iso-month}-{date-pad}T{hour-24-pad}:{minute-pad}:{second-pad}";

export default {
    name: "AdvancedDateEditor",
    components: {
        LoadingIcon,
        TimezoneSwapper
    },
    props: ["savedTime", "isProcessing", "earliestTime", "latestTime"],
    emits: ["submit"],
    data: () => ({
        temporaryTime: null
    }),
    computed: {
        ...mapWritableState(useSettingsStore, ["editTimeInSiteTimezone"]),
        safeSavedTime() {
            if (!this.savedTime || typeof this.savedTime !== "string") return null;
            let ref = spacetime(this.savedTime.replace("Z", ""), "UTC");
            ref = ref.goto(this.editTimeInSiteTimezone ? this.siteTimezone : this.localTimezone);
            return ref.format(SafeTimeFormat);
        },
        spaceTimeRef() {
            const ref = spacetime(this.temporaryTime || this.safeSavedTime, this.editTimeInSiteTimezone ? this.siteTimezone : this.localTimezone);
            // console.log("ref", ref.tz, this.editTimeInSiteTimezone ? this.siteTimezone : this.localTimezone);
            return ref;
        },
        siteTimezone() {
            return getTimezone(useSettingsStore().timezone || "local");
        },
        localTimezone() {
            return getTimezone("local");
        },
        timezoneName() {
            if (this.editTimeInSiteTimezone) {
                return getAbbrev(this.siteTimezone, this.spaceTimeRef);
            } else {
                return getAbbrev("local", this.spaceTimeRef);
            }
        },
        airtableSafeDate() {
            return this.spaceTimeRef.toLocalDate().toISOString();
        },
        isValid() {
            if (!this.temporaryTime) return null;
            let numTime = spacetime(this.temporaryTime, this.editTimeInSiteTimezone ? this.siteTimezone : this.localTimezone).epoch;
            if (this.earliestTime) {
                let earliestEpoch = spacetime(this.earliestTime).epoch;
                if (numTime < earliestEpoch) return false;
            }
            if (this.latestTime) {
                let latestEpoch = spacetime(this.latestTime).epoch;
                if (numTime > latestEpoch) return false;
            }
            return true;
        }
    },
    methods: {
        formatTime, spacetime,
        safeTime(timeString) {
            if (!timeString || typeof timeString !== "string") return null;
            return this.formatTime(
                timeString,
                {
                    tz: this.editTimeInSiteTimezone ? this.siteTimezone : this.localTimezone,
                    format: SafeTimeFormat,
                    use24HourTime: this.$store.state.use24HourTime }
            );
        }
    }
};
</script>

<style>
    #date-editor-modal .modal-dialog {
        max-width: min(100vw, 600px);
    }
</style>
<style scoped>
    .timezones {
        justify-content: space-evenly;
    }
</style>

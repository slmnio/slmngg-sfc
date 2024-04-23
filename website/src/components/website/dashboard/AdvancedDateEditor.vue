<template>
    <div class="date-editor">
        <div class="date-editor-button">
            <b-button v-b-modal.date-editor-modal :disabled="isProcessing">
                <LoadingIcon v-if="isProcessing" />
                <i v-else class="fas fa-fw fa-calendar-alt"></i>
                <span v-if="$slots.default" class="ml-1"><slot></slot></span>
            </b-button>
        </div>

        <b-modal id="date-editor-modal" @ok="$emit('submit', airtableSafeDate)">
            <template v-slot:modal-title>Time editor</template>

            <div class="d-flex mb-3 flex-center">
                <TimezoneSwapper align="left"></TimezoneSwapper>
            </div>
            <b-form-checkbox class="mb-3" switch v-model="useSiteTimezone" name="use-site-timezone">
                Use site timezone to edit?
            </b-form-checkbox>
            <b-form-input class="mb-2" name="datetime-editor" type="datetime-local" :value="temporaryTime || safeSavedTime" @change="(val) => temporaryTime = val"></b-form-input>

            <div class="text-center mb-2">Editing in <b>{{ useSiteTimezone ? 'the site' : 'your local' }} timezone</b> ({{ timezoneName }})</div>
            <div class="flex-center text-center timezones">
                <div class="group">
                    <div class="top font-weight-bold" :class="{'text-muted': useSiteTimezone}">Local timezone</div>
                    <div class="bottom">{{ localTimezone }}</div>
                    <div class="bottom">{{ formatTime(spaceTimeRef.toLocalDate(), { tz: localTimezone, use24HourTime: $store.state.use24HourTime }) }}</div>
                </div>
                <div class="group ml-3">
                    <div class="top font-weight-bold" :class="{'text-muted': !useSiteTimezone}">Site timezone</div>
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

export default {
    name: "AdvancedDateEditor",
    components: {
        LoadingIcon,
        TimezoneSwapper
    },
    props: ["savedTime", "isProcessing"],
    data: () => ({
        temporaryTime: null
    }),
    computed: {
        useSiteTimezone: {
            get() {
                return this.$store.getters.editTimeInSiteTimezone;
            },
            set(value) {
                this.$store.commit("setTimeEditTimezone", value);
            }
        },
        safeSavedTime() {
            if (!this.savedTime || typeof this.savedTime !== "string") return null;
            let ref = spacetime(this.savedTime.replace("Z", ""), "UTC");
            ref = ref.goto(this.useSiteTimezone ? this.siteTimezone : this.localTimezone);
            return ref.format("{year}-{iso-month}-{date-pad}T{hour-24-pad}:{minute-pad}:{second-pad}");
        },
        spaceTimeRef() {
            const ref = spacetime(this.temporaryTime || this.safeSavedTime, this.useSiteTimezone ? this.siteTimezone : this.localTimezone); ;
            // console.log("ref", ref.tz, this.useSiteTimezone ? this.siteTimezone : this.localTimezone);
            return ref;
        },
        siteTimezone() {
            return getTimezone(this.$store.state.timezone || "local");
        },
        localTimezone() {
            return getTimezone("local");
        },
        timezoneName() {
            if (this.useSiteTimezone) {
                return getAbbrev(this.siteTimezone, this.spaceTimeRef);
            } else {
                return getAbbrev("local", this.spaceTimeRef);
            }
        },
        airtableSafeDate() {
            return this.spaceTimeRef.toLocalDate().toISOString();
        }
    },
    methods: {
        formatTime
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

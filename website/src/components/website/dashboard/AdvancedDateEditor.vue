<template>
    <div class="date-editor">
        <div class="date-editor-button">
            <b-button v-b-modal.date-editor-modal :disabled="isProcessing">
                <LoadingIcon v-if="isProcessing" />
                <i v-else class="fas fa-fw fa-calendar-alt"></i>
            </b-button>
        </div>

        <b-modal id="date-editor-modal" @ok="$emit('submit', airtableSafeDate)">
            <template v-slot:modal-title>Time editor</template>

            <div class="d-flex mb-3 flex-center">
                <div class="spacer  text-right mr-2">
                    Site timezone
                </div>
                <TimezoneSwapper align="left"></TimezoneSwapper>
            </div>

            <b-form-checkbox class="mb-2" switch v-model="useSiteTimezone" name="use-site-timezone">
                Edit time in {{ useSiteTimezone ? 'the site' : 'your local' }} timezone ({{ timezoneName }})
            </b-form-checkbox>
            <b-form-input class="mb-2" name="datetime-editor" type="datetime-local" :value="temporaryTime || safeSavedTime" @change="(val) => temporaryTime = val"></b-form-input>
            <div class="flex-center text-center timezones">
                <div class="group">
                    <div class="top font-weight-bold" :class="{'text-muted': useSiteTimezone}">Local timezone</div>
                    <div class="bottom">{{ localTimezone }}</div>
                    <div class="bottom">{{ formatTime(spaceTimeRef.toLocalDate(), localTimezone) }}</div>
                </div>
                <div class="group ml-3">
                    <div class="top font-weight-bold" :class="{'text-muted': !useSiteTimezone}">Site timezone</div>
                    <div class="bottom">{{ siteTimezone }}</div>
                    <div class="bottom">{{ formatTime(spaceTimeRef.toLocalDate(), siteTimezone) }}</div>
                </div>
            </div>
        </b-modal>
    </div>
</template>

<script>
import { BButton, BFormCheckbox, BFormInput, BModal, VBModal } from "bootstrap-vue";
import { formatTime, getAbbrev, getTimezone } from "@/utils/content-utils";
import spacetime from "spacetime";
import TimezoneSwapper from "@/components/website/schedule/TimezoneSwapper.vue";
import LoadingIcon from "@/components/website/LoadingIcon.vue";

export default {
    name: "AdvancedDateEditor",
    components: {
        LoadingIcon,
        TimezoneSwapper,
        BButton,
        BModal,
        BFormInput,
        BFormCheckbox
    },
    directives: {
        BModal: VBModal
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

<style scoped>
    #date-editor-modal >>> .modal-dialog {
        max-width: min(100vw, 600px);
    }

    .timezones {
        justify-content: space-evenly;
    }
</style>

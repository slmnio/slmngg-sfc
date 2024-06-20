<template>
    <div class="timezone-swapper" :class="{'align-left': align === 'left'}">
        <b-form :inline="inline">
            <b-form-group label-size="sm" label="Timezone" :label-cols-sm="inline ? 3 : 12">
                <b-form-select id="available-timezone-select" v-model="timezone" :options="availableTimezones" size="sm" />
            </b-form-group>
            <b-form-checkbox v-if="!inline" v-model="use24HourTime" size="sm" switch>
                Use 24-hour time
            </b-form-checkbox>
        </b-form>
    </div>
</template>

<script>
import spacetime from "spacetime";
import informal from "spacetime-informal";
import { useSettingsStore } from "@/stores/settingsStore";
import { mapWritableState } from "pinia";

function getAbbrev(timezone) {
    const display = informal.display(timezone);
    return spacetime.now(timezone).isDST() ? display.daylight.abbrev : display.standard.abbrev;
}

function getLocation(timezone) {
    return timezone.split("/")[1].replace(/_/g, " ");
}

function getOffset(timezone) {
    return spacetime.now(timezone).offset();
}

export default {
    name: "TimezoneSwapper",
    props: ["align", "inline"],
    computed: {
        ...mapWritableState(useSettingsStore, ["timezone", "use24HourTime"]),
        availableTimezones() {
            const timezones = ["America/New_York", "America/Los_Angeles", "Europe/London", "Europe/Berlin"];

            const options = timezones
                .map(tz => ({
                    text: `${getAbbrev(tz)} (${getLocation(tz)})`,
                    value: tz,
                    offset: getOffset(tz)
                }))
                .sort((a, b) => a.offset - b.offset);
            options.unshift({ text: `Your local time (${this.localTimezoneCode})`, value: "local" });
            return options;
        },
        localTimezoneCode() {
            return getAbbrev(spacetime.now().timezone().name);
            // return getAbbrev();
        }
    }
};
</script>

<style scoped>
.timezone-swapper:not(.align-left) select,
.timezone-swapper:not(.align-left) fieldset {
    text-align-last: right;
}


.timezone-swapper:not(.align-left) option {
    direction: rtl;
}

.timezone-swapper:not(.align-left) .form-group {
    margin-bottom: 0;
}
</style>

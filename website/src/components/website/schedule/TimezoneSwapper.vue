<template>
    <div class="timezone-swapper" :class="{'align-left': align === 'left'}">
        <select id="timezone" v-model="siteTimezone">
            <option value="local">Your local time ({{ localTimezoneCode }})</option>
            <option v-for="tz in availableTimezones" :value="tz.value" v-bind:key="tz.value">{{ tz.text }}</option>
        </select>
    </div>
</template>

<script>
import spacetime from "spacetime";
import informal from "spacetime-informal";

function getAbbrev(timezone) {
    const display = informal.display(timezone);
    return spacetime.now().isDST() ? display.daylight.abbrev : display.standard.abbrev;
}
function getLocation(timezone) {
    return timezone.split("/")[1].replace(/_/g, " ");
}
function getOffset(timezone) {
    return spacetime.now(timezone).offset();
}

export default {
    name: "TimezoneSwapper",
    props: ["align"],
    computed: {
        siteTimezone: {
            set(tz) {
                this.$store.commit("setTimezone", tz);
            },
            get() {
                return this.$store.state.timezone || "local";
            }
        },
        availableTimezones() {
            const timezones = ["America/New_York", "America/Los_Angeles", "Europe/London", "Europe/Paris"];

            return timezones.map(tz => ({
                text: `${getAbbrev(tz)} (${getLocation(tz)})`,
                value: tz,
                offset: getOffset(tz)
            })).sort((a, b) => a.offset - b.offset);
        },
        localTimezoneCode() {
            return getAbbrev(spacetime.now().timezone().name);
            // return getAbbrev();
        }
    }
};
</script>

<style scoped>
    .timezone-swapper:not(.align-left) select {
        text-align-last: right;
    }
    .timezone-swapper:not(.align-left) option {
        direction: rtl;
    }
</style>

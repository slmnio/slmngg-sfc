<template>
    <div class="timezone-swapper">
        <select id="timezone" v-model="siteTimezone">
            <option value="local">Your local time</option>
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
    computed: {
        siteTimezone: {
            set(tz) {
                this.$store.commit("setTimezone", tz);
            },
            get() {
                return this.$store.state.timezone;
            }
        },
        availableTimezones() {
            const timezones = ["America/New_York", "America/Los_Angeles", "Europe/London", "Europe/Paris"];

            return timezones.map(tz => ({
                text: `${getAbbrev(tz)} (${getLocation(tz)})`,
                value: tz,
                offset: getOffset(tz)
            })).sort((a, b) => a.offset - b.offset);
        }
    }
};
</script>

<style scoped>
    select {
        text-align-last: right;
    }
    option {
        direction: rtl;
    }
</style>

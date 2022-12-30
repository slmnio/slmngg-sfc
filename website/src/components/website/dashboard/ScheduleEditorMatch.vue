<template>
    <tr class="schedule-editor-match">
        <td>
            <router-link :to="url('detailed', match)">{{ match.name }}</router-link>
        </td>
        <td>{{ prettyDate }}</td>
        <td>
            <div class="btn-group">
                <b-form-checkbox :checked="match.show_on_overlays" @change="(state) => setShow('primary', state)"
                                 button size="sm" :button-variant="match.show_on_overlays ? 'primary' : ''">Primary</b-form-checkbox>
                <b-form-checkbox :checked="match.show_on_secondary_overlays" @change="(state) => setShow('secondary', state)"
                                 button size="sm" :button-variant="match.show_on_secondary_overlays ? 'primary' : ''">Secondary</b-form-checkbox>
            </div>
        </td>
        <td>
            <b-form-checkbox :checked="this.isLiveMatch" @change="(state) => setLiveMatch(state)"
                             button size="sm" :button-variant="this.isLiveMatch ? 'primary' : ''">
                Live Match
            </b-form-checkbox>
        </td>
    </tr>
</template>

<script>
import { formatTime, url } from "@/utils/content-utils";
import { BFormCheckbox } from "bootstrap-vue";
import { setMatchOverlayState, updateBroadcastData } from "@/utils/dashboard";

export default {
    name: "ScheduleEditorMatch",
    props: ["match", "isLiveMatch", "timezone"],
    components: {
        BFormCheckbox
    },
    computed: {
        prettyDate() {
            if (!this.match.start) return;
            return formatTime(this.match.start, this.timezone || this.$store.state.timezone, "{day-short} {date-ordinal} {month-short} - {time} {tz}");
        }
    },
    methods: {
        url,
        async setLiveMatch(state) {
            await updateBroadcastData(this.$root.auth, {
                match: state ? this.match.id : null
            });
        },
        async setShow(overlayType, state) {
            await setMatchOverlayState(this.$root.auth, this.match.id, overlayType, state);
        }
    }
};
</script>

<style scoped>
    .btn-group >>> .btn-group-toggle:not(:first-child) .btn {
        margin-left: -1px
    }

    .btn-group >>> .btn-group-toggle:not(:last-child):not(.dropdown-toggle) .btn {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0
    }

    .btn-group >>> .btn-group-toggle:not(:first-child) .btn {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0
    }
</style>

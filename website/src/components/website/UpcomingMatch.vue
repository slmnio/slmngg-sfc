<template>
    <router-link :to="url('match', match)" class="match no-link-style col-4 col-md-3 col-lg-2">
        <MatchThumbnail :match="match" />
        <div class="match-context match-small mt-2 d-flex flex-column">
            <div v-if="name" class="match-name">{{ name }}</div>
            <div class="match-context-text">{{ getMatchContext(match, { light: true }) }}</div>
        </div>
        <div class="match-time match-small">{{ date }}</div>
    </router-link>
</template>

<script>
import MatchThumbnail from "@/components/website/match/MatchThumbnail";
import { formatTime, getMatchContext, url } from "@/utils/content-utils";
import { useSettingsStore } from "@/stores/settingsStore";

export default {
    name: "UpcomingMatch",
    components: { MatchThumbnail },
    props: ["match"],
    computed: {
        date() {
            if (!this.match.start) return null;
            return formatTime(this.match.start, {
                format: "{day-short} {date-ordinal} {month-short} {time} {tz}",
                tz: useSettingsStore().timezone,
                use24HourTime: useSettingsStore().use24HourTime
            });
        },
        name() {
            if (this.match?.special_event && this.match?.custom_name) return this.match.custom_name;
            if (this.match?.teams?.length) return [this.match?.teams?.[0] || { "name": "TBD" }, this.match?.teams?.[1] || { "name": "TBD" }].map(t => t?.name).join(" vs ");
            return "";
        }
    },
    methods: {
        getMatchContext, url,
    }
};
</script>

<style scoped>
    .match-small {
        font-size: 0.9em;
        line-height: 1.2;
        text-align: center;
    }
    .match {
        padding-left: 5px !important;
        padding-right: 5px !important;
        font-weight: 400;
    }
    .match-context {
        gap: .1em;
    }
    .match-name {
        font-weight: bold;
    }
</style>

<template>
    <router-link :to="url('match', match)" class="match no-link-style col-4 col-md-3 col-lg-2">
        <MatchThumbnail :match="match"></MatchThumbnail>
        <div class="match-context match-small mt-2">{{ match.name }}<br>{{ getMatchContext(match) }}</div>
        <div class="match-time match-small">{{ date }}</div>
    </router-link>
</template>

<script>
import MatchThumbnail from "@/components/website/match/MatchThumbnail";
import { formatTime, getMatchContext, url } from "@/utils/content-utils";

export default {
    name: "UpcomingMatch",
    props: ["match"],
    components: { MatchThumbnail },
    computed: {
        date() {
            if (!this.match.start) return null;
            return formatTime(this.match.start, {
                format: "{day-short} {date-ordinal} {month-short} {time} {tz}",
                tz: this.$store.state.timezone,
                use24HourTime: this.$store.state.use24HourTime
            });
        }
    },
    methods: {
        getMatchContext, url
    }
};
</script>

<style scoped>
    .match-small {
        font-size: 0.9em;
        line-height: 1.2;
        font-weight: bold;
        text-align: center;
    }
    .match {
        padding-left: 5px !important;
        padding-right: 5px !important;
    }
</style>

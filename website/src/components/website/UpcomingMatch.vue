<template>
    <router-link :to="url('match', match)" class="match no-link-style col-4 col-md-3 col-lg-2">
        <MatchThumbnail :match="match"></MatchThumbnail>
        <div class="match-context match-small mt-2">{{ match.name }}<br>{{ getMatchContext(match) }}</div>
        <div class="match-time match-small">{{ date }} {{ time }}</div>
    </router-link>
</template>

<script>
import MatchThumbnail from "@/components/website/match/MatchThumbnail";
import { getMatchContext, url } from "@/utils/content-utils";
import store from "@/thing-store";
import spacetime from "spacetime";
import informal from "spacetime-informal";
export default {
    name: "UpcomingMatch",
    props: ["match"],
    components: { MatchThumbnail },
    computed: {
        date() {
            if (!this.match.start) return null;
            return this._time.format("{day-short} {date-ordinal} {month-short}");
        },
        time() {
            if (!this.match.start) return null;
            const display = informal.display(this.activeTimezone);
            const abbrev = this._time.isDST() ? display.daylight.abbrev : display.standard.abbrev;

            return this._time.format("{time}") + " " + abbrev;
        },
        _time() {
            const utc = spacetime(this.match.start);
            return utc.goto(this.activeTimezone);
        },
        activeTimezone() {
            const stz = store.state.timezone;
            if (!stz || stz === "local") return spacetime.now().timezone().name;
            return stz;
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

<template>
    <div class="team-season-history d-flex flex-column w-100">
        <div class="team-top text-center w-100 my-3" :style="theme">
            <div class="industry-align">{{ team.name }}</div>
        </div>
        <div class="team-history w-100 d-flex">
            <SeasonHistoryMatch class="match" v-for="match in matches" v-bind:key="match.id"
                                :match="match" :home-team="team" :live-match="liveMatch" :timezone="timezone" />
        </div>
    </div>
</template>

<script>
import SeasonHistoryMatch from "@/components/broadcast/SeasonHistoryMatch";
import { themeBackground1 } from "@/utils/theme-styles";
import { sortMatches } from "@/utils/sorts";
export default {
    name: "TeamSeasonHistory",
    components: { SeasonHistoryMatch },
    props: ["team", "liveMatch", "timezone"],
    computed: {
        matches() {
            return (this.team?.matches || []).sort(sortMatches);
        },
        theme() {
            return themeBackground1(this.team);
        }
    }
};
</script>

<style scoped>
    .team-season-history {
        font-size: 2em;
        font-weight: bold;
    }
    .team-top {
        font-size: 1.5em;

    }

    .match {
        margin: 0 0.25em;
        flex-grow: 1;
        width: 0;
    }
    .match:first-of-type {
        margin-left: 0;
    }
    .match:last-of-type {
        margin-right: 0;
    }
</style>

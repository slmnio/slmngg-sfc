<template>
    <div class="team-match-history w-100" :style="{fontSize: this.fontSize + 'px'}">
        <MatchHistory
            v-for="match in matches"
            :key="match.id"
            class="match"
            :match="match"
            :show-sub-event="showSubEvent"
            :this-team="team" />
    </div>
</template>

<script>
import MatchHistory from "@/components/broadcast/MatchHistory";
import { sortMatches } from "@/utils/sorts";

export default {
    name: "TeamMatchHistory",
    components: {
        MatchHistory
    },
    props: ["team", "match", "max", "reverse"],
    computed: {
        matches() {
            if (!this.team?.matches) return [];
            let matches = (this.team.matches || [])
                .filter(m => {
                    if (!m.event) return false;
                    if (this.match.week && m.week && this.match.week < m.week) return false; // no future matches?
                    if (m.id === this.match.id) return ([m.score_1, m.score_2].includes(m.first_to));
                    return true;
                })
                .sort(sortMatches); // in date order

            if (this.reverse) {
                matches = matches.reverse();
            }

            return matches.slice(0, this.max);
        },
        showSubEvent() {
            if (!this.matches?.length) return [];
            const subEvents = new Set();
            for (const match of this.matches) {
                subEvents.add(match.sub_event);
            }
            return subEvents.size > 1;
        },
        fontSize() {
            const max = this.matches?.length || 5;
            if (max <= 5) return 48;
            const perRow = 90 + 12;
            const containerSize = 530;
            return 48 * (containerSize / (perRow * max));
        }
    }
};
</script>

<style scoped>
.team-match-history {
    justify-content: flex-start;
    overflow: hidden;
}
</style>

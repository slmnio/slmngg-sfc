<template>
    <div class="team-match-history">
        <MatchHistory class="match" v-for="match in matches" :key="match.id" :match="match" :this-team="team" />
    </div>
</template>

<script>
import MatchHistory from "@/components/broadcast/MatchHistory";
import { sortMatches } from "@/utils/sorts";

export default {
    name: "TeamMatchHistory",
    props: ["team", "match", "max"],
    components: {
        MatchHistory
    },
    computed: {
        matches() {
            if (!this.team?.matches) return [];
            return (this.team.matches || [])
                .filter(m => {
                    if (!m.event) return false;
                    if (this.match.week && m.week && this.match.week < m.week) return false; // no future matches?
                    if (m.id === this.match.id) return ([m.score_1, m.score_2].includes(m.first_to));
                    return true;
                })
                .sort(sortMatches) // in date order
                .reverse() // reverse date order
                .slice(0, this.max);
        }
    }
};
</script>

<style scoped>

.team-match-history {
    justify-content: flex-start;
    padding: 0.15em 0;
    overflow: hidden;
}
</style>

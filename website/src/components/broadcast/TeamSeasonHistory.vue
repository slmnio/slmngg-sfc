<template>
    <div class="team-season-history d-flex flex-column w-100">
        <div class="team-top text-center w-100 my-3" :style="theme">
            <div class="industry-align">{{ team.name }}</div>
        </div>
        <div v-if="showHeaders && !groupedMatches?.allMatches" class="team-history w-100 d-flex">
            <div class="group">
                <div class="group-title">Previous matches</div>
                <div class="group-items">
                    <SeasonHistoryMatch
                        v-for="(match, i) in groupedMatches.completedMatches"
                        :key="match.id"
                        class="match"
                        :animation-delay="i"
                        :active="active"
                        :match="match"
                        :home-team="team"
                        :live-match="liveMatch"
                        :timezone="timezone" />
                </div>
            </div>
            <div class="group">
                <div class="group-title">This match</div>
                <div class="group-items">
                    <SeasonHistoryMatch
                        :key="liveMatch.id"
                        class="match"
                        :animation-delay="groupedMatches.completedMatches.length + 1"
                        :active="active"
                        :match="liveMatch"
                        :home-team="team"
                        :live-match="liveMatch"
                        :timezone="timezone" />
                </div>
            </div>
            <div class="group">
                <div class="group-title">Upcoming matches</div>
                <div class="group-items">
                    <SeasonHistoryMatch
                        v-for="(match, i) in groupedMatches.incompleteMatches"
                        :key="match.id"
                        class="match"
                        :animation-delay="groupedMatches.completedMatches.length + 2 + i"
                        :active="active"
                        :match="match"
                        :home-team="team"
                        :live-match="liveMatch"
                        :timezone="timezone" />
                </div>
            </div>
        </div>
        <div v-else class="team-history w-100 d-flex">
            <SeasonHistoryMatch
                v-for="(match, i) in highlightedMatches"
                :key="match.id"
                class="match"
                :animation-delay="i"
                :active="active"
                :match="match"
                :home-team="team"
                :live-match="liveMatch"
                :timezone="timezone" />
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
    props: ["team", "liveMatch", "timezone", "showHeaders", "matchCount", "stage", "active"],
    computed: {
        groupedMatches() {
            let aim = this.matchCount;
            if (this.headers && !aim) aim = 7;

            if (!aim) return { allMatches: this.matches };
            const part = Math.floor((aim - 1) / 2);
            if (this.matches.length <= aim) {
                return {
                    allMatches: this.matches
                };
            }
            // aim for 7 matches
            // always include the current liveMatch
            // add 3 recent & 3 next if possible

            const completedMatches = this.matches.filter(match => [match.score_1, match.score_2].includes(match.first_to) && match.id !== this.liveMatch.id);
            const incompleteMatches = this.matches.filter(match => ![match.score_1, match.score_2].includes(match.first_to) && match.id !== this.liveMatch.id);

            const take = { completed: part, incomplete: part };
            if (completedMatches.length < part) {
                take.incomplete = aim - completedMatches.length - 1;
            } else if (incompleteMatches.length < part) {
                take.completed = aim - incompleteMatches.length - 1;
            }

            return {
                completedMatches: completedMatches.slice(0, take.completed),
                liveMatch: this.liveMatch,
                incompleteMatches: incompleteMatches.slice(0, take.incomplete)
            };
        },
        highlightedMatches() {
            if (this.groupedMatches.allMatches) return this.groupedMatches.allMatches;
            return [
                ...(this.groupedMatches.completedMatches),
                this.liveMatch,
                ...(this.groupedMatches.incompleteMatches)
            ];
        },
        matches() {
            const matches = (this.team?.matches || []).sort(sortMatches);
            if (this.stage) {
                return matches.filter(match => match.match_group && match.match_group.toLowerCase() === this.stage.toLowerCase());
            }
            return matches;
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

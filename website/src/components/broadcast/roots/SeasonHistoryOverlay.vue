<template>
    <GenericOverlay class="season-history-overlay" :title="title || 'Season History'">
        <div class="team-wrapper flex-center flex-column w-100 h-100">
            <TeamSeasonHistory
                v-for="team in teams"
                :key="team.id"
                class="team-season-history"
                :show-headers="showHeaders"
                :match-count="matchCount"
                :team="team"
                :live-match="match"
                :stage="stage"
                :timezone="broadcast.timezone || 'America/New_York'" />
        </div>
    </GenericOverlay>
</template>

<script>
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay";
import TeamSeasonHistory from "@/components/broadcast/TeamSeasonHistory";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
export default {
    name: "SeasonHistoryOverlay",
    components: { TeamSeasonHistory, GenericOverlay },
    props: ["broadcast", "title", "showHeaders", "matchCount", "stage"],
    computed: {
        teams() {
            return this.match?.teams || [];
        },
        match() {
            if (!this.broadcast?.live_match) return null;
            return ReactiveRoot(this.broadcast.live_match[0], {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme"),
                    players: ReactiveArray("players"),
                    matches: ReactiveArray("matches", {
                        teams: ReactiveArray("teams", {
                            theme: ReactiveThing("theme")
                        }),
                        maps: ReactiveArray("maps", {
                            map: ReactiveThing("map")
                        })
                    })
                })
            });
        }
    },
    head() {
        return {
            title: `Season History | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

<style scoped>
    /*.season-history-overlay:deep(.team-season-history:last-child) {*/
    /*    flex-direction: column-reverse !important;*/
    /*}*/
    .team-wrapper {
        justify-content: space-around;
    }
</style>

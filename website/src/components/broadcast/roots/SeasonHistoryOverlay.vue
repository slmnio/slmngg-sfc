<template>
    <GenericOverlay class="season-history-overlay" :title="title || 'Season History'">
        <div class="team-wrapper flex-center flex-column w-100 h-100">
            <TeamSeasonHistory class="team-season-history" v-for="team in teams" v-bind:key="team.id"
                               :team="team" :live-match="match" :timezone="broadcast.timezone || 'America/New_York'" />
        </div>
    </GenericOverlay>
</template>

<script>
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay";
import TeamSeasonHistory from "@/components/broadcast/TeamSeasonHistory";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
export default {
    name: "SeasonHistoryOverlay",
    props: ["broadcast", "title"],
    components: { TeamSeasonHistory, GenericOverlay },
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
    }
};
</script>

<style scoped>
    /*.season-history-overlay >>> .team-season-history:last-child {*/
    /*    flex-direction: column-reverse !important;*/
    /*}*/
    .team-wrapper {
        justify-content: space-around;
    }
</style>

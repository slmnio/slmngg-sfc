<template>
    <GenericTeamsOverlay class="history-overlay" :broadcast="broadcast" :title="title || 'Match History'" :match-schema="matchSchema">
        <template v-slot:team-content="{ team }">
            <TeamMatchHistory class="team-roster flex-center flex-column overlay--bg w-100" :team="team" :match="match" :max="max"  :reverse="reverse" />
        </template>
    </GenericTeamsOverlay>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import TeamMatchHistory from "@/components/broadcast/TeamMatchHistory";
import { resizedImage } from "@/utils/images";
import GenericTeamsOverlay from "@/components/broadcast/roots/GenericTeamsOverlay.vue";

export default {
    name: "HistoryOverlay",
    props: ["broadcast", "title", "max", "reverse"],
    components: {
        GenericTeamsOverlay,
        TeamMatchHistory
    },
    data: () => ({
        matchSchema: {
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
        }
    }),
    computed: {
        match() {
            if (!this.broadcast || !this.broadcast.live_match) return null;
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
        },
        teams() {
            if (!this.match) return [];
            return this.match.teams;
        }
    },
    methods: {
        themeColor(team) {
            if (!team.theme) return {};
            return {
                backgroundColor: team.theme.color_logo_background || team.theme.color_theme,
                borderColor: team.theme.color_logo_accent || team.theme.color_accent,
                color: team.theme.color_text_on_logo_background || team.theme.color_text_on_theme
            };
        },
        icon(team) {
            if (!team.theme) return {};
            return resizedImage(team.theme, ["default_logo", "default_wordmark"], "h-250");
        }
    },
    head() {
        return {
            title: `History | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

<style scoped>

</style>

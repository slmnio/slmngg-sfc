<template>
    <GenericOverlay class="desk-cams-overlay" :title="title || 'Player Cams'" :accent-color="accentColor">
        <div class="team-cams flex-center w-100 flex-column">
            <TeamCamsGroup v-for="(team, ti) in teams" v-bind:key="team.id"
                           :team="team" :guests="guests[ti]" :params="camParams" :event="broadcast && broadcast.event"
            :relay-prefix="relayPrefix" :ti="ti" :disable-cams="disable"/>
        </div>
    </GenericOverlay>
</template>

<script>
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay";
import TeamCamsGroup from "@/components/broadcast/cams/TeamCamsGroup";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";

export default {
    name: "DeskCamsOverlay",
    props: ["title", "broadcast", "params"],
    components: {
        GenericOverlay, TeamCamsGroup
    },
    computed: {
        disable() {
            return this.broadcast?.observer_settings?.includes("Disable team cams");
        },
        relayPrefix() {
            return this.broadcast?.cams_relay_prefix;
        },
        match() {
            if (!this.broadcast || !this.broadcast.live_match) return null;
            return ReactiveRoot(this.broadcast.live_match[0], {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                })
            });
        },
        accentColor() {
            if (!this.event || !this.event.theme) return null;
            return this.event.theme.color_theme;
        },
        teams() {
            if (!this.match || !this.match.teams || !this.match.teams.every(t => {
                if (t.theme === undefined && t.has_theme === 0) return true;
                return t.theme && !t.theme.__loading && t.theme.id;
            })) return [];
            if (this.match.teams.length !== 2) return [];
            const teams = this.match.teams;
            if (this.match.flip_teams) return teams.reverse();
            return teams;
        },
        guests() {
            const _teams = [
                this.broadcast.team_1_cams || [],
                this.broadcast.team_2_cams || []
            ];
            if (this.match.flip_teams) return _teams.reverse();
            return _teams;
        },
        camParams() {
            return `&cover&na${this.params}`;
        }
    }
};
</script>

<style scoped>
    .team-cams >>> .team-cams-group {
        margin: 10px;
        width: 100%;
    }
    .team-cams >>> .team-cam {
        height: 200px;
    }
    .team-cams >>> .guest-name {
        font-size: 24px;
    }
</style>

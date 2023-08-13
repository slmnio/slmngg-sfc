<template>
    <GenericOverlay class="player-history-overlay" :title="customTitle">
        <div class="career-wrapper d-flex flex-center">
            <div class="hero-segment d-flex flex-column flex-center" v-if="hero">
                <div class="hero-card h-100 d-flex flex-column">
                    <PlayerHero class="h-100" :hero="hero"></PlayerHero>
                </div>
            </div>
            <div class="teams-wrapper flex-column flex-center">
                <div class="first-event d-flex flex-center mb-3" v-if="firstEvent">
                    <div class="first-event-text mr-3">First event</div>
                    <NewEventDisplay :event="firstEvent"/>
                </div>

                <div class="title d-flex flex-column text-center mb-2">Team History</div>
                <div class="player-teams d-flex flex-wrap flex-center">
                    <PlayerTeamDisplay :team="team" v-for="team in playerTeams" :key="team.id" :showName="true"/>
                </div>
            </div>
        </div>
    </GenericOverlay>
</template>

<script>
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay";
import { sortEvents } from "@/utils/sorts";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import PlayerTeamDisplay from "@/components/broadcast/auction/PlayerTeamDisplay";
import PlayerHero from "@/components/broadcast/PlayerHero";
import NewEventDisplay from "@/views/lists/NewEventDisplay";
export default {
    name: "PlayerHistory",
    components: { PlayerTeamDisplay, GenericOverlay, PlayerHero, NewEventDisplay },
    props: ["title", "broadcast", "showMinor", "britishSpelling"],
    computed: {
        customTitle() {
            if (this.player?.name) return (this.player.name + "'s Career");
            return "Player Career";
        },
        highlightedPlayerID() {
            if (!this.broadcast?.highlight_player?.length) return null;
            return this.broadcast?.highlight_player[0];
        },
        player() {
            return ReactiveRoot(this.highlightedPlayerID, {
                member_of: ReactiveArray("member_of", {
                    theme: ReactiveThing("theme"),
                    event: ReactiveThing("event", {
                        theme: ReactiveThing("theme")
                    })
                })
            });
        },
        hero() {
            if (!this.player?.favourite_hero) return null;
            return ReactiveRoot(this.player?.favourite_hero[0]); // british spelling MyEyes
        },
        playerTeams() {
            if (!this.player?.member_of) return [];
            return this.player.member_of.filter(t => {
                if (!t) return;
                if (!t.event) return;
                if (!this.showMinor && t.minor_team) return false;
                // if (!t.ranking_sort) return false;
                return true;
            }).sort((a, b) => sortEvents(a.event, b.event));
        },
        firstEvent() {
            const events = [...(this.player?.member_of || [])]
                .map(t => t.event)
                .filter(e => e?.start_date)
                .sort(sortEvents);
            return events[0];
        }
    },
    metaInfo() {
        return {
            title: `Player History | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

<style scoped>
.player-history-overlay >>> .generic-overlay-body {
    padding: 0;
}
.career-wrapper {
    height: 100%;
    width: 100%;
}
.hero-segment {
    overflow: hidden;
    height: 100%;
    width: 296px;
    flex-shrink: 0;
    background-color: rgba(0, 0, 0, .2);
}
.teams-wrapper {
    min-width: 900px;
    flex-grow: 1;
    padding: 0 50px;
}
.teams-label {
    float: top;
}
.teams-wrapper >>> .player-team-display,
.teams-wrapper >>> .team-name {
    width: 176px;
}
.teams-wrapper .title {
    font-size: 3em;
    font-weight: bold;
    text-transform: uppercase;
}
.first-event {
    font-size: 1.25em;
}
.first-event-text {
    font-size: 1.2em;
    font-weight: bold;
}
.first-event >>> .event-name {
    margin: 0 0.3em 0 0  !important;
}
.player-teams {
    max-height: 530px;
    overflow: hidden;
}
</style>

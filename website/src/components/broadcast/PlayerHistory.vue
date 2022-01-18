<template>
  <GenericOverlay class="player-history-overlay" :title="customTitle">
    <div class="career-wrapper d-flex flex-center">
      <div class="hero-segment d-flex flex-column flex-center" v-if="hero">
        <div class="hero-card h-100 d-flex flex-column">
            <PlayerHero class="h-100" :hero="hero"></PlayerHero>
        </div>
    </div>
    <div class="teams-wrapper flex-column flex-center">
      <div class="teams-label d-flex flex-column text-center">Team History</div>
      <div class="player-teams d-flex flex-wrap flex-center">
        <PlayerTeamDisplay :team="team" v-for="team in playerTeams" v-bind:key="team.id" :showName="true"/>
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
export default {
    name: "PlayerHistory",
    components: { PlayerTeamDisplay, GenericOverlay, PlayerHero },
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
        }
        // TODO: Get a list of all events a player has participated in, sort by date, and display the start date of the earliest event as "Player Since"
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
    height: 740px;
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
    font-size: 3em;
    float: top;
}
.teams-wrapper >>> .player-team-display {
    height: 110px;
    width: 180px;
}
.teams-wrapper >>> .team-name {
    min-height: 24px;
    min-width: 180px;
    width: 180px;
}
</style>

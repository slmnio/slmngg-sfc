<template>
  <GenericOverlay class="player-history-overlay" :title="customTitle">
    <div class="player-teams d-flex flex-wrap flex-center">
      <PlayerTeamDisplay :team="team" v-for="team in playerTeams" v-bind:key="team.id" :showName="true"/>
    </div>

  </GenericOverlay>
</template>

<script>
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay";
import { sortEvents } from "@/utils/sorts";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import PlayerTeamDisplay from "@/components/broadcast/auction/PlayerTeamDisplay";
export default {
    name: "PlayerHistory",
    components: { PlayerTeamDisplay, GenericOverlay },
    props: ["title", "broadcast", "showMinor"],
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
    }
};
</script>

<style scoped>

</style>

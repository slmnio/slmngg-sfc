<template>
    <div class="container event-rosters">
        <ContentRow v-for="team in teams" :key="team.id" :title="team.name">
            <ContentThing
                v-for="player in (team.showLimitedPlayers ? team.limited_players : team.players)"
                :key="player.id"
                :thing="player"
                type="player"
                :theme="team.theme"
                :no-link="team.showLimitedPlayers" />
        </ContentRow>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import ContentRow from "@/components/website/ContentRow";
import ContentThing from "@/components/website/ContentThing";

export default {
    name: "EventRosters",
    components: { ContentRow, ContentThing },
    props: ["event"],
    computed: {
        teams() {
            if (!this.event?.teams) return [];
            return ReactiveArray("teams", {
                theme: ReactiveThing("theme"),
                players: ReactiveArray("players")
            })(this.event).map(team => {
                team.showLimitedPlayers = ((team.players || [])?.length === 0) && (team.limited_players || []).length !== 0;
                return team;
            });
        }
    }
};
</script>

<style scoped>

</style>

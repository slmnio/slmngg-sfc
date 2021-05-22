<template>
    <div class="container event-rosters">

        <ContentRow :title="team.name" v-for="team in teams" v-bind:key="team.id">
            <ContentThing :thing="player" type="player" :theme="team.theme" v-for="player in team.players" v-bind:key="player.id"></ContentThing>
        </ContentRow>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import ContentRow from "@/components/website/ContentRow";
import ContentThing from "@/components/website/ContentThing";

export default {
    name: "EventRosters",
    props: ["event"],
    components: { ContentRow, ContentThing },
    computed: {
        teams() {
            if (!this.event || !this.event.teams) return [];
            return ReactiveArray("teams", {
                theme: ReactiveThing("theme"),
                players: ReactiveArray("players")
            })(this.event);
        }
    }
};
</script>

<style scoped>

</style>

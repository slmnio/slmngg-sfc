<template>
        <div class="container">
            <ContentRow v-if="team.captain" title="Captain">
                <ContentThing type="player" :text="team.captain.name" :thing="team.captain" :theme="team.theme"></ContentThing>
            </ContentRow>
            <ContentRow v-if="team.staff" title="Team staff">
                <ContentThing type="player" :text="staff.name" :thing="staff" :theme="team.theme" v-for="staff in team.staff" v-bind:key="staff.id"></ContentThing>
            </ContentRow>
            <ContentRow v-if="team.players" title="Players">
                <ContentThing :show-headshot="team.show_headshots" type="player" :text="player.name" :thing="player" :theme="team.theme" v-for="player in team.players" v-bind:key="player.id"></ContentThing>
            </ContentRow>
            <ContentRow v-if="team.sister_teams" title="Sister teams">
                <ContentThing type="team" :show-logo="true" :text="item.name" :thing="item" :theme="item.theme" v-for="item in team.sister_teams" v-bind:key="item.id"></ContentThing>
            </ContentRow>
            <ContentRow v-if="team.team_in_other_tournaments" title="Team in other tournaments">
                <ContentThing type="team" :show-logo="true" :text="item.event ? `${item.name} (${item.event.short})` : item.name" :thing="item" :theme="item.theme" v-for="item in team.team_in_other_tournaments" v-bind:key="item.id"></ContentThing>
            </ContentRow>
    </div>
</template>

<script>
import ContentThing from "@/components/website/ContentThing";
import ContentRow from "@/components/website/ContentRow";
export default {
    name: "TeamMain",
    components: { ContentRow, ContentThing },
    props: ["team"]
};
</script>

<style scoped>

</style>

<template>
    <div>
        <div class="container">
            <ContentRow v-if="accolades">
                <ContentThing :thing="accolade" type="event" :link-to="accolade.event" :theme="accolade.event && accolade.event.theme" v-for="accolade in accolades"
                              v-bind:key="accolade.id" :show-logo="true" :text="accolade.player_text"></ContentThing>
            </ContentRow>
            <ContentRow title="Captain of" v-if="player.captain_of">
                <ContentThing :thing="team" type="team" :theme="team.theme" v-for="team in player.captain_of"
                              v-bind:key="team.id" :show-logo="true"></ContentThing>
            </ContentRow>
            <ContentRow title="Player for" v-if="teams">
                <ContentThing :thing="team" type="team" :theme="team.theme" v-for="team in teams"
                              v-bind:key="team.id" :show-logo="true"></ContentThing>
            </ContentRow>
            <ContentRow title="Event staff for" v-if="player.event_staff">
                <ContentThing :thing="event" type="event" :theme="event.theme" v-for="event in player.event_staff"
                              v-bind:key="event.id" :show-logo="true"></ContentThing>
            </ContentRow>
        </div>
    </div>
</template>

<script>
import ContentRow from "@/components/ContentRow";
import ContentThing from "@/components/ContentThing";

export default {
    props: ["player"],
    name: "PlayerMain",
    components: {
        ContentRow,
        ContentThing
    },
    computed: {
        accolades() {
            if (!this.player) return [];

            const accolades = [
                // team things
                ...(this.player.member_of ? [].concat(...this.player.member_of.map(e => e.accolades).filter(e => !!e)) : [])
            ];

            console.log("accolades", accolades);
            return accolades;
        },
        teams() {
            const filtered = this.player.member_of.filter(t => !t.minor_team);
            if (filtered.length === 0) return null;
            return filtered;
        }
    }
};
</script>

<style scoped>

</style>

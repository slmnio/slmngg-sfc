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
            <ContentRow title="Player for" v-if="player.member_of">
                <ContentThing :thing="team" type="team" :theme="team.theme" v-for="team in player.member_of"
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
            // const accolades = [];
            // if (this.player && this.player.member_of) {
            //     console.log(this.player.member_of);
            //     this.player.member_of.forEach(team => {
            //         if (team.accolades) {
            //             team.accolades.forEach(a => {
            //                 accolades.push(a);
            //             });
            //         }
            //     });
            // }

            console.log("accolades", accolades);
            return accolades;
            // return [];
            // return [
            //     ...this.player?.member_of?.accolades
            // ];
        }
    }
};
</script>

<style scoped>

</style>

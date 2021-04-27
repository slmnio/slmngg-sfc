<template>
    <div v-if="team">
        <ThingTop :thing="team" type="team"></ThingTop>
        <div class="container mt-3">
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
    </div>
</template>

<script>

import { resolveThing, resolveID, resolveThings } from "@/utils/fetch";
import ThingTop from "@/components/ThingTop";
import ContentRow from "@/components/ContentRow";
import ContentThing from "@/components/ContentThing";

import { cleanID } from "@/utils/content-utils";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";

export default {
    name: "Team",
    props: ["id"],
    components: {
        ThingTop, ContentRow, ContentThing
    },
    metaInfo() {
        return {
            title: this.team.name,
            meta: [
                { name: "description", content: "test description" },
                { name: "og:description", content: "test description" },
                { name: "og:title", content: this.team.name }
            ]
        };
    },
    computed: {
        team() {
            return ReactiveRoot(this.id, {
                captain: ReactiveThing("captain"),
                players: ReactiveArray("players"),
                theme: ReactiveThing("theme"),
                sister_teams: ReactiveArray("sister_teams", {
                    theme: ReactiveThing("theme")
                }),
                team_in_other_tournaments: ReactiveArray("team_in_other_tournaments", {
                    theme: ReactiveThing("theme"),
                    event: ReactiveThing("event")
                }),
                staff: ReactiveArray("staff"),
                event: ReactiveThing("event", {
                    theme: ReactiveThing("theme")
                })
            });
        }
    }
};

</script>

<style scoped>

</style>

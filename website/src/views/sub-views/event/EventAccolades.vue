<template>
    <div class="event-accolades container">
        <h2>Event Accolades</h2>
        <div v-for="group in accolades" :key="group.title" class="accolades-group mt-3">
            <h3>{{ group.title }}</h3>
            <div class="accolade-list">
                <ContentRow
                    v-for="accolade in group?.rows"
                    :key="accolade.id"
                    class="accolade"
                    :hover-title="accolade?.description"
                    :title="accolade.event_relative_name || accolade.name">
                    <ContentThing
                        v-for="team in accolade.teams"
                        :key="team.id"
                        :thing="team"
                        type="team"
                        :link-to="team"
                        :theme="team.theme"
                        :show-logo="true"
                        :text="team.name" />
                    <ContentThing
                        v-for="player in accolade.players"
                        :key="player.id"
                        :thing="player"
                        type="player"
                        :link-to="player"
                        :theme="accolade?.team?.[0]?.theme || findTeam(player)?.theme || event?.theme"
                        :show-logo="true"
                        :text="player.name" />
                </ContentRow>
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive.js";
import ContentRow from "@/components/website/ContentRow.vue";
import ContentThing from "@/components/website/ContentThing.vue";
import { cleanID } from "shared";

export default {
    name: "EventAccolades",
    components: { ContentThing, ContentRow },
    props: {
        event: Object,
    },
    computed: {
        hydratedEvent() {
            if (!this.event?.id) return {};
            return ReactiveRoot(this.event?.id, {
                "accolades": ReactiveArray("accolades", {
                    "players": ReactiveArray("players"),
                    "teams": ReactiveArray("teams", {
                        "theme": ReactiveThing("theme")
                    })
                }),
                "teams": ReactiveArray("teams", {
                    "theme": ReactiveThing("theme")
                })
            });
        },
        accolades() {
            if (!this.hydratedEvent?.accolades?.length) return null;
            return [
                {
                    title: "Teams",
                    rows: this.hydratedEvent.accolades.filter((a) => !a?.players?.length && a?.teams?.length)
                },
                {
                    title: "Players",
                    rows: this.hydratedEvent.accolades.filter((a) => a?.players?.length)
                },
            ].filter(x => x.rows?.length);
        },

    },
    methods: {
        findTeam(player) {
            if (!player) return null;
            // find team
            return this.hydratedEvent.teams.find(team =>
                (team.players || []).find(p => cleanID(p) === cleanID(player.id)) ||
                (team.captains || []).find(p => cleanID(p) === cleanID(player.id))
            );
        }

    }
};
</script>

<style scoped>

</style>

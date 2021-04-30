<template>
    <div>
        <div class="container">
            <ContentRow v-if="accolades">
                <ContentThing :thing="accolade" type="event" :link-to="accolade.event" :theme="accolade.event && accolade.event.theme" v-for="accolade in accolades"
                              v-bind:key="accolade.id" :show-logo="true" :text="accolade.player_text" />
            </ContentRow>
            <ContentRow title="Captain of" v-if="player.captain_of">
                <ContentThing :thing="team" type="team" :theme="team.theme" v-for="team in player.captain_of"
                              v-bind:key="team.id" :show-logo="true" />
            </ContentRow>
            <ContentRow title="Team staff for" v-if="player.team_staff">
              <ContentThing :thing="team" type="team" :theme="team.theme" v-for="team in player.team_staff"
                            v-bind:key="team.id" :show-logo="true" />
            </ContentRow>
            <ContentRow title="Player for" v-if="teams">
                <ContentThing :thing="team" type="team" :theme="team.theme" v-for="team in teams"
                              v-bind:key="team.id" :show-logo="true" />
            </ContentRow>
            <ContentRow title="Event staff for" v-if="player.event_staff">
                <ContentThing :thing="event" type="event" :theme="event.theme" v-for="event in player.event_staff"
                              v-bind:key="event.id" :show-logo="true" />
            </ContentRow>
            <ContentRow :title="group.meta.player_text" v-for="group in mainPlayerRelationships" v-bind:key="group.meta.singular_name">
                <ContentThing
                    v-for="item in group.items"
                    v-bind:key="item.item.id"
                    :thing="item.item"
                    :type="item.type"
                    :theme="item.item.theme"
                    :show-logo="true" />
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
                ...(this.player.member_of ? [].concat(...this.player.member_of.map(e => e.accolades).filter(e => !!e)) : []),
                ...(this.player.accolades ? this.player.accolades : [])
            ];
            return accolades;
        },
        teams() {
            if (!this.player?.member_of) return null;
            const filtered = this.player.member_of.filter(t => !t.minor_team);
            if (filtered.length === 0) return null;
            return filtered;
        },
        mainPlayerRelationships(useMatches = false) {
            if (!this.player?.player_relationships) return {};
            const groups = {};

            this.player.player_relationships.forEach(rel => {
                if (!groups[rel.singular_name]) {
                    groups[rel.singular_name] = {
                        meta: {
                            player_text: rel.player_text,
                            plural_name: rel.plural_name,
                            singular_name: rel.singular_name
                        },
                        items: []
                    };
                }

                groups[rel.singular_name].items = groups[rel.singular_name].items.concat([
                    ...(rel.events && useMatches ? rel.events.map(e => ({ item: e, type: "event" })) : []),
                    ...(rel.teams && useMatches ? rel.teams.map(e => ({ item: e, type: "team" })) : []),
                    ...(rel.matches && !useMatches ? rel.matches.map(e => ({ item: e, type: "match" })) : [])
                ]);
            });

            Object.entries(groups).forEach(([key, val]) => {
                if (val.items.length === 0) {
                    delete groups[key];
                }
            });

            return groups;
        }
    }
};
</script>

<style scoped>

</style>

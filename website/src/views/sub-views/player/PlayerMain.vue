<template>
    <div>
        <div class="container">
            <ContentRow v-if="accolades" class="accolades">
                <ContentThing
                    v-for="accolade in accolades"
                    :key="accolade.id"
                    :thing="accolade"
                    type="event"
                    :link-to="accolade.event"
                    :theme="accolade.event && accolade.event.theme"
                    :show-logo="true"
                    :text="accolade.player_text" />
            </ContentRow>
            <ContentRow v-if="ownedTeams" title="Owner of">
                <ContentThing
                    v-for="team in ownedTeams"
                    :key="team.id"
                    :thing="team"
                    type="team"
                    :theme="team.theme"
                    :text="clarifyTeam(team)"
                    :show-logo="true" />
            </ContentRow>
            <ContentRow v-if="captainedTeams" title="Captain of">
                <ContentThing
                    v-for="team in captainedTeams"
                    :key="team.id"
                    :thing="team"
                    type="team"
                    :theme="team.theme"
                    :text="clarifyTeam(team)"
                    :show-logo="true" />
            </ContentRow>
            <ContentRow v-if="teamStaff" title="Team staff for">
                <ContentThing
                    v-for="team in teamStaff"
                    :key="team.id"
                    :thing="team"
                    type="team"
                    :theme="team.theme"
                    :text="clarifyTeam(team)"
                    :show-logo="true" />
            </ContentRow>
            <ContentRow v-if="teams" title="Player for">
                <ContentThing
                    v-for="team in teams"
                    :key="team.id"
                    :thing="team"
                    type="team"
                    :theme="team.theme"
                    :text="clarifyTeam(team)"
                    :show-logo="true" />
            </ContentRow>
            <ContentRow v-if="eventStaff" title="Event staff for">
                <ContentThing
                    v-for="event in eventStaff"
                    :key="event.id"
                    :thing="event"
                    type="event"
                    :theme="event.theme"
                    :show-logo="true" />
            </ContentRow>
            <ContentRow v-if="castedEvents" title="Caster for">
                <ContentThing
                    v-for="event in castedEvents"
                    :key="event.id"
                    :thing="event"
                    type="event"
                    :theme="event.theme"
                    :show-logo="true" />
            </ContentRow>
            <ContentRow v-for="group in mainPlayerRelationships" :key="group.meta.singular_name" :title="group.meta.player_text">
                <ContentThing
                    v-for="item in group.items"
                    :key="item.item.id"
                    :thing="item.item"
                    :type="item.type"
                    :theme="item.item.theme"
                    :show-logo="true" />
            </ContentRow>
        </div>
    </div>
</template>

<script>
import ContentRow from "@/components/website/ContentRow.vue";
import ContentThing from "@/components/website/ContentThing.vue";
import { sortTeams, sortEvents } from "@/utils/sorts";
import { clarifyTeam } from "@/utils/content-utils";

export default {
    name: "PlayerMain",
    components: {
        ContentRow,
        ContentThing
    },
    props: ["player"],
    computed: {
        accolades() {
            if (!this.player) return [];

            return [
                // team things
                ...(this.player.member_of ? [].concat(...this.player.member_of.map(e => (e.accolades || []).filter(a => a?.show_for_players)).filter(Boolean)) : []),
                ...(this.player.captain_of ? [].concat(...this.player.captain_of.map(e => (e.accolades || []).filter(a => a?.show_for_players)).filter(Boolean)) : []),
                ...(this.player.accolades ? this.player.accolades : [])
            ].filter(accolade => !accolade.trophy_tier).sort((a, b) => sortEvents(a?.event, b?.event));
        },
        teams() {
            if (!this.player?.member_of) return null;
            const filtered = this.player.member_of.filter(t => !t.minor_team);
            if (filtered.length === 0) return null;
            return filtered.sort(sortTeams);
        },
        captainedTeams() {
            if (!this.player?.captain_of) return null;
            const teams = this.player.captain_of;
            return teams.sort(sortTeams);
        },
        ownedTeams() {
            if (!this.player?.owned_teams) return null;
            const teams = this.player.owned_teams;
            return teams.sort(sortTeams);
        },
        eventStaff() {
            if (!this.player?.event_staff) return null;
            const events = this.player.event_staff;
            return events.sort(sortEvents);
        },
        castedEvents() {
            if (!this.player?.casted_events) return null;
            const events = this.player.casted_events;
            return events.sort(sortEvents);
        },
        teamStaff() {
            if (!this.player?.team_staff) return null;
            const teams = this.player.team_staff;
            return teams.sort(sortTeams);
        },
        brandsDesigned() {
            if (!this.player?.brands_designed) return null;
            const teams = this.player.brands_designed;
            return teams.sort(sortTeams);
        },
        mainPlayerRelationships(useMatches = false) {
            if (!this.player?.player_relationships) return {};
            const groups = new Map();

            this.player.player_relationships.forEach(rel => {
                if (!groups.has(rel.singular_name)) {
                    groups.set(rel.singular_name, {
                        meta: {
                            player_text: rel.player_text,
                            plural_name: rel.plural_name,
                            singular_name: rel.singular_name
                        },
                        items: []
                    });
                }

                groups.get(rel.singular_name).items = groups.get(rel.singular_name).items.concat([
                    ...(rel.events && useMatches ? rel.events.map(e => ({ item: e, type: "event" })) : []),
                    ...(rel.teams && useMatches ? rel.teams.map(e => ({ item: e, type: "team" })) : []),
                    ...(rel.matches && !useMatches ? rel.matches.map(e => ({ item: e, type: "match" })) : [])
                ]);
            });

            for (const group of groups) {
                const [key, val] = group;
                if (val.items.length === 0) {
                    groups.delete(key);
                } else {
                    val.items.sort((a, b) => sortEvents(a.item, b.item));
                }
            }

            return Object.fromEntries(groups);
        }
    },
    methods: {
        clarifyTeam
    }
};
</script>

<style scoped>
    .content-row.accolades {
        font-size: 1.1em;
    }
</style>

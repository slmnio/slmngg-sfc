<template>
    <div class="container">
        <div class="my-2 mx-3 top">
            <h2>Staff</h2>
            <div v-if="showTableButton" class="btn btn-light" @click="table = !table">{{ table ? 'List' : 'Table' }} view</div>
        </div>
        <div v-if="!table">
            <ContentRow v-if="event.staff && event.staff.length" title="Staff">
                <ContentThing
                    v-for="staff in event.staff"
                    :key="staff.id"
                    :thing="staff"
                    type="player"
                    :theme="event.theme" />
            </ContentRow>
            <ContentRow v-if="event.casters && event.casters.length" :title="event.casters.length === 1 ? 'Caster' : 'Casters'">
                <ContentThing
                    v-for="caster in event.casters"
                    :key="caster.id"
                    :thing="caster"
                    type="player"
                    :theme="event.theme" />
            </ContentRow>
            <ContentRow
                v-for="group in playerRelationshipGroups"
                :key="group.meta.singular_name"
                :title="group.items.length === 1 ? group.meta.singular_name : group.meta.plural_name">
                <ContentThing
                    v-for="player in group.items"
                    :key="player.id"
                    :thing="player"
                    type="player"
                    :theme="event.theme" />
            </ContentRow>
        </div>
        <EventStaffing v-if="table" :event="event" />
    </div>
</template>

<script>
import ContentThing from "@/components/website/ContentThing.vue";
import ContentRow from "@/components/website/ContentRow.vue";
import EventStaffing from "@/components/website/EventStaffing.vue";

export default {
    name: "EventStaff",
    components: {
        ContentThing, ContentRow, EventStaffing
    },
    props: ["event"],
    data: () => ({
        table: false
    }),
    computed: {
        showTableButton() {
            return this.event?.player_relationships || this.event?.casters || (this.event?.matches || []).some(match => match.player_relationships?.length);
        },
        playerRelationshipGroups() {
            if (!this.event?.player_relationships?.length) return [];
            const groups = {};

            this.event.player_relationships.forEach(rel => {
                if (!rel.player?.id) return;
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
                groups[rel.singular_name].items = groups[rel.singular_name].items.concat(rel.player);
            });

            if (groups[undefined]) return [];

            return Object.values(groups);
        }
    }
};
</script>

<style scoped>
    .top {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
</style>

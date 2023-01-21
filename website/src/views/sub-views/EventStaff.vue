<template>
    <div class="container">
        <div class="my-2 mx-3 top">
            <h2>Staff</h2>
            <div class="btn btn-light" v-if="showTableButton" @click="table = !table">{{ table ? 'List' : 'Table' }} view</div>
        </div>
        <div v-if="!table">
            <ContentRow title="Staff" v-if="event.staff && event.staff.length">
                <ContentThing :thing="staff" type="player" :theme="event.theme" v-for="staff in event.staff" :key="staff.id"></ContentThing>
            </ContentRow>
            <ContentRow :title="event.casters.length === 1 ? 'Caster' : 'Casters'" v-if="event.casters && event.casters.length">
                <ContentThing :thing="caster" type="player" :theme="event.theme" v-for="caster in event.casters" :key="caster.id"></ContentThing>
            </ContentRow>
            <ContentRow v-for="group in playerRelationshipGroups" :key="group.meta.singular_name"
                        :title="group.items.length === 1 ? group.meta.singular_name : group.meta.plural_name">
                <ContentThing v-for="player in group.items" :key="player.id" :thing="player" type="player" :theme="event.theme"/>
            </ContentRow>
        </div>
        <EventStaffing :event="event" v-if="table"/>
    </div>
</template>

<script>
import ContentThing from "@/components/website/ContentThing";
import ContentRow from "@/components/website/ContentRow";
import EventStaffing from "@/components/website/EventStaffing";

export default {
    name: "EventStaff",
    props: ["event"],
    data: () => ({
        table: false
    }),
    components: {
        ContentThing, ContentRow, EventStaffing
    },
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

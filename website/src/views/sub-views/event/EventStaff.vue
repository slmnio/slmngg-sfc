<template>
    <div class="container">
        <div class="my-2 mx-3 d-flex justify-content-between align-items-center">
            <h2>Staff</h2>
            <b-button variant="light" class="text-dark" :to="subLink('staff/extended')">Table view</b-button>
        </div>
        <div>
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
    </div>
</template>

<script>
import ContentThing from "@/components/website/ContentThing.vue";
import ContentRow from "@/components/website/ContentRow.vue";
import EventStaffing from "@/components/website/EventStaffing.vue";
import { url } from "@/utils/content-utils";

export default {
    name: "EventStaff",
    components: {
        ContentThing, ContentRow
    },
    props: ["event", "isMinisite"],
    computed: {
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
    },
    methods: {
        subLink(page) {
            if (this.isMinisite) {
                return `/${page}`;
            }
            return `/event/${this.event.id}/${page}`;
        }
    }
};
</script>

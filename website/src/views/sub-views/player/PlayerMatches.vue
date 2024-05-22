<template>
    <div>
        <div class="container">
            <div class="d-flex align-items-start gap-2">
                <h6 class="d-flex flex-wrap matches-bar">
                    Games:
                    <a
                        v-for="rel in mainPlayerRelationships"
                        :key="rel.meta.singular_name"
                        :href="`#${convertToSlug(rel.meta.singular_name)}`">
                        {{ rel.items.length }} as {{ rel.meta.singular_name }}
                    </a>
                </h6>
                <b-button class="text-nowrap" variant="secondary" size="sm" @click="sortDateAscending = !sortDateAscending">{{ sortDateAscending ? 'Newest' : 'Oldest' }} first <i class="fas ml-1" :class="sortDateAscending ? 'fa-sort-amount-down-alt' : 'fa-sort-amount-down'"></i></b-button>
            </div>
            <div v-for="rel in mainPlayerRelationships" :key="rel.meta.singular_name" class="role-group mt-3">
                <h1 :id="convertToSlug(rel.meta.singular_name)">
                    as {{ rel.meta.singular_name }} ({{ rel.items.length }})
                </h1>
                <div>
                    <event-match-group
                        v-for="event in rel.events"
                        :key="event.id"
                        class="event-match-group"
                        :event="event?.event"
                        :matches="event?.matches" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import { sortEvents, sortMatches } from "@/utils/sorts";
import { formatTime, url } from "@/utils/content-utils";
import { useSettingsStore } from "@/stores/settingsStore";
import EventMatchGroup from "@/components/website/EventMatchGroup.vue";

export default {
    name: "PlayerMatches",
    components: { EventMatchGroup },
    props: ["player"],
    data: () => ({
        sortDateAscending: false
    }),
    computed: {
        relationships() {
            if (!this.player?.player_relationships?.length) return [];
            return ReactiveArray("player_relationships", {
                matches: ReactiveArray("matches", {
                    event: ReactiveThing("event", {
                        theme: ReactiveThing("theme")
                    })
                })
            })(this.player);
        },
        mainPlayerRelationships() {
            if (!this.relationships) return {};
            const groups = {};
            this.relationships.forEach(rel => {

                if (!groups[rel.singular_name]) {
                    groups[rel.singular_name] = {
                        meta: {
                            player_text: rel.player_text,
                            plural_name: rel.plural_name,
                            singular_name: rel.singular_name
                        },
                        items: [],
                        events: []
                    };
                }
                groups[rel.singular_name].items = groups[rel.singular_name].items.concat([
                    ...(rel.matches ? rel.matches.map(e => ({ item: e, type: "match" })) : [])
                ]);
            });
            Object.entries(groups).forEach(([key, val]) => {
                if (val.items.length === 0) {
                    // TODO: no-dynamic-delete fix
                    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                    delete groups[key];
                }

                if (groups[key]?.items) {
                    const events = { };

                    groups[key]?.items?.forEach(({ item }) => {
                        const eventID = item?.event?.id;
                        if (eventID) {
                            if (!events[eventID]) events[eventID] = { event: item.event, matches: [] };
                            events[eventID].matches.push(item);
                        }
                    });

                    groups[key].items = groups[key].items.sort((a, b) => sortMatches(a.item, b.item));
                    groups[key].events = Object.values(events).map(event => ({
                        ...event,
                        matches: event.matches.sort(sortMatches)
                    })).sort((a,b) => {
                        const diff = sortEvents(a.event,b.event);
                        return this.sortDateAscending ? -1 * diff : diff;
                    });
                }
            });
            return groups;
        }
    },
    methods: {
        useSettingsStore,
        url,
        formatTime,
        convertToSlug(text) {
            return text.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
        }
    }
};
</script>

<style scoped>
    .matches-bar {
        gap: .5rem 1.5rem;
    }
</style>

<template>
    <div class="container">
        <div class="d-flex flex-wrap align-items-center justify-content-between">
            <h2>Casted matches ({{ casts?.length }})</h2>

            <b-button class="text-nowrap" variant="secondary" size="sm" @click="sortDateAscending = !sortDateAscending">
                {{ sortDateAscending ? "Newest" : "Oldest" }} first <i
                    class="fas ml-1"
                    :class="sortDateAscending ? 'fa-sort-amount-down-alt' : 'fa-sort-amount-down'"></i>
            </b-button>
        </div>
        <div>
            <event-match-group
                v-for="event in groupedEvents"
                :key="event.id"
                class="event-match-group"
                :event="event?.event"
                :matches="event?.matches" />
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import { sortEvents, sortMatches } from "@/utils/sorts";
import { formatTime, url } from "@/utils/content-utils";
import EventMatchGroup from "@/components/website/EventMatchGroup.vue";

export default {
    name: "PlayerCasts",
    components: { EventMatchGroup },
    props: ["player"],
    data: () => ({
        sortDateAscending: false
    }),
    computed: {
        casts() {
            if (!this.player?.casts) return [];
            return ReactiveArray("casts", {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                }),
                event: ReactiveThing("event", {
                    theme: ReactiveThing("theme")
                })
            })(this.player).sort(sortMatches);
        },
        groupedEvents() {
            const casts = [...this.casts];
            const events = { };
            casts?.forEach((item) => {
                const eventID = item?.event?.id;
                if (eventID) {
                    if (!events[eventID]) events[eventID] = { event: item.event, matches: [] };
                    events[eventID].matches.push(item);
                }
            });

            return Object.values(events).map(event => ({
                ...event,
                matches: event.matches.sort(sortMatches)
            })).sort((a,b) => {
                const diff = sortEvents(a.event,b.event);
                return this.sortDateAscending ? -1 * diff : diff;
            });
        }
    },
    methods: { url, formatTime }
};
</script>

<style scoped>

</style>

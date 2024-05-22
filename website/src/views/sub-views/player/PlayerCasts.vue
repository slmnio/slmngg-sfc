<template>
    <div class="container">
        <h2>Casted matches ({{ casts?.length }})</h2>
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
import Match from "@/components/website/match/Match.vue";
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import { sortEvents, sortMatches } from "@/utils/sorts";
import { formatTime, url } from "@/utils/content-utils";
import EventMatchGroup from "@/components/website/EventMatchGroup.vue";

export default {
    name: "PlayerCasts",
    components: { EventMatchGroup },
    props: ["player"],
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
            })).sort(sortEvents);
        }
    },
    methods: { url, formatTime }
};
</script>

<style scoped>

</style>

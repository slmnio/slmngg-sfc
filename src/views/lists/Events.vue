<template>
    <div class="container">
        <h1 class="big">Events</h1>
        <div v-for="series in eventSeries" v-bind:key="series.id" class="mb-3">
            <h2>{{ series.name }}</h2>
            <EventDisplay :event="event" v-for="event in series.events" v-bind:key="event.id" />
        </div>
        <h2 v-if="otherEvents && otherEvents.length">Other events</h2>
        <EventDisplay :event="event" v-for="event in otherEvents" v-bind:key="event.id" />
    </div>
</template>

<script>
import { ReactiveArray, ReactiveList, ReactiveThing } from "@/utils/reactive";
import EventDisplay from "@/views/lists/EventDisplay";

export default {
    name: "Events",
    components: { EventDisplay },
    computed: {
        events() {
            return ReactiveList("Events", {
                theme: ReactiveThing("theme")
            }).filter(event => event.show_in_events);
        },
        eventSeries() {
            return ReactiveList("Event Series", {
                events: ReactiveArray("events", {
                    theme: ReactiveThing("theme")
                })
            });
        },
        otherEvents() {
            return this.events.filter(event => {
                return !this.eventSeries.some(es => es.events?.some(e => e.id === event.id));
            });
        }
    },
    metaInfo() {
        return {
            title: "Events"
        };
    }
};
</script>

<style scoped>
    h1.big {
        font-size: 4em;
    }
</style>

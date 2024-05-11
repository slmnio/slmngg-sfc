<template>
    <div class="container">
        <h1 class="big">Events</h1>
        <h1 v-if="!events.length"><LoadingIcon /></h1>

        <div v-if="inProgressEvents.length">
            <h2>In progress</h2>
            <div class="series-events row mb-4">
                <div v-for="event in inProgressEvents" :key="event.id" class="col-12 col-sm-6 col-md-4 col-xl-3 event-pad">
                    <NewEventDisplay :event="event" />
                </div>
            </div>
            <hr>
        </div>

        <div v-for="series in eventSeries" :key="series.id">
            <h2>{{ series.name }}</h2>
            <div class="series-events row">
                <div v-for="event in series.events" :key="event.id" class="col-12 col-sm-6 col-md-4 col-xl-3 event-pad">
                    <NewEventDisplay :event="event" />
                </div>
            </div>
        </div>
        <h2 v-if="otherEvents && otherEvents.length">Other events</h2>
        <div class="series-events row">
            <div v-for="event in otherEvents" :key="event.id" class="col-12 col-sm-6 col-md-4 col-xl-3 event-pad">
                <NewEventDisplay :event="event" />
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveList, ReactiveThing } from "@/utils/reactive";
import NewEventDisplay from "@/views/lists/NewEventDisplay";
import { sortEvents } from "@/utils/sorts";
import LoadingIcon from "@/components/website/LoadingIcon";

export default {
    name: "Events",
    components: { NewEventDisplay, LoadingIcon },
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
            }).sort((a, b) => a.order - b.order);
        },
        otherEvents() {
            if (!this.eventSeries.some(e => e._original_data_id)) return [];

            return this.events.filter(event => {
                return !this.eventSeries.some(es => es.events?.some(e => e.id === event.id));
            }).sort(sortEvents);
        },
        inProgressEvents() {
            if (!this.events?.length) return [];
            return this.events.filter(e => e.in_progress).sort(sortEvents);
        }
    },
    head() {
        return {
            title: "Events"
        };
    }
};
</script>

<style scoped>
    .series-events {
        margin: 8px -15px;
    }
    .event-pad {
        margin: 4px 0;
    }
    h2 {
        margin-top: 12px;
    }
    hr {
        border-color: rgba(255,255,255,0.15);
    }
</style>

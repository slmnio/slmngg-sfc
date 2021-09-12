<template>
    <div class="container">
        <h1 class="big">Events</h1>
        <h1 v-if="!events.length"><LoadingIcon></LoadingIcon></h1>
        <div v-for="series in eventSeries" v-bind:key="series.id">
            <h2>{{ series.name }}</h2>
            <div class="series-events row">
                <div class="col-12 col-sm-6 col-md-4 col-xl-3 event-pad" v-for="event in series.events" v-bind:key="event.id">
                    <NewEventDisplay :event="event"/>
                </div>
            </div>
        </div>
        <h2 v-if="otherEvents && otherEvents.length">Other events</h2>
        <div class="series-events row">
            <div class="col-12 col-sm-6 col-md-4 col-xl-3 event-pad" v-for="event in otherEvents" v-bind:key="event.id">
                <NewEventDisplay :event="event"/>
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
            return this.events.filter(event => {
                return !this.eventSeries.some(es => es.events?.some(e => e.id === event.id));
            }).sort(sortEvents);
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
    .series-events {
        margin: 8px -15px;
    }
    .event-pad {
        margin: 4px 0;
    }
    h2 {
        margin-top: 12px;
    }
</style>

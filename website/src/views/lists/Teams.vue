<template>
    <div class="container">
        <h1 class="big mb-3">Teams</h1>
        <input v-model="search" type="text" class="form-control mb-3" placeholder="Start typing to filter">
        <h1><LoadingIcon v-if="!search && !sortedEvents.length" /></h1>

        <EventTeamsDisplay
            v-for="event in sortedEvents"
            :key="event.eventID"
            class="mb-4"
            :partial-event="event"
            :search-text="searchEvents ? search : null" />
        <b-pagination
            v-if="!searchEvents"
            v-model="page"
            :per-page="eventsPerPage"
            :total-rows="events.length"
            align="center"
            @page-click="scrollToTop()" />
    </div>
</template>

<script>
import { ReactiveRoot } from "@/utils/reactive";
import { searchInCollection } from "@/utils/search";
import LoadingIcon from "@/components/website/LoadingIcon";
import EventTeamsDisplay from "@/views/lists/EventTeamsDisplay.vue";
import { useRouteQuery } from "@vueuse/router";
import { cleanID } from "@/utils/content-utils";

export default {
    name: "Teams",
    components: {
        EventTeamsDisplay,
        LoadingIcon
    },
    data: function() {
        return {
            search: null,
            page: useRouteQuery("page", "1", { transform: Number }),
            eventsPerPage: 10
        };
    },
    computed: {
        events() {
            const events = ReactiveRoot("special:public-events")?.events;
            if (!events) return [];
            return events.reverse();
        },
        searchEvents() {
            return (this.search && this.search.length > 2);
        },
        sortedEvents() {
            if (!this.searchEvents) {
                // group and paginate
                return this.events.slice(this.eventsPerPage * (this.page - 1), this.eventsPerPage * this.page).map(eventID => ({ eventID }));
            }

            console.log(this.search, this.teamData);
            if (!this.teamData?.length) return [];

            const teamSearchResults = searchInCollection(this.teamData, this.search, "name");
            const events = [];

            teamSearchResults.forEach(team => {
                let existing = events.find(e => cleanID(e.eventID) === cleanID(team.event));
                if (!existing) {
                    existing = events[events.push({
                        eventID: team.event,
                        eventStart: team.eventStart,
                        teams: []
                    }) - 1];
                }
                existing.teams.push(team);
            });
            return events.sort((a, b) => {
                if (a.eventStart && b.eventStart) {
                    return (new Date(a.eventStart) - new Date(b.eventStart));
                }
                if (a.eventStart) return -1;
                if (b.eventStart) return 1;
                return 0;
            }).reverse();
        },
        teamData() {
            return ReactiveRoot("special:teams")?.teams;
        }
    },
    methods: {
        scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: "instant"
            });
        }
    },
    head() {
        return {
            title: "Teams"
        };
    }
};
</script>

<style scoped>
.pagination {
    user-select: none;
}
</style>

<template>
    <div class="container">
        <h1 class="big mb-3">Teams</h1>
        <input v-model="search" type="text" class="form-control mb-3" placeholder="Start typing to filter">
        <h1><LoadingIcon v-if="!search && !sortedEvents.length" /></h1>

        <EventTeamsDisplay
            v-for="eventID in sortedEvents"
            :key="eventID"
            class="mb-4"
            :event-i-d="eventID"
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
import { ReactiveArray, ReactiveRoot } from "@/utils/reactive";
import { searchInCollection } from "@/utils/search";
import LoadingIcon from "@/components/website/LoadingIcon";
import EventTeamsDisplay from "@/views/lists/EventTeamsDisplay.vue";

export default {
    name: "Teams",
    components: {
        EventTeamsDisplay,
        LoadingIcon
    },
    data: function() {
        return {
            search: null,
            page: 1,
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
                return this.events.slice(this.eventsPerPage * (this.page - 1), this.eventsPerPage * this.page);
            }

            console.log(this.search, this.teamData);
            if (!this.teamData?.length) return [];

            const teamSearchResults = searchInCollection(this.teamData, this.search, "name");
            const events = [];

            teamSearchResults.forEach(team => {
                if (!team.event) return;
                let existing = events.find(e => e.eventID === team.event);
                if (!existing) {
                    existing = events[events.push({
                        eventID: team.event?.[0],
                        eventStart: team.event_date?.[0],
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
            }).reverse()?.map(e => e.eventID);

            // return this.events
            //     .map(e => {
            //         if (this.search && this.search.length > 2 && e.teams) {
            //             return {
            //                 ...e,
            //                 teams: searchInCollection(e.teams, this.search, "name")
            //             };
            //         }
            //         return e;
            //     }).filter(e => e.show_in_events && e.teams && e.teams.length !== 0);
        },
        teamData() {
            return ReactiveRoot("special:teams", {
                teams: ReactiveArray("teams")
            })?.teams;
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

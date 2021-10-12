<template>
    <div class="container">
        <h1 class="big mb-3">Teams</h1>
        <input type="text" class="form-control mb-3" placeholder="Start typing to filter" v-model="search">
        <h1><LoadingIcon v-if="!sortedEvents.length"></LoadingIcon></h1>
        <div v-for="event in sortedEvents" v-bind:key="event.id" class="event mb-4">
            <EventDisplay class="team-display" :event="event"/>
            <div class="event-teams d-flex row">
                <div class="team col-6 col-sm-6 col-md-4 col-lg-3 col-xl-2 tight-col" v-for="team in event.teams" v-bind:key="team.id">
                    <TeamDisplay :team="team" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveList, ReactiveThing } from "@/utils/reactive";
import TeamDisplay from "@/views/lists/TeamDisplay";
import EventDisplay from "@/views/lists/EventDisplay";
import { sortEvents } from "@/utils/sorts";
import LoadingIcon from "@/components/website/LoadingIcon";

export default {
    name: "Teams",
    components: {
        LoadingIcon,
        TeamDisplay,
        EventDisplay
    },
    data: function() {
        return {
            search: null
        };
    },
    computed: {
        // teams() {
        //     // return [];
        //     // eslint-disable-next-line no-unreachable
        //     return ReactiveList("Teams", {
        //         theme: ReactiveThing("theme")
        //     });
        // },
        events() {
            return ReactiveList("Events", {
                theme: ReactiveThing("theme"),
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                })
            }).sort((a, b) => sortEvents(a, b))
                .reverse();
        },
        sortedEvents() {
            return this.events
                .map(e => {
                    if (this.search && this.search.length > 2 && e.teams) {
                        return {
                            ...e,
                            teams: e.teams.filter(team => {
                                return [
                                    team.name.toLowerCase()
                                ].some(text => text.indexOf(this.search) !== -1);
                            })
                        };
                    }
                    return e;
                })
                .filter(e => e.show_in_events && e.teams && e.teams.length !== 0);
        }
        // groupedTeams() {
        //     const groups = new Map();
        //     this.teams.forEach(team => {
        //         const key = cleanID(team.event ? (team.event[0]) : "no-event");
        //         const collection = groups.get(key);
        //         if (!collection) {
        //             groups.set(key, [team]);
        //         } else {
        //             collection.push(team);
        //         }
        //     });
        //     return groups;
        // }
    },
    metaInfo() {
        return {
            title: "Teams"
        };
    }
};
</script>

<style scoped>
.tight-col {
    --pad: 6px;
    padding-left: var(--pad);
    padding-right: var(--pad);
    margin: var(--pad) 0;
}
.event-teams.row {
  margin: 0 -6px;
}
</style>

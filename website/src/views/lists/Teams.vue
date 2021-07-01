<template>
    <div class="container">
        <h1 class="big mb-3">Teams</h1>
        <div v-for="event in events" v-bind:key="event.id" class="event mb-4">
            <EventDisplay class="team-display" :event="event"/>
            <div class="event-teams d-flex row">
                <div class="team col-6 col-sm-6 col-md-4 col-lg-3 col-xl-2 tight-col" v-for="team in groupedTeams.get(event.id)" v-bind:key="team.id">
                    <TeamDisplay :team="team" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveList, ReactiveThing } from "@/utils/reactive";
import { cleanID } from "@/utils/content-utils";
import TeamDisplay from "@/views/lists/TeamDisplay";
import EventDisplay from "@/views/lists/EventDisplay";

export default {
    name: "Teams",
    components: {
        TeamDisplay, EventDisplay
    },
    computed: {
        teams() {
            return ReactiveList("Teams", {
                theme: ReactiveThing("theme")
            });
        },
        events() {
            return ReactiveList("Events", {
                theme: ReactiveThing("theme")
            }).filter(event => event.teams).sort((a, b) => {
                if (!a.start_date && !b.start_date) return 0;
                if (!a.start_date) return 1;
                if (!b.start_date) return -1;
                return new Date(a.start_date) - new Date(b.start_date);
            });
        },
        groupedTeams() {
            const groups = new Map();
            this.teams.forEach(team => {
                const key = cleanID(team.event ? (team.event[0]) : "no-event");
                const collection = groups.get(key);
                if (!collection) {
                    groups.set(key, [team]);
                } else {
                    collection.push(team);
                }
            });
            return groups;
        }
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

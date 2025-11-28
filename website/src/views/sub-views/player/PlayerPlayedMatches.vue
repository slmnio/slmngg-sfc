<template>
    <div>
        <div class="container">
            <div class="d-flex flex-center justify-content-between gap-2 w-100">
                <h2 class="m-0">{{ showOnlyWithVODs ? "Match VODs" : "Played Matches" }}</h2>
                <div class="d-flex gap-3 flex-center">
                    <b-form-checkbox v-model="showOnlyWithVODs" switch>Only show matches with VODs</b-form-checkbox>
                    <b-button class="text-nowrap" variant="secondary" size="sm" @click="sortDateAscending = !sortDateAscending">{{ sortDateAscending ? 'Newest' : 'Oldest' }} first <i class="fas ml-1" :class="sortDateAscending ? 'fa-sort-amount-down-alt' : 'fa-sort-amount-down'"></i></b-button>
                </div>
            </div>
            <div class="role-group mt-3">
                <div>
                    <event-match-group
                        v-for="event in events"
                        :key="event.id"
                        class="event-match-group"
                        :event="event?.event"
                        :highlight-teams="event?.highlightTeams"
                        :matches="event?.matches" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Match from "@/components/website/match/Match.vue";
import { sortEvents, sortMatches } from "@/utils/sorts";
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import EventMatchGroup from "@/components/website/EventMatchGroup.vue";
import { getVisibleVod } from "@/utils/content-utils.js";

export default {
    name: "PlayerPlayedMatches",
    components: {
        EventMatchGroup,
        Match
    },
    props: ["player"],
    data: () => ({
        sortDateAscending: false,
        showOnlyWithVODs: false
    }),
    computed: {
        teams() {
            if (!this.player?.member_of?.length) return [];
            return ReactiveArray("member_of", {
                matches: ReactiveArray("matches", {
                    teams: ReactiveArray("teams", {
                        theme: ReactiveThing("theme")
                    }),
                    event: ReactiveThing("event", {
                        theme: ReactiveThing("theme")
                    })
                }),
                "theme": ReactiveThing("theme")
            })(this.player);
        },
        events() {
            if (!this.teams) return [];
            const events = { };

            this.teams.forEach(team => {
                if (!team.matches) return;
                team.matches.forEach(match => {
                    if (!match?.id) return;

                    if (this.showOnlyWithVODs && !getVisibleVod(match)) return;

                    const eventID = match?.event?.id;
                    if (eventID) {
                        if (!events[eventID]) events[eventID] = { event: match.event, matches: [], highlightTeams: [] };
                        events[eventID].matches.push(match);

                        if (!events[eventID].highlightTeams.find(t => t.id === team.id)) {
                            events[eventID].highlightTeams.push(team);
                        }
                    }
                });
            });

            return Object.values(events).map(x => ({
                ...x,
                matches: x.matches.sort(sortMatches)
            })).sort((a,b) => {
                const diff = sortEvents(a.event,b.event);
                return this.sortDateAscending ? -1 * diff : diff;
            });
        }
    }
};
</script>

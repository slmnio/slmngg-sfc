<template>
    <div class="event-schedule container">

        <div class="d-flex w-100 justify-content-end">
            <TimezoneSwapper/>
        </div>

        <div class="schedule-top mb-3">
            <h2 class="text-center">Schedule</h2>
            <ul class="schedule-group-holder nav justify-content-center" v-if="pagedMatches.length > 1">
                <li class="nav-item schedule-group" v-for="(pm) in pagedMatches" v-bind:key="pm.num"
                    v-bind:class="{ 'active': activeScheduleGroup.num === pm.num }">
                    <a @click="activeScheduleNum = pm.num" class="nav-link">{{ pm.text }}</a>
                </li>
            </ul>
        </div>

        <div class="schedule-matches" v-if="activeScheduleGroup">
            <ScheduleMatch v-for="(match, i) in groupMatches" v-bind:key="match.id" :match="match"
                           v-bind:class="i > 0 && getMatchClass(match, groupMatches[i-1])"
            />
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import ScheduleMatch from "@/components/website/ScheduleMatch";
import TimezoneSwapper from "@/components/website/TimezoneSwapper";

export default {
    name: "EventSchedule",
    components: { TimezoneSwapper, ScheduleMatch },
    props: ["event"],
    data: () => ({
        activeScheduleNum: 0
    }),
    computed: {
        matches() {
            if (!this.event || !this.event.matches) return [];
            return ReactiveArray("matches", {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                })
            })(this.event);
        },
        pagedMatches() {
            const groups = {};
            this.matches.forEach(match => {
                const flatWeek = Math.floor(match.week);
                if (!groups[flatWeek]) groups[flatWeek] = { num: flatWeek, text: match.week_text || `Week ${flatWeek}`, matches: [] };
                groups[flatWeek].matches.push(match);
            });
            return Object.values(groups).sort((a, b) => a.num - b.num);
        },
        activeScheduleGroup() {
            let group = this.pagedMatches.find(group => group.num === this.activeScheduleNum);
            if (!group || group.matches.length === 0) {
                // this is where to set the default
                // TODO: make the default page show the next incomplete match
                group = this.pagedMatches[0];
            }
            return group;
        },
        groupMatches() {
            if (!this.activeScheduleGroup) return [];

            return [...this.activeScheduleGroup.matches].sort((a, b) => {
                if (a.week > b.week) return 1;
                if (a.week < b.week) return -1;

                if (a.start === b.start) {
                    if (a.match_number > b.match_number) return 1;
                    if (a.match_number < b.match_number) return -1;
                    return 0;
                }


                if (a.day > b.day) return 1;
                if (a.day < b.day) return -1;

                if (!a.start && !!b.start) return 1;
                if (!!a.start && !b.start) return -1;

                if (a.start > b.start) return 1;
                if (a.start < b.start) return -1;

                return 0;
            });
        }
    },
    methods: {
        getMatchClass(thisMatch, lastMatch) {
            const classes = [];

            if (thisMatch.day !== lastMatch.day) {
                classes.push("day-diff");
            }
            if (thisMatch.week !== lastMatch.week) {
                classes.push("week-diff");
            }

            return Object.fromEntries(classes.map(c => ([c, true])));
        }
    }
};
</script>

<style scoped>
    .nav-item.active .nav-link {
        color: var(--alt)
    }
    .nav-link {
        cursor: pointer;
    }
    .nav-link:hover {
        text-decoration: underline;
    }

    .match.day-diff {
        margin-top: 1.5em !important;
    }
    .match.week-diff {
        margin-top: 2.5em !important;
    }
</style>

<template>
    <div class="event-schedule container">

        <div class="d-sm-flex w-100 justify-content-end timezone-swapper-holder d-none">
            <TimezoneSwapper/>
        </div>

        <div class="schedule-top mb-3">
            <h2 class="text-center">Schedule</h2>
            <ul class="schedule-group-holder nav justify-content-center" v-if="pagedMatches.length > 1">
                <li class="nav-item schedule-group" v-for="(pm) in pagedMatches" v-bind:key="pm.num"
                    v-bind:class="{ 'active': activeScheduleGroup.num === pm.num, 'ct-active': activeScheduleGroup.num === pm.num, 'ct-passive': activeScheduleGroup.num !== pm.num }">
                    <a @click="activeScheduleNum = pm.num" class="nav-link no-link-style">{{ pm.text }}</a>
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
    computed: {
        defaultScheduleNum() {
            const filtered = this.pagedMatches.filter(page => {
                const allMatchesComplete = page.matches.every(m => [m.score_1, m.score_2].includes(m.first_to));
                if (allMatchesComplete) return false; // don't show a page if all of the matches are complete by default

                const anyMatchHasTeams = page.matches.some(m => m.teams);
                if (anyMatchHasTeams) return true; // if there's any matches planned with teams then we should show it

                return false; // catch all
            });

            if (filtered.length) {
                return filtered[0].num;
            }

            // nothing filtered, will show either: latest page or first page depending on if event is in progress
            if (this.event.in_progress) {
                const pagesWithPastMatches = this.pagedMatches.filter(page => page.matches.every(m => m.start && new Date(m.start) < new Date()));
                if (pagesWithPastMatches.length) {
                    return pagesWithPastMatches[pagesWithPastMatches.length - 1].num;
                }
            }

            return 0;
        },
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
        },
        activeScheduleNum: {
            set(newNum) {
                this.$store.commit("setEventMatchPage", {
                    eventID: this.event.id,
                    matchPage: newNum
                });
            },
            get() {
                const lastPage = this.$store.getters.getLastMatchPage(this.event.id);
                if (!lastPage) return this.defaultScheduleNum;
                if (lastPage.matchPage > this.pagedMatches.length) return this.defaultScheduleNum;
                return lastPage.matchPage;
            }
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
    },
    // watch: {
    //     defaultScheduleNum(newNum, oldNum) {
    //         if (oldNum !== newNum && !this.activeScheduleNum) {
    //             this.activeScheduleNum = newNum;
    //         }
    //     }
    // },
    // mounted() {
    //     if (this.defaultScheduleNum && !this.activeScheduleNum) {
    //         this.activeScheduleNum = this.defaultScheduleNum;
    //     }
    // },
    metaInfo() {
        return {
            title: "Schedule"
            // title: this.event?.name ? `Schedule | ${this.event?.name}` : "Schedule"
        };
    }
};
</script>

<style scoped>
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

    @media (max-width: 767px) {
        .timezone-swapper-holder {
            margin-bottom: 1em;
            margin-top: 1.5em;
        }
    }
</style>

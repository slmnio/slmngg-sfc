<template>
    <div class="event-schedule container">

        <div class="d-sm-flex w-100 justify-content-end timezone-swapper-holder d-none">
            <TimezoneSwapper :inline="true" />
            <b-form-group label-cols="auto" label-size="sm" label="Broadcast" v-if="showBroadcastSettings">
                <b-form-select v-if="eventBroadcasts?.length" :options="eventBroadcasts" v-model="selectedBroadcastID" size="sm" class="w-auto"/>
            </b-form-group>
        </div>

        <div class="schedule-top mb-2">
            <h2 class="text-center">Schedule</h2>
            <ul class="schedule-group-holder nav justify-content-center" v-if="pagedMatches.length > 1">
                <li class="nav-item schedule-group" v-for="(pm) in pagedMatches" :key="pm.num"
                    :class="{ 'active': activeScheduleGroup.num === pm.num, 'ct-active': activeScheduleGroup.num === pm.num, 'ct-passive': activeScheduleGroup.num !== pm.num }">
                    <a @click="activeScheduleNum = pm.num" class="nav-link no-link-style">{{ pm.text }}</a>
                </li>

                <li class="nav-item schedule-group nav-link no-link-style" @click="showAll = true"
                    :class="{'active ct-active': showAll === true, 'ct-passive': showAll !== true }">
                    <b>All matches</b>
                </li>
            </ul>
        </div>

        <div class="schedule-filter flex-center text-center mb-2" v-if="showAll">
            <div class="btn btn-sm mx-2" @click="hideCompleted = !hideCompleted" :class="{'btn-light': hideCompleted, 'btn-dark': !hideCompleted}">
                Hide completed matches
            </div>
            <div class="btn btn-sm mx-2" @click="hideNoVods = !hideNoVods" :class="{'btn-light': hideNoVods, 'btn-dark': !hideNoVods}">
                Hide matches without VODs
            </div>
        </div>

        <div class="schedule-matches mt-3" v-if="activeScheduleGroup">
            <ScheduleMatch v-for="(match, i) in groupMatches" :key="match.id" :match="match"
                           :class="i > 0 && getMatchClass(match, groupMatches[i-1])" :custom-text="showAll && match.match_group ? match.match_group : null"
                           :can-edit-matches="showEditorButton" :can-edit-broadcasts="showBroadcastSettings" :selectedBroadcast="selectedBroadcast" />
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveThing, ReactiveRoot } from "@/utils/reactive";
import ScheduleMatch from "@/components/website/schedule/ScheduleMatch";
import TimezoneSwapper from "@/components/website/schedule/TimezoneSwapper";
import { canEditMatch, isEventStaffOrHasRole } from "@/utils/client-action-permissions";
import { useAuthStore } from "@/stores/authStore";

export default {
    name: "EventSchedule",
    components: { TimezoneSwapper, ScheduleMatch },
    props: ["event"],
    data: () => ({
        showAll: false,
        hideCompleted: false,
        hideNoVods: false,
        selectedBroadcastID: null
    }),
    computed: {
        defaultScheduleNum() {
            const filtered = this.pagedMatches.filter(page => {
                const allMatchesComplete = page.matches.every(m => m.special_event || [m.score_1, m.score_2].includes(m.first_to));
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
            if (!this.event?.matches) return [];
            return ReactiveArray("matches", {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                }),
                maps: ReactiveArray("maps")
            })(this.event);
        },
        pagedMatches() {
            const groups = {};
            this.matches.forEach(match => {
                if (!match._original_data_id) return null;
                let flatWeek = Math.floor(match.week);
                if (isNaN(flatWeek)) {
                    flatWeek = 1;
                }
                if (!groups[flatWeek]) groups[flatWeek] = { num: flatWeek, text: match.week_text || `Week ${flatWeek}`, matches: [] };
                groups[flatWeek].matches.push(match);
            });
            return Object.values(groups).sort((a, b) => a.num - b.num);
        },
        activeScheduleGroup() {
            if (this.showAll) {
                return {
                    matches: this.matches.filter(m => {
                        if (this.hideCompleted) {
                            if (m.special_event) {
                                // if it's a special event, it might not have a score. Check to see if it's in the past
                                if (!m.start) return false; // no date no show
                                if (new Date(m.start) < new Date()) return false;
                            }
                            if (m.forfeit) return false;
                            if (m.first_to && [m.score_1, m.score_2].some(score => score === m.first_to)) return false;
                        }

                        if (this.hideNoVods && !m.vod) return false;

                        return true;
                    })
                };
            }

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
                if (this.showAll) {
                    if (a.start > b.start) return 1;
                    if (a.start < b.start) return -1;
                }

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
                this.showAll = false;
                this.hideCompleted = false;
                this.hideNoVods = false;

                this.$store.commit("setEventMatchPage", {
                    eventID: this.event.id,
                    matchPage: newNum
                });
            },
            get() {
                const lastPage = this.$store.getters.getLastMatchPage(this.event.id);
                if (!lastPage) return this.defaultScheduleNum;
                // if (lastPage.matchPage > this.pagedMatches.length) return this.defaultScheduleNum;
                return lastPage.matchPage;
            }
        },
        showEditorButton() {
            const { user } = useAuthStore();
            return canEditMatch(user, { event: this.event });
        },
        _event() {
            return ReactiveRoot(this.event?.id, {
                broadcasts: ReactiveArray("broadcasts")
            });
        },
        eventBroadcasts() {
            return (this._event?.broadcasts || []).map(broadcast => ({
                value: broadcast.id,
                text: broadcast.relative_name || broadcast.name
            }));
        },
        selectedBroadcast() {
            if (!this.selectedBroadcastID) return null;
            return (this._event?.broadcasts || []).find(b => b.id === this.selectedBroadcastID);
        },
        showBroadcastSettings() {
            const { isAuthenticated } = useAuthStore();
            if (isAuthenticated) return false;
            return isEventStaffOrHasRole({
                event: this.event,
                role: "Broadcast Manager",
                websiteRoles: ["Can edit any match", "Can edit any event", "Full broadcast permissions"]
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
                if (!this.showAll) classes.push("week-diff");
            }

            return Object.fromEntries(classes.map(c => ([c, true])));
        }
    },
    watch: {
        eventBroadcasts: {
            deep: true,
            immediate: true,
            handler(broadcasts) {
                if (!broadcasts?.length) return;
                if (!this.selectedBroadcastID) {
                    this.selectedBroadcastID = broadcasts[0]?.value;
                }
            }
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
    head() {
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

    .match-wrapper.day-diff {
        margin-top: 1.5em !important;
    }
    .match-wrapper.week-diff {
        margin-top: 2.5em !important;
    }

    @media (max-width: 767px) {
        .timezone-swapper-holder {
            margin-bottom: 1em;
            margin-top: 1.5em;
        }
    }
</style>

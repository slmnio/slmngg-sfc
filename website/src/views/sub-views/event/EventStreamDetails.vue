<template>
    <div class="event-stream-details container">
        <h3>Stream Details</h3>
        <table class="table-dark table-bordered table table-sm">
            <thead>
                <tr>
                    <th>Team</th>
                    <th>Next match</th>
                    <th v-for="code in distinctStreamCodes" :key="code">{{ code }}</th>
                    <th class="bg-primary text-white">On</th>
                    <th class="bg-danger text-white">Off</th>
                    <th class="bg-secondary text-white">Total</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="({ team, counts, nextMatch }) in teamCounts" :key="team.id">
                    <td class="team">
                        <ThemeLogo
                            :theme="team.theme"
                            logo-size="w-50"
                            class="team-logo"
                            border-width="3px"
                            icon-padding="4px" />
                        <router-link :to="url('team', team)">{{ team.name }}</router-link>
                    </td>
                    <td>
                        <span v-if="nextMatch" class="d-flex">
                            <ThemeLogo
                                :theme="nextMatch.opponent.theme"
                                logo-size="w-50"
                                class="team-logo"
                                border-width="3px"
                                icon-padding="4px" />
                            <router-link :to="url('detailed', nextMatch)">vs {{ nextMatch.opponent.name }}</router-link>
                            <span class="d-inline-flex ml-auto">{{
                                formatTime(nextMatch.start, {
                                    format: "{day-short} {date-ordinal} {month-short} {time}",
                                    tz: useSettingsStore().timezone,
                                    use24HourTime: useSettingsStore().use24HourTime
                                })
                            }}</span>
                        </span>
                    </td>
                    <td v-for="code in distinctStreamCodes" :key="code" class="count">
                        <span :class="{'low-opacity': !counts[code]}">{{ counts[code] || 0 }}</span>
                    </td>
                    <td class="count">
                        <span :class="{'low-opacity': !counts.Streamed}">{{ counts.Streamed || 0 }}</span>
                    </td>
                    <td
                        class="count"
                        :class="{'bg-danger': counts.Off === counts.Total && counts.Off > 0}">
                        <span :class="{'low-opacity': !counts.Off}">{{ counts.Off || 0 }}</span>
                    </td>
                    <td class="count">
                        <span :class="{'low-opacity': !counts.Total}">{{ counts.Total || 0 }}</span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { formatTime, url } from "@/utils/content-utils";
import ThemeLogo from "@/components/website/ThemeLogo.vue";
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import { sortMatches } from "@/utils/sorts";
import { useSettingsStore } from "@/stores/settingsStore";

export default {
    name: "EventStreamDetails",
    components: { ThemeLogo },
    props: {
        event: {}
    },
    computed: {
        distinctStreamCodes() {
            const codes = new Set();
            (this.event?.matches || []).forEach(match => {
                if (match.stream_code) {
                    codes.add(match.stream_code);
                }
            });
            return [...codes.values()].filter(code => !["Off", "Total"].includes(code)).sort((a, b) => a.localeCompare(b));
        },
        teams() {
            return ReactiveArray("teams", {
                matches: ReactiveArray("matches", {
                    teams: ReactiveArray("teams", {
                        theme: ReactiveThing("theme")
                    }),
                    player_relationships: ReactiveArray("player_relationships")
                }),
                theme: ReactiveThing("theme")
            })(this.event);
        },
        teamCounts() {
            return (this.teams || []).filter(team => team.matches).map(team => {
                const counts = {
                    Off: 0,
                    Total: 0,
                    Streamed: 0
                };
                team.matches.forEach(match => {
                    if (!match) return;
                    counts.Total++;
                    if (match.stream_code) {
                        if (!counts[match.stream_code]) counts[match.stream_code] = 0;
                        counts[match.stream_code]++;
                    } else if ((match.player_relationships || []).find(rel => ["Producer", "Observer"].includes(rel?.singular_name))) {
                        counts.Streamed++;
                    } else {
                        counts.Off++;
                    }
                });

                const nextMatch = team.matches.filter(m => (![m.score_1, m.score_2].includes(m.first_to)) && (m?.teams?.length === 2)).sort(sortMatches)?.[0];
                if (nextMatch) {
                    nextMatch.opponent = nextMatch.teams.find(t => t.id !== team.id);
                }

                if (counts.Total) counts.Streamed = counts.Total - counts.Off;

                return {
                    team,
                    counts,
                    nextMatch
                };
            }).sort((a, b) => {
                if ((a.counts.Streamed || 0) > (b.counts.Streamed || 0)) return -1;
                if ((a.counts.Streamed || 0) < (b.counts.Streamed || 0)) return 1;
                // if (a.counts.Off > b.counts.Off) return -1;
                // if (a.counts.Off < b.counts.Off) return 1;
                if ((a.counts.A || 0) > (b.counts.A || 0)) return -1;
                if ((a.counts.A || 0) < (b.counts.A || 0)) return 1;
                if ((a.counts.B || 0) > (b.counts.B || 0)) return -1;
                if ((a.counts.B || 0) < (b.counts.B || 0)) return 1;

                return 0;
            });
        }
    },
    methods: { useSettingsStore, formatTime, url }
};
</script>

<style scoped>
    .low-opacity {
        opacity: 0.25;
    }
    .team {
        padding: 0 .5em;
        vertical-align: middle;
    }
    .team-logo {
        display: inline-flex;
        height: 1.5em;
        width: 1.8em;
        margin-right: .5em;
    }
    .count {
        min-width: 2em;
    }
</style>

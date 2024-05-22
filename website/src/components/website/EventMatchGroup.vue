<template>
    <div class="event-match-group d-flex flex-column" :class="{'showing': showMatches}">
        <div class="group-header d-flex gap-2 split-contents" @click="showMatches = !showMatches">
            <div class="header-left d-flex gap-2">
                <theme-logo
                    class="event-logo"
                    :theme="event?.theme"
                    logo-size="w-64"
                    icon-padding="5px"
                    border-width="2px" />
                <div class="event-name industry-align">
                    <router-link :to="url('event', event)">{{ event?.name }}</router-link>
                </div>
            </div>
            <div class="header-right industry-align text-right d-flex gap-2">
                <div v-if="event?.start_date" class="event-date text-nowrap">{{ eventDate(event?.start_date) }}</div>
                <div v-if="event?.start_date">&middot;</div>
                <div class="match-count fw-bold text-nowrap">{{ matches?.length }} {{ matches?.length === 1 ? 'match' : 'matches' }}</div>
                <div class="dropdown mx-2">
                    <i class="fas fa-chevron-down" :class="{'fa-rotate-180': showMatches, 'opacity-50': !loaded}"></i>
                </div>
            </div>
        </div>
        <div v-if="showMatches">
            <table class="group-body bg-dark table-sm table-dark table mb-0">
                <tbody>
                    <tr
                        v-for="match in hydratedMatches"
                        :key="match?.id"
                        class="match">
                        <td class="match-date text-nowrap">{{ match?.start ? formatTime(match.start, { format: "{day-short} {date-ordinal} {month-short} {year}" }) : '' }}</td>
                        <td class="match-date text-nowrap">{{ match?.start ? formatTime(match.start, { format: "{time} {tz}" }) : '' }}</td>
                        <td>
                            <div v-if="match?.sub_event" class="match-group">{{ match?.sub_event }}</div>
                        </td>
                        <td class="match-left">
                            <div class="d-flex gap-2">
                                <div class="match-title">
                                    <router-link :to="url('match', match)">{{ matchName(match) }}</router-link>
                                </div>
                                <div v-if="match?.round">&middot;</div>
                                <div v-if="match?.round" class="match-group">{{ match?.round }}</div>
                            </div>
                        </td>
                        <td class="match-right">
                            <div class="match-vod text-nowrap">
                                <a v-if="match?.vod" :href="match.vod" target="_blank">VOD</a>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import spacetime from "spacetime";
import ThemeLogo from "@/components/website/ThemeLogo.vue";
import { ReactiveArray, ReactiveRoot } from "@/utils/reactive";
import { formatTime, url } from "@/utils/content-utils";

export default {
    name: "EventMatchGroup",
    components: { ThemeLogo },
    props: ["event", "matches"],
    data: () => ({
        showMatches: false,
        loaded: false
    }),
    computed: {
        hydratedMatches() {
            return this.matches.map(m => {
                return ReactiveRoot(m.id, {
                    "teams": ReactiveArray("teams")
                });
            });
        }
    },
    methods: {
        url,
        matchName(match) {
            if (match.special_event || !match?.teams?.length) return match.custom_name;
            return (match.teams || []).map(t => t.name).join(` ${match.score_1 || 0} - ${match.score_2 || 0} `);
        },
        eventDate(date) {
            if (!date) return "";
            return spacetime(date).format("{month} {year}");
        },
        formatTime
    },
    watch: {
        showMatches(loaded) {
            if (loaded) this.loaded = loaded;
        }
    }
};
</script>

<style scoped>
    .event-match-group {
        line-height: 1;
        background-color: rgba(255,255,255,0.05);
        margin: 2px 0;
        padding: 2px 4px;
        cursor: pointer;
    }
    .event-match-group.showing {
        background-color: rgba(255,255,255,0.1);
    }
    .split-contents {
        justify-content: space-between;
    }
    .group-header, .header-left {
        align-items: center;
    }
    .event-logo {
        height: 32px;
        width: 37px;
    }
    .opacity-50 {
        opacity: 0.5;
    }
</style>

<template>
    <div class="match-history">
        <h1 v-if="!hideMapDisplay">Map Head To Head</h1>
        <div class="settings flex w-100 justify-content-end mb-2">
            <b-form-checkbox v-if="match.sub_event" v-model="filterSubEvent">
                Only show maps from sub event <b>{{ match.sub_event }}</b>
            </b-form-checkbox>
            <b-form-checkbox v-if="match.match_group" v-model="filterMatchGroup">
                Only show maps from group <b>{{ match.match_group }}</b>
            </b-form-checkbox>
            <b-form-checkbox v-model="showUnplayedMaps">
                Show maps that were scheduled but not played
            </b-form-checkbox>
        </div>
        <div class="text-light">
            <div v-for="(mapType, i) in mapGroups" :key="i" class="map-type">
                <div class="title">
                    <h3>{{ mapType.name }}</h3>
                </div>
                <div>
                    <table class="w-100">
                        <tbody>
                            <MatchMapStats
                                v-for="map in mapType.maps"
                                :key="map.id"
                                :data="_getTeamMapStats(map)"
                                :map="map"
                                :show-unplayed-maps="showUnplayedMaps" />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <h2 v-if="!hideMapDisplay && match?.maps?.length" class="text-center mt-4">This match</h2>
        <div v-if="!hideMapDisplay && match?.maps?.length" class="this-match-maps d-flex flex-center align-items-start">
            <MapDisplay v-for="map in match.maps" :key="map.id" :map="map" :match="match" />
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import { getTeamsMapStats } from "@/utils/content-utils";
import MatchMapStats from "@/components/website/match/MatchMapStats";
import MapDisplay from "@/components/website/match/MapDisplay";

export default {
    name: "MatchStats",
    components: { MapDisplay, MatchMapStats },
    props: ["match", "hideMapDisplay"],
    data: () => ({
        filterSubEvent: false,
        filterMatchGroup: true,
        showUnplayedMaps: false
    }),
    computed: {
        pool() {
            if (!this.match?.event?.map_pool) return [];
            return ReactiveArray("map_pool")(this.match.event);
        },
        mapGroups() {
            if (!this.pool) return [];

            const groups = [];

            this.pool.forEach(map => {
                let group = groups.find(g => g.name === map.type);
                if (!group) group = groups[groups.push({ name: map.type, maps: [] }) - 1];
                group.maps.push(map);
            });
            return groups;
        },
        teams() {
            if (!this.match?.teams) return [];
            return ReactiveArray("teams", {
                theme: ReactiveThing("theme"),
                matches: ReactiveArray("matches", {
                    maps: ReactiveArray("maps")
                })
            })(this.match);
        }
    },
    methods: {
        _getTeamMapStats(requestMap) {
            return getTeamsMapStats(this.teams, this.match, requestMap, {
                sub_event: this.filterSubEvent && this.match.sub_event,
                match_group: this.filterMatchGroup && this.match.match_group
            });
        }
    }
};
</script>

<style scoped>
</style>

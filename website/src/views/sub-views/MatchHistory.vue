<template>
    <div class="match-history">
        <h1 v-if="!hideMapDisplay">Map Head To Head</h1>
        <div class="settings flex w-100 justify-content-end mb-2">
            <b-form-checkbox v-if="match.sub_event" v-model="filterSubEvent">
                Only show maps from sub event <b>{{ match.sub_event}}</b>
            </b-form-checkbox>
            <b-form-checkbox v-if="match.match_group" v-model="filterMatchGroup">
                Only show maps from group <b>{{ match.match_group}}</b>
            </b-form-checkbox>
            <b-form-checkbox v-model="showUnplayedMaps">
                Show maps that were scheduled but not played
            </b-form-checkbox>
        </div>
        <div class="text-light">
            <div class="map-type" v-for="(mapType, i) in mapGroups" :key="i">
                <div class="title">
                    <h3>{{ mapType.name }}</h3>
                </div>
                <div>
                    <table class="w-100">
                        <MatchMapHistory v-for="map in mapType.maps" :key="map.id" :data="_getTeamMapStats(map)" :map="map" :show-unplayed-maps="showUnplayedMaps" />
                    </table>
                </div>
            </div>
        </div>

        <h2 v-if="!hideMapDisplay" class="text-center mt-4">This match</h2>
        <div v-if="!hideMapDisplay" class="this-match-maps d-flex flex-center align-items-start">
            <MapDisplay v-for="map in match.maps" :map="map" :key="map.id" :match="match"/>
        </div>


    </div>
</template>

<script>
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import { getTeamsMapStats } from "@/utils/content-utils";
import MatchMapHistory from "@/components/website/match/MatchMapHistory";
import MapDisplay from "@/components/website/match/MapDisplay";

export default {
    name: "MatchHistory",
    props: ["match", "hideMapDisplay"],
    components: { MapDisplay, MatchMapHistory },
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

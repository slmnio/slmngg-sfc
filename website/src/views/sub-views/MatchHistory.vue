<template>
    <div class="match-history">
        <h1>Map Head To Head</h1>
        <div class="text-light">
            <div class="map-type" v-for="(mapType, i) in mapGroups" :key="i">
                <div class="title">
                    <h3>{{ mapType.name }}</h3>
                </div>
                <div>
                    <table class="w-100">
                        <MatchMapHistory v-for="map in mapType.maps" :key="map.id" :data="_getTeamMapStats(map)" :map="map" />
                    </table>
                </div>
            </div>
        </div>

        <h2 class="text-center mt-4">This match</h2>
        <div class="this-match-maps d-flex flex-center align-items-start">
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
    props: ["match"],
    components: { MapDisplay, MatchMapHistory },
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
            return getTeamsMapStats(this.teams, this.match, requestMap);
        }
    }
};
</script>

<style scoped>
</style>

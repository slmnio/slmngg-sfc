<template>
    <div class="match-history">
        <h1>Map Head To Head</h1>
        <div class="text-light">
            <div class="map-type" v-for="(mapType, i) in mapGroups" v-bind:key="i">
                <div class="title">
                    <h3>{{ mapType.name }}</h3>
                </div>
                <div>
                    <table class="w-100">
                        <MatchMapHistory v-for="map in mapType.maps" v-bind:key="map.id" :data="getTeamMapStats(map)" :map="map" />
                    </table>
                </div>
            </div>
        </div>

        <h2 class="text-center mt-4">This match</h2>
        <div class="this-match-maps d-flex flex-center">
            <MapDisplay v-for="map in match.maps" :map="map" v-bind:key="map.id"/>
        </div>


    </div>
</template>

<script>
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import { cleanID } from "@/utils/content-utils";
import MatchMapHistory from "@/components/website/MatchMapHistory";
import MapDisplay from "@/components/website/MapDisplay";

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
        getTeamMapStats(requestMap) {
            if (!this.teams) return null;
            const stats = this.teams.map(team => {
                const stat = {
                    played: 0,
                    wins: 0,
                    losses: 0,
                    draws: 0
                };

                (team.matches || []).forEach(match => {
                    (match.maps || []).forEach(matchMap => {
                        if (!matchMap.map) return; // no proper map data
                        if (requestMap.id !== cleanID(matchMap.map[0])) return; // isn't this map
                        if (!(matchMap.draw || matchMap.winner)) return; // wasn't played fully

                        // woo right map

                        stat.played++;
                        if (matchMap.draw) {
                            stat.draws++;
                        } else {
                            // determine winner
                            if (cleanID(matchMap.winner[0]) === team.id) {
                                stat.wins++;
                            } else {
                                stat.losses++;
                            }
                        }
                    });
                });
                return { stats: stat, team };
            });

            return {
                stats,
                meta: {
                    eitherTeamPlayed: stats.some(t => t.played > 0)
                }
            };
        }
    }
};
</script>

<style scoped>
</style>
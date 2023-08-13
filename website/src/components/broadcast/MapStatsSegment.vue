<template>
    <div class="map-stats-segment">
        <MapSegment class="map-segment" :broadcast="broadcast" :map="map" :basic="true" />
<!--        <div class="records-header">{{ mapGroup.name }} Stats</div>-->

        <div class="map-records" v-if="mapGroup && !map?.hide_records">
            <div class="record-map" v-for="map in mapGroup.maps" :key="map.id">
                <div class="map-name">{{ map.name }}</div>
                <div class="team-stats flex-center w-100" v-if="mapStats(map)">
                    <div :style="{ order: i * 2 }" class="team-stat flex-center" v-for="(teamStats, i) in mapStats(map).stats" :key="teamStats.team.id" :class="{'right': i === 1}">
                        <ThemeLogo logo-size="h-50" class="team-logo" :theme="teamStats.team.theme" border-width="0px"></ThemeLogo>
                        <div class="team-stats-box" :class="{'opacity-50': teamStats.stats.played === 0}" :style="(teamStats.stats.score_winner && teamStats.stats.played) ? logoBackground1(teamStats.team) : {}">
                            {{ teamStats.stats | wld }}
                        </div>
                    </div>
                    <MapStatsBar class="stats-bar" :stats="mapStats(map).stats"></MapStatsBar>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import MapSegment from "@/components/broadcast/MapSegment";
import { getTeamsMapStats } from "@/utils/content-utils";
import { ReactiveArray } from "@/utils/reactive";
import ThemeLogo from "@/components/website/ThemeLogo";
import MapStatsBar from "@/components/broadcast/MapStatsBar";
import { logoBackground1 } from "@/utils/theme-styles";
export default {
    name: "MapStatsSegment",
    components: { ThemeLogo, MapSegment, MapStatsBar },
    props: ["map", "broadcast", "match"],
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
        mapGroup() {
            if (!this.map || !this.mapGroups.length) return null;
            const group = this.mapGroups.find(group => group.name === this.map.type?.[0]);
            if (!group) return null;
            if (!this.map.dummy) {
                group.maps = group.maps.sort((a, b) => a.name === this.map.name?.[0] ? -1 : (b.name === this.map.name?.[0] ? 1 : 0));
                group.thisMap = true;
            }
            return group;
        }
    },
    methods: {
        mapStats(map) {
            return getTeamsMapStats(this.match.teams, this.match, map);
        },
        logoBackground1
    },
    filters: {
        wld(stats) {
            const str = [
                stats.wins,
                stats.losses
            ];
            if (stats.draws) str.push(stats.draws);
            return str.join("-");
        }
    }
};
</script>

<style scoped>

    .map-stats-segment {
        display: flex;
        flex-direction: column;
    }
    .map-segment {
        height: 33%;
        width: 100% !important;
        margin: 0;
    }

    .map-records {
        margin-top: 1em;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        flex-grow: 1;
    }
    .team-logo {
        height: 3em;
        width: 3em;
    }
    .team-stat {
        flex-shrink: 0;
    }
    .team-stat.right {
        flex-direction: row-reverse;
    }

    .map-name {
        background-color: #333;
        font-size: 24px;
        text-align: center;
    }


    .team-stats-box {
        font-size: 20px;
        letter-spacing: 2px;
        font-variant-numeric: tabular-nums;
        padding: 3px 6px;
        margin: 0 4px;
        text-align: center;
    }

    .stats-bar {
        order: 1;
        width: 100%;
        height: 1em;
        margin: 0 .5em
    }

    .opacity-50 {
        opacity: 0.5;
    }

    .record-map + .record-map {
        margin-top: .5em;
    }

    .map-segment >>> .map-bg {
        transform: translate(0, -15%);
    }

</style>

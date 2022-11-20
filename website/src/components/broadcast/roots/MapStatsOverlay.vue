<template>
    <GenericOverlay class="map-stats-overlay" :title="title || 'Map Stats'">
        <div class="maps d-flex w-100 h-100">
            <MapStatsSegment :match="match" :broadcast="broadcast" class="map w-100" :map="map" v-for="map in mapSlots" :key="map.id"/>
        </div>
    </GenericOverlay>
</template>

<script>
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { DefaultMapImages, likelyNeededMaps } from "@/utils/content-utils";
import MapStatsSegment from "@/components/broadcast/MapStatsSegment";
export default {
    name: "MapStatsOverlay",
    components: { MapStatsSegment, GenericOverlay },
    props: ["broadcast", "client", "title"],
    computed: {
        match() {
            if (!this.broadcast?.live_match?.[0]) return null;
            return ReactiveRoot(this.broadcast?.live_match?.[0], {
                event: ReactiveThing("event"),
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme"),
                    matches: ReactiveArray("matches", {
                        maps: ReactiveArray("maps")
                    })
                }),
                maps: ReactiveArray("maps", {
                    map: ReactiveThing("map"),
                    picker: ReactiveThing("picker", {
                        theme: ReactiveThing("theme")
                    }),
                    banner: ReactiveThing("banner", {
                        theme: ReactiveThing("theme")
                    }),
                    winner: ReactiveThing("winner", {
                        theme: ReactiveThing("theme")
                    })
                })
            });
        },
        mapTypes() {
            if (!this.broadcast?.map_set) return [];
            return this.broadcast.map_set.split(",");
        },
        mapSlots() {
            if (!this.match) return [];
            // just like the maps overlay, either the set maps or map type from broadcast

            const needMaps = likelyNeededMaps(this.match);

            let maps = [...(this.match?.maps || [])].filter(m => m.map);
            if (!this.showBannedMaps) {
                maps = maps.filter(m => !(m.banner || m.banned));

                if (this.match?.first_to) {
                    maps = maps.slice(0, needMaps);
                }
            }


            const dummyMapCount = needMaps - maps.length;
            console.log("extra maps", this.mapCount, dummyMapCount);
            const initialMapCount = maps.length;

            const next = maps.find(m => !m.winner && !m.draw && !m.banner);
            if (next) next._next = true;

            if (!this.match?.first_to) return maps;

            if (dummyMapCount > 0) {
                for (let i = 0; i < dummyMapCount; i++) {
                    const num = initialMapCount + i;
                    if (this.mapTypes[num]) {
                        maps.push({
                            dummy: true,
                            ...(this.mapTypes ? {
                                name: [this.mapTypes && this.mapTypes[num]],
                                type: [this.mapTypes && this.mapTypes[num]],
                                image: [{ url: DefaultMapImages[this.mapTypes[num]] }]
                            } : {})
                        });
                    }
                }
            }

            return maps;
        }
    }
};
</script>

<style scoped>
    .maps {
        gap: 3em
    }
</style>

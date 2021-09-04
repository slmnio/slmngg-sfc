<template>
    <GenericOverlay class="maps-overlay" v-if="match" :title="title || 'Map Set'" :accent-color="accentColor.theme">
        <div class="map-display d-flex w-100 h-100">
            <BroadcastMapDisplay class="map" v-for="map in maps" v-bind:key="map.id" :map="map" :accent-color="accentColor"></BroadcastMapDisplay>
        </div>
    </GenericOverlay>
</template>

<script>
import GenericOverlay from "@/components/broadcast/GenericOverlay";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import BroadcastMapDisplay from "@/components/broadcast/BroadcastMapDisplay";
export default {
    name: "MapsOverlay",
    components: { BroadcastMapDisplay, GenericOverlay },
    props: ["broadcast", "title"],
    computed: {
        event() {
            if (!this.broadcast || !this.broadcast.event) return null;
            return ReactiveRoot(this.broadcast.event.id, {
                theme: ReactiveThing("theme"),
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                })
            });
        },
        accentColor() {
            if (!this.event || !this.event.theme) return {};
            return {
                theme: this.event.theme.color_theme,
                text_on_theme: this.event.theme.color_text_on_theme
            };
        },
        match() {
            if (!this.broadcast?.live_match) return null;
            return ReactiveRoot(this.broadcast.live_match[0], {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                }),
                maps: ReactiveArray("maps", {
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
        maps() {
            const images = {
                Assault: "https://cdn.discordapp.com/attachments/855517740914573342/868231135224819743/44684849494984.png",
                Escort: "https://cdn.discordapp.com/attachments/855517740914573342/868231132444000276/484444884949494949494948421651615641.png",
                Hybrid: "https://cdn.discordapp.com/attachments/855517740914573342/868231133765201950/448489494949849494949494949494949.png",
                Control: "https://cdn.discordapp.com/attachments/855517740914573342/868230457622396928/63541654456789487695.png",
                Spike: "https://cdn.discordapp.com/attachments/880305022716481639/883811894463447110/newspikeplant.png",
                SpikeRush: "https://cdn.discordapp.com/attachments/880305022716481639/883809271198924840/spikerush_default.png",
                ValDeathmatch: "https://cdn.discordapp.com/attachments/880305022716481639/883809264261529670/valdeathmatch_default.png"
            };
            if (!this.match?.maps) {
                const maps = [];
                for (let i = 0; i < this.mapCount; i++) {
                    maps.push({ dummy: true, ...(this.mapTypes ? { name: [this.mapTypes && this.mapTypes[i]], image: [{ url: images[this.mapTypes[i]] }] } : {}) });
                }
                return maps;
            }
            const maps = [...this.match.maps].filter(m => m.map);
            const dummyMapCount = this.mapCount - maps.length;
            console.log("extra maps", dummyMapCount);
            const initialMapCount = maps.length;

            if (dummyMapCount > 0) {
                for (let i = 0; i < dummyMapCount; i++) {
                    const num = initialMapCount + i;
                    maps.push({ dummy: true, ...(this.mapTypes ? { name: [this.mapTypes && this.mapTypes[num]], image: [{ url: images[this.mapTypes[num]] }] } : {}) });
                }
            }
            return maps;
        },
        mapCount() {
            if (!this.match) return 0;
            /* how many # of maps on screen */
            // minimum: first to
            // maximum: current maps + however many to get a win
            //          or current + 1 if no winner
            // if (!this.match.maps) return this.match.first_to;
            const scores = [this.match.score_1, this.match.score_2].map(s => s || 0);

            if (scores.some(s => s === this.match.first_to)) {
                // match complete
                if (this.match.maps) return (this.match.maps || []).length;
                return scores[0] + scores[1];
            }

            const toWin = scores.map(s => this.match.first_to - s);
            console.log("each team maps to win", toWin);
            return (scores[0] + scores[1]) + Math.min(...toWin);
        }
    }
};
</script>

<style scoped>
    .map:first-of-type {
        margin-left: 0;
    }
    .map:last-of-type {
        margin-right: 0;
    }
</style>

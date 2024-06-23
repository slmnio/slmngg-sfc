<template>
    <div class="ingame-maps flex-center">
        <div v-for="map in maps" :key="map.id" class="map flex-center">
            <div class="box flex-center default-thing" :style="map?.boxCSS">
                <div class="box-image bg-center" :style="map?.boxImageCSS"></div>
            </div>
            <div class="map-text industry-align">{{ map?.text }}</div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { likelyNeededMaps, MapTypeIcons } from "@/utils/content-utils";
import { bg, resizedImage } from "@/utils/images";
import { logoBackground } from "@/utils/theme-styles";

export default {
    name: "IngameMaps",
    props: ["match", "broadcast"],
    computed: {
        mapTypes() {
            if (!this.broadcast?.map_set) return [];
            return this.broadcast.map_set.split(",").slice(0, likelyNeededMaps(this.hydratedMatch));
        },
        hydratedMatch() {
            if (!this.match?.id) return null;
            return ReactiveRoot(this.match?.id, {
                "teams": ReactiveArray("teams", {
                    "theme": ReactiveThing("theme")
                }),
                "maps": ReactiveArray("maps", {
                    "map": ReactiveThing("map"),
                    "winner": ReactiveThing("winner", {
                        "theme": ReactiveThing("theme")
                    })
                })
            });
        },
        maps() {
            const maps = [];
            const setMaps = (this.hydratedMatch?.maps || []).filter(m => !m?.banner);

            for (let i = 0; i < Math.max(this.mapTypes.length, setMaps?.length); i++) {
                const presetType = this.mapTypes?.[i];
                const setMap = setMaps?.[i];
                console.log(presetType, setMap);

                if (!setMap && presetType) {
                    maps.push({
                        dummy: true,
                        text: presetType,
                        boxCSS: { },
                        boxImageCSS: bg(MapTypeIcons[presetType])
                    });
                } else if (setMap) {
                    if (setMap?.winner) {
                        // use winner
                        maps.push({
                            text: setMap?.map?.shorter_name || setMap?.map?.name || presetType,
                            boxCSS: logoBackground(setMap?.winner?.theme),
                            boxImageCSS: resizedImage(setMap?.winner?.theme, ["small_logo", "default_logo"], "s-100")
                        });
                    } else if (setMap?.draw) {
                        // use grey?
                        maps.push({
                            text: setMap?.map?.shorter_name || setMap?.map?.name || presetType,
                            boxCSS: {
                                backgroundColor: "#aaaaaa"
                            },
                            boxImageCSS: bg(MapTypeIcons[setMap?.map?.type || presetType])
                        });
                    } else {
                        // not complete
                        maps.push({
                            text: setMap?.map?.shorter_name || setMap?.map?.name || presetType,
                            boxCSS: {
                            },
                            boxImageCSS: bg(MapTypeIcons[setMap?.map?.type || presetType])
                        });
                    }
                }

            }

            return maps;
        }
    },
};
</script>

<style scoped>
    .ingame-maps {
        display: flex;
        justify-content: space-between;
        font-weight: bold;
        text-transform: uppercase;
        font-size: 16px;
        --height: 31px;
        overflow: hidden;
    }
    .box {
        height: var(--height);
        width: var(--height);
        flex-shrink: 0;
        /*background-color: rgba(255,255,255,0.2);*/
    }

    .box-image {
        width: 80%;
        height: 80%;
    }

    .map-text {
        padding: 0 0.4em;
    }

    .map {
    }
</style>

<template>
    <div class="match-scoreboard w-100">
        <transition name="scoreboard-fade">
            <div class="scoreboard-row scoreboard-header" v-if="shouldAnimate">
                <div class="scoreboard-team blank"></div>
                <div class="map flex-center map-type bg-center" v-for="map in maps" :key="map.id"
                     :style="bg(mapTypeIcon(map))"></div>
            </div>
        </transition>
        <ThemeTransition class="scoreboard-team-transition" :active="shouldAnimate" v-for="(team, ti) in match.teams"
                         :key="team.id" :theme="team?.theme" :border-width="6" border="x">
            <div class="scoreboard-row team-row">
                <div class="scoreboard-team" :style="logoBackground1(team)">
                    <ThemeLogo class="team-logo" :theme="team?.theme" border-width="0px" logo-size=""/>
                    <Squeezable class="team-name flex-center" align="center">
                        <div class="industry-align">{{ team.name }}</div>
                    </Squeezable>
                </div>
                <!-- :style="cleanID(map.winner?.[0]) === team.id ? themeBackground1(team) : {}" -->
                <div class="map flex-center map-score" v-for="map in maps" :key="map.id"
                     :class="{ 'map-won': cleanID(map.winner?.[0]) === team.id }">
                    <div class="industry-align">{{ !map.showNumbers ? "-" : (map[`score_${ti + 1}`] || 0) }}</div>
                </div>
                <div class="match-score flex-center"
                     :style="match[`score_${ti + 1}`] === match.first_to ? themeBackground1(team) : {}">
                    <div class="industry-align">{{ match[`score_${ti + 1}`] || 0 }}</div>
                </div>
            </div>
        </ThemeTransition>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { cleanID, DefaultMapImages, likelyNeededMaps, MapTypeIcons } from "@/utils/content-utils";
import { logoBackground1, themeBackground1 } from "@/utils/theme-styles";
import ThemeLogo from "@/components/website/ThemeLogo.vue";
import Squeezable from "@/components/broadcast/Squeezable.vue";
import ThemeTransition from "@/components/broadcast/ThemeTransition.vue";
import { bg } from "@/utils/images";

export default {
    name: "MatchScoreboard",
    components: {
        ThemeTransition,
        Squeezable,
        ThemeLogo
    },
    methods: {
        themeBackground1,
        logoBackground1,
        cleanID,
        bg,
        mapTypeIcon(map) {
            if (map.map?.type) return MapTypeIcons[map.map.type];
            if (!this.mapTypes) return null;
            const mapIndex = this.maps.indexOf(map);
            return MapTypeIcons[this.mapTypes[mapIndex]];
        }
    },
    props: ["match", "active", "broadcast", "animateOnMount"],
    data: () => ({
        manualAnimate: null
    }),
    computed: {
        shouldAnimate() {
            if (this.animateOnMount) {
                if (this.manualAnimate === true || this.manualAnimate === false) return this.manualAnimate;
            }
            return this.active;
        },
        maps() {
            const maps = (ReactiveRoot(this.match.id, {
                maps: ReactiveArray("maps", {
                    map: ReactiveThing("map")
                })
            })?.maps || []).map(map => ({
                ...map,
                showNumbers: map.draw || map.winner
            }));

            const dummyMapCount = likelyNeededMaps(this.match) - maps.length;
            console.log("extra maps", this.mapCount, dummyMapCount);
            const initialMapCount = maps.length;

            if (!this.match?.first_to) return maps;

            if (dummyMapCount > 0) {
                for (let i = 0; i < dummyMapCount; i++) {
                    const num = initialMapCount + i;
                    if (this.mapTypes[num]) {
                        maps.push({
                            dummy: true,
                            ...(this.mapTypes ? {
                                name: this.mapTypes && this.mapTypes[num],
                                image: [{ url: DefaultMapImages[this.mapTypes[num]] }]
                            } : {}),
                            map: {
                                type: this.mapTypes && this.mapTypes[num]
                            },
                            showNumbers: false
                        });
                    }
                }
            }
            return maps;
        },
        mapTypes() {
            if (!this.broadcast?.map_set) return [];
            return this.broadcast.map_set.split(",");
        }
    },
    beforeMount() {
        if (this.animateOnMount) {
            this.manualAnimate = false;
        }
    },
    mounted() {
        console.log("Scoreboard mounted");
        this.manualAnimate = false;
        this.$nextTick(() => {
            this.manualAnimate = null;
        });
    }
};
</script>

<style scoped>
.scoreboard-row,
.scoreboard-team {
    display: flex;
}

.scoreboard-header {
    border-left: 7px solid transparent;
}

.scoreboard-row.team-row {
    background-color: white;
    color: black;
    width: fit-content;
}

.team-logo {
    height: 70px;
    width: 90px;
}

.scoreboard-team {
    width: 400px;
    margin-right: .5em
}


.team-name {
    font-size: 42px;
    text-transform: uppercase;
    margin-left: .2em;
    margin-right: .3em;
}

.map,
.match-score {
    width: 70px;
    /*margin: 0 2px;*/
}

.map-score,
.match-score {
    font-size: 42px;
}

/*.map.map-type {*/
/*    background-color: black;*/
/*    color: white;*/
/*}*/
.map-type {
    height: 30px;
    background-size: 25px;
    filter: invert(1);
    margin-bottom: 4px;
    /*background-color: rgba(255,255,255,0.2);*/
}

.match-score {
    margin-left: .25em;
}

.map-score:not(.map-won) {
    font-weight: 400;
}

.match-score {
    font-weight: 900;
}

.scoreboard-team-transition {
    width: fit-content;
}


.scoreboard-clip-right-enter-active {
    transition: all 2s ease;
    overflow: hidden
}

.scoreboard-clip-right-enter {
    clip-path: polygon(0 0, 0 0, 0 100%, 0% 100%);
}

.scoreboard-clip-right-enter-to {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
}

.scoreboard-fade-enter-active {
    transition: all .2s ease;
    transition-delay: .75s;
}

.scoreboard-fade-enter {
    opacity: 0;
}

.scoreboard-fade-enter-to {
    opacity: 1;
}

.map {
    position: relative;
}

.team-row .map ~ .map:before {
    content: "";
    position: absolute;
    background-color: rgba(0, 0, 0, 0.1);
    right: 100%;
    width: 2px;
    height: 60%;
}</style>

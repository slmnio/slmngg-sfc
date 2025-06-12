<template>
    <GenericOverlay class="hero-priority-overlay" :title="title || 'Hero Priority'" :subtitle="subtitle">
        <div class="hero-priority flex-center">
            <div class="all-heroes">
                <div class="group d-flex" v-for="group in groupedHeroes">
                    <div class="num flex-center">{{ group.num }}</div>
                    <div class="heroes d-flex">
                        <div class="hero" v-for="count in group.heroes">
                            <div class="hero-image bg-center"
                                 :style="resizedImage(count.hero, ['main_image', 'icon'], 'w-200')"></div>
                            <div class="pick-ban-holder">
                                <div class="pick-ban-icons">
                                    <div class="pick-ban-icon bg-danger flex-center" v-for="ban in count.data.bans">
                                        <div class="pick-ban-icon-image bg-center"
                                             :style="resizedImage(ban?.theme, ['small_logo', 'default_logo'], 's-200')"></div>
                                    </div>
                                    <div class="pick-ban-icon bg-primary flex-center"
                                         v-for="pick in count.data.picks">
                                        <div class="pick-ban-icon-image bg-center"
                                             :style="resizedImage(pick?.theme, ['small_logo', 'default_logo'], 's-200')"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="key">
                <div class="key-group">
                    <div class="text-primary"><i class="fas fa-circle"></i></div>
                    <div class="key-text">Picked</div>
                </div>
                <div class="key-group">
                    <div class="text-danger"><i class="fas fa-circle"></i></div>
                    <div class="key-text">Banned</div>
                </div>
            </div>
        </div>
    </GenericOverlay>
</template>

<script>
import GenericOverlay from "./GenericOverlay";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { cleanID } from "../../../utils/content-utils";
import { sortAlphaRaw } from "../../../utils/sorts";
import { resizedImage } from "../../../utils/images";
export default {
    name: "HeroPriorityOverlay",
    components: { GenericOverlay },
    props: ["broadcast", "title", "subtitle", "mode"],
    computed: {
        schedule() {
            return (ReactiveRoot(this.broadcast, {
                schedule: ReactiveArray("schedule", {
                    teams: ReactiveArray("teams", {
                        theme: ReactiveThing("theme")
                    }),
                    "maps": ReactiveArray("maps", {
                        "team_1_picks": ReactiveArray("team_1_picks"),
                        "team_2_picks": ReactiveArray("team_2_picks"),
                        "team_1_bans": ReactiveArray("team_1_bans"),
                        "team_2_bans": ReactiveArray("team_2_bans")
                    })
                })
            })?.schedule || []).filter(m => m.show_on_overlays);
        },
        heroes() {
            const heroes = ReactiveRoot("Heroes", {
                ids: ReactiveArray("ids")
            })?.ids || [];
            if (this.broadcast?.event?.game) return heroes.filter(h => h.game === this.broadcast.event.game);
            return heroes;
        },
        countedHeroes() {
            const heroes = {};

            const base = { picks: [], bans: [] };


            console.log("-------------");
            const ignoreBans = this.mode === "picks";


            (this.schedule || []).forEach(match => {
                (match.maps || []).forEach(map => {
                    console.log("map", map);

                    ["team_1_picks", "team_2_picks"].forEach((key, i) => {
                        (map[key] || []).forEach(hero => {
                            if (!heroes[hero.id]) heroes[hero.id] = structuredClone(base);

                            heroes[hero.id].picks.push(match.teams?.[i])
                        })
                    });

                    if (!ignoreBans) {
                        ["team_1_bans", "team_2_bans"].forEach((key, i) => {
                            (map[key] || []).forEach(hero => {
                                if (!heroes[hero.id]) heroes[hero.id] = structuredClone(base);

                                heroes[hero.id].bans.push(match.teams?.[i])
                            })
                        });
                    }
                })
            })

            this.heroes.forEach(hero => {
                if (!heroes[hero.id]) {
                    heroes[hero.id] = structuredClone(base);
                }
            })

            return Object.entries(heroes).map(([heroID, data]) => ({
                hero: this.heroes.find(h => cleanID(h?.id) === cleanID(heroID)),
                data
            })).sort((a,b) => {
                const [aTotal, bTotal] = [a, b].map(x => x.data.picks.length + (ignoreBans ? 0 : x.data.bans.length));
                if (aTotal > bTotal) return -1;
                if (aTotal < bTotal) return 1;

                if (a.data.bans.length < b.data.bans.length) return 1;
                if (a.data.bans.length > b.data.bans.length) return -1;

                if (a.data.picks.length < b.data.picks.length) return 1;
                if (a.data.picks.length > b.data.picks.length) return -1;



                return sortAlphaRaw(a.hero?.name, b.hero?.name)
            });
        },
        groupedHeroes() {
            const mapCounts = {};

            this.countedHeroes.forEach(row => {
                const num = row.data.picks.length + row.data.bans.length;
                if (!mapCounts[num]) mapCounts[num] = { num, heroes: [] }
                mapCounts[num].heroes.push(row);
            })

            for (let i = 0; i < Math.max(...Object.keys(mapCounts)); i++) {
                if (!mapCounts[i]) {
                    mapCounts[i] = { i, num: i, heroes: [] }
                }
            }

            return mapCounts
        },
    },
    methods: {
        resizedImage
    }
};
</script>

<style scoped>
    .num {
        font-size: 1.75em;
        min-width: 1em;
        text-align: center;
        font-weight: bold;
    }

    .all-heroes {
        display: flex;
        flex-direction: column-reverse;
        font-size: 24px;
        row-gap: .125em;
        width: 100%;
    }
    .hero {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 3em;
    }
    .hero-image {
        height: 2.5em;
        width: 100%;
    }
    .pick-ban-icon {
        width: .75em;
        height: .75em;
    }
    .pick-ban-icon-image {
        width: 80%;
        height: 80%;
    }
    .heroes {
        flex-wrap: wrap;
        gap: .125em;
    }
    .pick-ban-icons {
        display: flex;
        flex-wrap: wrap;
    }

    .hero {
        background-color: #251F21;
    }

    .group {
        background-color:  #ffefd710;
        padding: .25em;
        gap: .25em;
    }
    .key {
        position: absolute;
        bottom: -20px;
        left: 0;
    }
    .key div {
        color: white;
        text-transform: uppercase;
    }
    .hero-priority {
        width: 100%;
        height: 100%;
        position: relative;
    }
    .key-group {
        display: flex;
        gap: .25em;
    }


    .heroes {
        gap: .5em;
    }
    .hero {
        flex-direction: row;
        width: auto;
        outline: 3px solid #251F21;
    }
    .hero-image {
        width: 2.5em;
        flex-shrink: 0;
        height: 3em;
    }
    .pick-ban-holder {
        background-color: rgba(0,0,0,0.2);
        height: 100%;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .pick-ban-icons {
        border-left: 3px solid #251F21;
        flex-direction: row;
        flex-wrap: wrap;
        max-height: 3em;
        width: 1.25em;
        gap: 1px;
        justify-content: center;
        align-items: center;
        justify-items: center;
    }
    .pick-ban-icon {
        width: .45em;
        height:  .45em;

        border-radius: 50%;
    }
    .key {
        display: flex;
        gap: 1em;
        bottom: -38px;
    }
    .pick-ban-icon-image {
        display: none;
    }

    .all-heroes {
        margin-top: -20px;
    }

</style>

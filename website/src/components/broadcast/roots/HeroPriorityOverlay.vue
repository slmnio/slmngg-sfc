<template>
    <GenericOverlay class="hero-priority-overlay" :title="title || 'Hero Priority'" :subtitle="subtitle">
        <div class="hero-priority flex-center">
            <div class="all-heroes">
                <div v-for="group in groupedHeroes" :key="group.num" class="group d-flex">
                    <div class="num flex-center">{{ group.num }}</div>
                    <div class="heroes d-flex">
                        <div v-for="({ stat, hero }) in group.heroes" :key="hero?.id" class="hero">
                            <div
                                class="hero-image bg-center"
                                :style="resizedImage(hero, gameOverride?.imageSets?.heroPriority || ['icon', 'main_image'], 'w-200')"></div>
                            <div class="pick-ban-holder">
                                <div class="pick-ban-icons">
                                    <div
                                        v-for="(ban, i) in (stats.usesPriority ? stat.bans.priority : [])"
                                        :key="i"
                                        class="pick-ban-icon flex-center bg-first-ban text-white flex-center">
                                        <span class="pick-ban-priority-number industry-align">1</span>
                                    </div>
                                    <div
                                        v-for="(ban, i) in (stats.usesPriority ? stat.bans.total - stat.bans.priority : stat.bans.total)"
                                        :key="i"
                                        class="pick-ban-icon bg-danger flex-center">
                                    </div>
                                    <div
                                        v-for="(pick, i) in (stats.usesPriority ? stat.picks.priority : [])"
                                        :key="i"
                                        class="pick-ban-icon flex-center bg-info text-white flex-center">
                                        <span class="pick-ban-priority-number industry-align">1</span>
                                    </div>
                                    <div
                                        v-for="(pick, i) in (stats.usesPriority ? stat.picks.total - stat.picks.priority : stat.picks.total)"
                                        :key="i"
                                        class="pick-ban-icon bg-primary flex-center">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="key">
                <div class="key-group">
                    <div class="pick-ban-icon flex-center bg-first-ban text-white flex-center">
                        <span class="pick-ban-priority-number industry-align">1</span>
                    </div>
                    <div class="key-text">First Round Banned</div>
                </div>
                <div class="key-group">
                    <div class="pick-ban-icon bg-danger flex-center"></div>
                    <div class="key-text">Banned</div>
                </div>
                <div class="key-group ml-3">
                    <div class="pick-ban-icon flex-center bg-info text-white flex-center">
                        <span class="pick-ban-priority-number industry-align">1</span>
                    </div>
                    <div class="key-text">First Round Picked</div>
                </div>
                <div class="key-group">
                    <div class="pick-ban-icon bg-primary flex-center"></div>
                    <div class="key-text">Picked</div>
                </div>
            </div>
        </div>
    </GenericOverlay>
</template>

<script>
import GenericOverlay from "./GenericOverlay";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { cleanID, countStats } from "@/utils/content-utils.js";
import { sortAlphaRaw } from "@/utils/sorts";
import { resizedImage } from "@/utils/images";
import { GameOverrides } from "@/utils/games";

export default {
    name: "HeroPriorityOverlay",
    components: { GenericOverlay },
    props: ["broadcast", "title", "subtitle", "mode", "skip"],
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
        stats() {
            return countStats(this.schedule || []);
        },
        gameOverride() {
            return GameOverrides[this.broadcast?.event?.game];
        },
        groupedHeroes() {
            const mapCounts = {};
            const ignoreBans = this.mode === "picks";

            this.heroes.forEach(hero => {
                let stat = this.stats[cleanID(hero?.id)];
                if (!stat) {
                    stat = {
                        picks: {
                            total: 0,
                            priority: 0,
                        },
                        bans: {
                            total: 0,
                            priority: 0,
                        }
                    };
                }


                const num = stat.picks.total + stat.bans.total;
                if (!mapCounts[num]) {
                    mapCounts[num] = {
                        num,
                        heroes: []
                    };
                }
                mapCounts[num].heroes.push({ stat, hero });
            });

            Object.entries(mapCounts).forEach(([num, data]) => {
                if (!data.heroes?.length) return;
                data.heroes.sort((a,b) => {
                    const [aTotal, bTotal] = [a, b].map(x => x.stat.picks.total + (ignoreBans ? 0 : x.stat.bans.total));
                    if (aTotal > bTotal) return -1;
                    if (aTotal < bTotal) return 1;


                    if (a.stat.bans.total < b.stat.bans.total) return 1;
                    if (a.stat.bans.total > b.stat.bans.total) return -1;

                    if (a.stat.bans.priority < b.stat.bans.priority) return 1;
                    if (a.stat.bans.priority > b.stat.bans.priority) return -1;


                    if (a.stat.picks.total < b.stat.picks.total) return 1;
                    if (a.stat.picks.total > b.stat.picks.total) return -1;

                    if (a.stat.picks.priority < b.stat.picks.priority) return 1;
                    if (a.stat.picks.priority > b.stat.picks.priority) return -1;


                    return sortAlphaRaw(a.hero?.name, b.hero?.name);
                });
            });


            if (!this.skip) {
                for (let i = 0; i < Math.max(...Object.keys(mapCounts)); i++) {
                    if (!mapCounts[i]) {
                        mapCounts[i] = {
                            i,
                            num: i,
                            heroes: []
                        };
                    }
                }
            }

            return mapCounts;
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
        row-gap: .125em;
        width: 100%;
    }
    .all-heroes, .key {
        font-size: 24px;
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
        background-color: #222222;
    }

    .group {
        background-color: #ffffff20;
        padding: .25em;
        gap: .25em;
    }

    .key div {
        text-transform: uppercase;
    }

    .hero-priority {
        width: 100%;
        height: 100%;
        position: relative;
        flex-direction: column;
        align-items: flex-start;
        gap: .5em;
    }

    .key-group {
        display: flex;
        gap: .2em;
        justify-content: center;
        align-items: center;
    }


    .heroes {
        gap: .5em;
    }

    .hero {
        flex-direction: row;
        width: auto;
        outline: 3px solid #222222;
    }

    .hero-image {
        width: 2.5em;
        flex-shrink: 0;
        height: 3em;
    }

    .pick-ban-holder {
        background-color: rgba(0, 0, 0, 0.2);
        height: 100%;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .pick-ban-icons {
        border-left: 3px solid #222222;
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
        height: .45em;

        border-radius: 50%;
    }

    .key {
        display: flex;
        gap: 0.75em;
        font-size: 2em;
    }
    .key-text {
        font-size: 0.5em;
    }

    .pick-ban-icon-image {
        display: none;
    }

    .bg-first-ban {
        background-color: #fd4a14;
    }

    .pick-ban-priority-number {
        color: white;
        font-size: .4em;
        opacity: 0.6;
    }

</style>

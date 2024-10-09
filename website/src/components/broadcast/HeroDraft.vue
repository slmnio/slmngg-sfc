<template>
    <div class="hero-draft" :style="themeBackground1(broadcast?.event)">
        <div
            v-for="(team, ti) in teams"
            :key="team.id"
            class="team"
            :style="{order: ti * 2}"
            :class="{'left': ti === 0, 'right': ti === 1}">
            <div class="team-top" :style="themeBackground1(team)">
                <div class="team-main">
                    <div class="team-logo-holder flex-center" :style="logoBackground1(team)">
                        <div class="team-logo bg-center" :style="resizedImage(team?.theme, ['small_logo', 'default_logo', 'default_wordmark'], 'w-200')"></div>
                    </div>
                    <div class="team-name">{{ team.name }}</div>
                </div>
                <div class="team-bans">
                    <div v-for="ban in (currentMap?.[`team_${ti+1}_bans`] || [])" :key="ban.id" class="ban bg-danger flex-center">
                        <transition name="fade" mode="out-in">
                            <div v-if="ban" :key="ban?.id" class="bg-center ban-icon  flex-center" :style="resizedImage(ban, ['icon'], 's-500')"></div>
                        </transition>
                    </div>
                    <transition name="fade" mode="out-in">
                        <div v-if="(currentMap?.[`team_${ti+1}_bans`] || [])?.length" class="bans-text">BANS</div>
                    </transition>
                </div>
            </div>
            <div class="players">
                <div v-for="num of maxPlayers" :key="num" class="player">
                    <transition name="fade" mode="out-in">
                        <div v-if="picks[ti]?.[num-1]?.name" :key="picks[ti]?.[num-1]?.id" class="pick bg-center flex-center" :style="resizedImage(picks[ti][num-1], ['main_image', 'icon'], 'h-500')">
                            <div class="pick-text" :style="themeBackground1(broadcast?.event)">{{ picks[ti]?.[num-1]?.name }}</div>
                        </div>
                        <div v-else class="placeholder"></div>
                    </transition>
                </div>
            </div>
        </div>
        <div class="center" :style="{order: 1, ...themeBackground1(broadcast?.event)}">
            <div class="bg-center event-logo" :style="resizedImage(broadcast?.event?.theme, ['default_logo', 'default_wordmark'], 'w-500')"></div>
            <div class="score">
                <div v-if="middle === 'score'" class="middle scores">
                    {{ [(match.score_1 || 0), (match.score_2 || 0)].join(" - ") }}
                </div>
                <div v-if="middle === 'vs'" class="middle vs">VS</div>
            </div>
            <div v-if="draftText" class="draft-text">
                {{ draftText }}
            </div>
        </div>
    </div>
</template>

<script>
import { logoBackground1, themeBackground1 } from "@/utils/theme-styles.js";
import { resizedImage } from "@/utils/images.js";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive.js";

export default {
    name: "HeroDraft",
    props: ["broadcast", "match"],
    computed: {
        middle() {
            // if (!this.match) return "vs";
            // if (!((this.match.score_1 || 0) || (this.match.score_2 || 0))) return "vs";
            return "score";
            // return this.broadcast?.broadcast_settings?.includes("Use dots instead of numbers for score") ? "dots" : "score";
        },
        game() {
            return this.broadcast?.event?.game;
        },
        maxPlayers() {
            if (this.game === "Deadlock") return 6;

            return 5;
        },
        teams() {
            return this.match.teams || [];
        },
        hydratedMatch() {
            if (!this.match?.id) return null;
            return ReactiveRoot(this.match?.id, {
                "maps": ReactiveArray("maps", {
                    map: ReactiveThing("map"),
                    winner: ReactiveThing("winner", {
                        theme: ReactiveThing("theme")
                    }),
                    picker: ReactiveThing("picker", {
                        theme: ReactiveThing("theme")
                    }),
                    banner: ReactiveThing("banner", {
                        theme: ReactiveThing("theme")
                    }),
                    team_1_picks: ReactiveArray("team_1_picks"),
                    team_1_bans: ReactiveArray("team_1_bans"),
                    team_2_picks: ReactiveArray("team_2_picks"),
                    team_2_bans: ReactiveArray("team_2_bans"),
                })

            });
        },
        currentMap() {
            const maps = (this.hydratedMatch?.maps || []).map((map, i) => ({
                ...map,
                number: map.number || i + 1
            })).filter(map => !map.banner);

            let currentMap = maps.find(map => !(map.draw || map.winner));

            console.log(currentMap);

            return currentMap;
        },
        picks() {
            if (!this.currentMap?.id) return [[], []];

            return [
                (this.currentMap?.team_1_picks || []),
                (this.currentMap?.team_2_picks || []),
            ];
        },
        draftText() {
            const items = [];

            if (this.currentMap?.number) {
                items.push(`Map ${this.currentMap.number}`);
            }
            if (this.match?.first_to) {
                if (["Deadlock", "League of Legends", "Valorant"].includes(this.match?.event?.game)) {
                    items.push(`Best of ${(this.match.first_to * 2)-1}`);
                } else {
                    items.push(`First to ${this.match.first_to}`);
                }
            }

            if (!items?.length) return null;
            return items.join(" - ");
        }
    },
    methods: { logoBackground1, resizedImage, themeBackground1 },
};
</script>

<style scoped>
.hero-draft {
    display: flex;
    justify-content: center;
    height: 180px;
}

.team {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
}

.center {
    flex-shrink: 0;
    width: 150px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 10px 5px;
}
.middle {
    font-weight: bold;
    font-size: 2em;
}

.players {
    display: flex;
    flex-grow: 1;
}
.player {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.team-top {
    display: flex;
    align-items: center;
    font-size: 1.5em;
    gap: .25em;
    justify-content: space-between;
}

.team-main {
    display: flex;
    align-items: center;
    gap: .5em;
    height: 100%;
}


.event-logo {
    width: 90%;
    height: 80%;
}
.team-name {
    font-weight: bold;
}
.team-logo-holder {
    width: 2em;
    height: 100%;
}

.team-logo {
    width: 90%;
    height: 90%;
}
.pick {
    width: 100%;
    height: 100%;
    background-size: cover;
    position: relative;
}
.ban-icon {
    width: 90%;
    height: 90%;
}

.ban {
    height: 100%;
    width: 2em;
}

.team-bans {
    height: 100%;
    display: flex;
}

.bans-text {
    padding: 0 0.5em;
}
.pick-text {
    position: absolute;
    bottom: 0;
    width: 100%;
    text-align: center;
    font-weight: bold;
    font-size: 1.25em;
}

.right .team-top {
    flex-direction: row-reverse;
}
.right .team-main {
    flex-direction: row-reverse;
}
.right .players {
    flex-direction: row-reverse;
}
.right .team-bans {
    flex-direction: row-reverse;
}
</style>

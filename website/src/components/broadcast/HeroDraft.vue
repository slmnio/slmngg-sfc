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
                    <div v-for="(ban, num) in (bans[ti] || [])" :key="num" class="ban bg-danger flex-center">
                        <transition name="fade" mode="out-in" :duration="250">
                            <div v-if="ban?.name" class="bg-center ban-icon ban flex-center" :style="resizedImage(ban, ['icon'], 's-500')">
                                <!-- <div class="ban-number">{{ getPickBanItem(pickBanOrder, "ban", ti+1, num - 1)?.num }}</div>-->
                            </div>
                            <div v-else class="ban ban-placeholder text-center" :class="{'ban-next': ban?.orderItem?.num === (currentPickBan + 1) }">
                            </div>
                        </transition>
                    </div>
                    <transition name="fade" mode="out-in">
                        <transition name="fade" mode="out-in" :duration="250">
                            <div v-if="(bans[ti] || [])?.length === 1" class="bans-text">BAN</div>
                            <div v-else-if="(bans[ti] || [])?.length" class="bans-text">BANS</div>
                        </transition>
                    </transition>
                </div>
            </div>
            <div class="players">
                <div v-for="num of maxPlayers" :key="num" class="player">
                    <transition name="fade" mode="out-in" :duration="250">
                        <div v-if="picks[ti]?.[num-1]?.name" :key="picks[ti]?.[num-1]?.id" class="pick flex-center">
                            <div class="pick-number">{{ getPickBanItem(pickBanOrder, "pick", ti+1, num - 1)?.countOfType }}</div>
                            <div class="pick-image bg-center" :style="resizedImage(picks[ti][num-1], ['main_image', 'icon'], 'h-500')"></div>
                            <div class="pick-text" :style="themeBackground1(broadcast?.event)">{{ picks[ti]?.[num-1]?.name }}</div>
                        </div>
                        <div v-else class="pick pick-placeholder flex-center" :class="{'pick-next': picks[ti]?.[num-1]?.orderItem?.num === (currentPickBan + 1) }">
                            <div class="pick-number">{{ picks[ti]?.[num-1]?.orderItem?.countOfType }}</div>
                        </div>
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
import { getPickBanItem, processPickBanOrder } from "@/utils/content-utils.js";
import { GameOverrides } from "@/utils/games.ts";

export default {
    name: "HeroDraft",
    props: ["broadcast", "match", "showAll"],
    data: () => ({
        currentPickBan: 0,
        manualDraftAdvancing: true
    }),
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

            let currentMap = maps.find(map => !(map.draw || map.winner)) || maps[maps.length - 1];

            console.log(currentMap);

            return currentMap;
        },
        gameOverride() {
            if (this.match?.game || this.match?.event?.game) return GameOverrides[this.match?.game || this.match?.event?.game];
            return null;
        },
        pickBanOrder() {
            return processPickBanOrder(this.match?.pick_ban_order || this.gameOverride?.defaultPickBanOrder, this.currentMap?.flip_pick_ban_order);
        },
        picks() {
            if (!this.currentMap?.id) return [[], []];

            if (this.pickBanOrder?.length) {
                // pad
                return [
                    this.padPickBans(this.currentMap?.team_1_picks || [], this.pickBanOrder.filter(o => o.type === "pick" && o.team === 1).length, "pick", 1, this.currentPickBan),
                    this.padPickBans(this.currentMap?.team_2_picks || [], this.pickBanOrder.filter(o => o.type === "pick" && o.team === 2).length, "pick", 2, this.currentPickBan),
                ];
            } else {
                return [
                    (this.currentMap?.team_1_picks || []),
                    (this.currentMap?.team_2_picks || []),
                ];
            }
        },
        bans() {
            if (!this.currentMap?.id) return [[], []];

            if (this.pickBanOrder?.length) {
                // pad
                return [
                    this.padPickBans(this.currentMap?.team_1_bans || [], this.pickBanOrder.filter(o => o.type === "ban" && o.team === 1).length, "ban", 1, this.currentPickBan),
                    this.padPickBans(this.currentMap?.team_2_bans || [], this.pickBanOrder.filter(o => o.type === "ban" && o.team === 2).length, "ban", 2, this.currentPickBan),
                ];
            } else {
                return [
                    (this.currentMap?.team_1_bans || []),
                    (this.currentMap?.team_2_bans || []),
                ];
            }
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
    methods: {
        getPickBanItem,
        padPickBans(arr, count, type, team, manualAdvanceIndex) {
            console.log("pad pick ban", { arr, count, type, team });

            const out = [];

            for (let i = 0; i < Math.max(arr.length, count); i++) {
                let placeholder = { id: `placeholder-${i}`, placeholder: true, orderItem: getPickBanItem(this.pickBanOrder, type, team, i) };

                if (this.manualDraftAdvancing && !this.showAll) {
                    // make sure order item calculated num is above or equal to this.currentPickBan
                    console.log("manual draft advancing", placeholder.orderItem, manualAdvanceIndex);

                    if (placeholder.orderItem?.num <= manualAdvanceIndex) {
                        out.push(arr[i] ?? placeholder);
                    } else {
                        out.push(placeholder);
                    }

                } else {
                    out.push(arr[i] ?? placeholder);
                }
            }

            console.log(out);
            return out;
        },
        resetPickBan() {
            console.log("reset pick ban");
            this.currentPickBan = 0;
            this.manualDraftAdvancing = true;
        },
        logoBackground1, resizedImage, themeBackground1
    },
    watch: {
        "match.id": {
            immediate: true,
            handler(id, oldId) {
                console.log("match ID change", id, oldId);
                this.resetPickBan();
            }
        }
    },
    sockets: {
        advance_draft() {
            this.currentPickBan++;
            console.log(this.currentPickBan);
        },
        reset_draft() {
            this.resetPickBan();
        }
    }
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
    background-image: radial-gradient(transparent, rgba(0,0,0,0.2));
    align-items: flex-start;
}
.pick-image {
    position: absolute;
    width: 100%;
    height: 100%;
    background-size: cover;
}
.pick-number {
    z-index: 1;
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

.pick-placeholder {
    width: 100%;
    height: 100%;
}

</style>

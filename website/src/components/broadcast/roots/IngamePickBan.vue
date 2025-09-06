<template>
    <div class="ingame-pick-ban">
        <div class="box">
            <div class="teams">
                <div
                    v-for="(team, i) in teams"
                    :key="team.id"
                    :class="{'left': i === 0, 'right': i === 1}"
                    class="team-box">
                    <IngameTeam
                        :team="team"
                        :right="i === 1"
                        :active="true"
                        :score="scores[i]"
                        class="pickban-team"
                    />
                    <div class="pickban-history d-flex">
                        <div v-for="(map, mi) in (match.maps || [])" :key="map.id" class="map d-flex flex-center flex-column">
                            <div class="pickbans d-flex gap-1">
                                <div v-for="p in pickBanOrder.filter(p => p.team === (i + 1))" :key="`${p.type}-${p.countOfType}`" class="pickban" :class="p?.type">
                                    <div class="pickban-image bg-center" :style="resizedImage(map?.[`team_${(match.flip_teams ? +!(i) : i) + 1}_${p.type}s`]?.[p.countOfTeamType - 1], ['icon'], 's-500')"></div>
                                </div>
                            </div>
                            <div class="map-number">
                                MAP {{ mi+1 }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import IngameTeam from "@/components/broadcast/IngameTeam.vue";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { processPickBanOrder } from "@/utils/content-utils";
import { GameOverrides } from "@/utils/games";
import { bg, resizedImage } from "@/utils/images.js";

export default {
    name: "IngamePickBan",
    components: { IngameTeam },
    props: {
        broadcast: Object,
    },
    computed: {
        match() {
            if (!this.broadcast?.live_match) return null;
            return ReactiveRoot(this.broadcast.live_match[0], {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme"),
                    red_theme: ReactiveThing("red_theme"),
                    blue_theme: ReactiveThing("blue_theme")
                }),
                "maps": ReactiveArray("maps", {
                    "team_1_picks": ReactiveArray("team_1_picks"),
                    "team_2_picks": ReactiveArray("team_2_picks"),
                    "team_1_bans": ReactiveArray("team_1_bans"),
                    "team_2_bans": ReactiveArray("team_2_bans")
                })
            });
        },
        scores() {
            if (!this.match?.id) return [];
            return [this.match.score_1, this.match.score_2];
        },
        teams() {
            console.warn("Teams", this.match?.teams);
            if (!this.match?.teams?.every(t => {
                if (t.theme === undefined && t.has_theme === 0) return true;
                return t.theme && !t.theme.__loading && t.theme.id;
            })) {
                console.warn("No teams, not loaded", this.match?.teams);
                return [];
            }
            if (this.match.flip_teams && this.match.teams.length === 2) return [this.match.teams[1], this.match.teams[0]];
            if (this.match.teams.length !== 2) return [];
            return this.match.teams;
        },
        currentMap() {
            const maps = (this.match?.maps || []).map((map, i) => ({
                ...map,
                number: map.number || i + 1
            })).filter(map => !map.banner);

            let currentMap = maps.find(map => !(map.draw || map.winner));

            return currentMap;
        },
        pickBanOrder() {
            return processPickBanOrder(this.match?.pick_ban_order || this.gameOverride?.defaultPickBanOrder, this.currentMap?.flip_pick_ban_order);
        },
        gameOverride() {
            return GameOverrides[this.broadcast?.event?.game];
        },
    },
    methods: { resizedImage, bg },
};
</script>

<style scoped>
    .ingame-pick-ban {
        background-image: url("https://cdn.discordapp.com/attachments/485493459357007876/1354879907510882334/chrome_fnvexqIwSb.jpg?ex=67e6e5be&is=67e5943e&hm=8a628a4cea634e941789902e125258fe4ab359d1036fafae6cfd07ed4e5d9782&");
        width: 100vw;
        height: 100vh;
        background-size: cover;
    }

    .box {
        position: absolute;
        bottom: 453px;
        width: 100%;
    }
    .teams {
        display: flex;
        justify-content: space-between;
    }
    .team-box {
        position: relative;
        --team-box-width: 580px;
        width: var(--team-box-width)
    }
    .team-box.right > *{
        right: 0;
    }
    .pickban-team {
        top: auto;
        bottom: 0;
        --team-height: 90px;
    }
    .pickban-team :deep(.ingame-team) {
        width: var(--team-box-width) !important;
    }
    .pickban-history {
        position: absolute;
        top: calc(100% + 6px);
        color: white;
        width: 100%;
        justify-content: flex-end;
        gap: 12px;
    }

    .pickban.ban {
        background-color: var(--danger);
    }
    .pickban.pick {
        background-color: var(--primary);
    }

    .pickban {
        border-radius: 2px;
    }

    .pickban-image {
        background-size: 38px;
        width: 42px;
        height: 36px;
    }
    .map-number {
        font-size: 1.25em;
        font-weight: 900;
        line-height: 1;
        padding-top: .25em;
    }

    .team-box.right .pickban-history {
        flex-direction: row-reverse;
    }
    .team-box.right .pickbans {
        flex-direction: row-reverse;
    }
</style>

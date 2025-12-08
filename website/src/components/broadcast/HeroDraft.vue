<template>
    <div class="hero-draft-container d-flex flex-column" :style="themeBackground1(broadcast?.event)">
        <div class="timing-bar-container" :class="{'auto-active': !!autoDraftLast}">
            <transition name="fade" :duration="500" mode="out-in">
                <div v-if="timingBarStyle" :key="timingBarKey" class="timing-bar" :style="{...(timingBarStyle || {}), backgroundColor: themeBackground1(this?.broadcast?.event)?.borderColor}"></div>
            </transition>
        </div>
        <div class="hero-draft w-100 h-100">
            <div
                v-for="(team, ti) in teams"
                :key="team.id"
                class="team"
                :style="{order: ti * 2}"
                :class="{'left': ti === 0, 'right': ti === 1}">
                <div v-if="fearless && fearlessMaps.length" class="team-fearless bg-danger d-flex flex-center gap-3">
                    <div class="fearless-text">Fearless bans</div>
                    <div class="fearless-maps">
                        <div v-for="map in fearlessMaps" :key="map.id" class="fearless-map d-flex flex-center">
                            <div
                                v-for="hero in map[`team_${ti+1}_picks`]"
                                :key="hero.id"
                                class="fearless-hero flex-center d-flex">
                                <transition name="fade" mode="out-in" :duration="250">
                                    <div
                                        v-if="hero?.name"
                                        class="bg-center fearless square flex-center">
                                        <div class="fearless-image square-image flex-center">
                                            <img
                                                class="image-center"
                                                :src="resizedImageNoWrap(hero, ['icon'], 's-500')">
                                        </div>
                                    </div>
                                    <div
                                        v-else
                                        class="fearless fearless-placeholder square text-center">
                                    </div>
                                </transition>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="team-top" :style="themeBackground1(team)">
                    <div class="team-main">
                        <div class="team-logo-holder flex-center" :style="logoBackground1(team)">
                            <div
                                class="team-logo bg-center"
                                :style="resizedImage(team?.theme, ['small_logo', 'default_logo', 'default_wordmark'], 'w-200')"></div>
                        </div>
                        <div class="team-name">{{ team.name }}</div>
                        <div v-if="firstPick?.team === (ti+1)" class="team-is-first-pick team-pill">1st pick</div>
                    </div>
                    <div v-if="bans?.[ti]?.length" class="team-bans team-squares">
                        <div v-for="(ban, num) in (bans[ti] || [])" :key="num" class="square bg-danger flex-center">
                            <transition name="fade" mode="out-in" :duration="250">
                                <div
                                    v-if="ban?.name"
                                    class="bg-center ban square flex-center"
                                    :class="{'audio-playing': audioPlaying[`ban/${ti+1}/${num+1}`]}">
                                    <div class="square-image flex-center">
                                        <transition name="fade">
                                            <img v-show="loaded[bans[ti][num-1]?.id]" class="image-center" :src="resizedImageNoWrap(ban, ['icon'], 's-500')" @load="() => loaded[bans[ti][num-1]?.id] = true">
                                        </transition>
                                    </div>

                                    <!-- <div class="ban-number">{{ getPickBanItem(pickBanOrder, "ban", ti+1, num - 1)?.num }}</div>-->
                                </div>
                                <div
                                    v-else
                                    class="ban square square-placeholder text-center"
                                    :class="{'ban-next': !hideNextPick && ban?.orderItem?.num === (currentPickBan + 1) }">
                                </div>
                            </transition>
                        </div>
                        <transition name="fade" mode="out-in">
                            <transition name="fade" mode="out-in" :duration="250">
                                <div v-if="(bans[ti] || [])?.length === 1" class="squares-text ban-text">BAN</div>
                                <div v-else-if="(bans[ti] || [])?.length" class="squares-text ban-text">BANS</div>
                            </transition>
                        </transition>
                    </div>
                    <div v-if="protects?.[ti]?.length" class="team-protects team-squares">
                        <div v-for="(protect, num) in (protects[ti] || [])" :key="num" class="protect square bg-info flex-center">
                            <transition name="fade" mode="out-in" :duration="250">
                                <div
                                    v-if="protect?.name"
                                    class="bg-center protect square flex-center"
                                    :class="{'audio-playing': audioPlaying[`protect/${ti+1}/${num+1}`]}">
                                    <div class="protect-image square-image flex-center">
                                        <transition name="fade">
                                            <img v-show="loaded[protects[ti][num-1]?.id]" class="image-center" :src="resizedImageNoWrap(protect, ['icon'], 's-500')" @load="() => loaded[protects[ti][num-1]?.id] = true">
                                        </transition>
                                    </div>

                                    <!-- <div class="protect-number">{{ getPickProtectItem(pickProtectOrder, "protect", ti+1, num - 1)?.num }}</div>-->
                                </div>
                                <div
                                    v-else
                                    class="protect protect-placeholder text-center"
                                    :class="{'protect-next': !hideNextPick && protect?.orderItem?.num === (currentPickBan + 1) }">
                                </div>
                            </transition>
                        </div>
                        <transition name="fade" mode="out-in">
                            <transition name="fade" mode="out-in" :duration="250">
                                <div v-if="(protects[ti] || [])?.length === 1" class="squares-text protect-text">PROTECT</div>
                                <div v-else-if="(protects[ti] || [])?.length" class="squares-text protect-text">PROTECTS</div>
                            </transition>
                        </transition>
                    </div>
                </div>
                <div class="players">
                    <div v-for="num of maxPlayers" :key="num" class="player">
                        <transition name="fade" mode="out-in" :duration="250">
                            <div
                                v-if="picks[ti]?.[num-1]?.name"
                                :key="picks[ti]?.[num-1]?.id"
                                class="pick flex-center"
                                :class="{
                                    'audio-playing': audioPlaying[`pick/${ti+1}/${num}`],
                                    'show-stats': showStats[`pick/${ti+1}/${num}`],
                                    'show-stats-2': showStats[`pick/${ti+1}/${num}`] === 2,
                                    'show-stats-3': showStats[`pick/${ti+1}/${num}`] === 3
                                }">
                                <div class="pick-number">
                                    {{ getPickBanItem(pickBanOrder, "pick", ti + 1, num - 1)?.countOfTeamType }}
                                </div>
                                <div
                                    class="pick-image bg-center">
                                    <transition name="fade">
                                        <img v-show="loaded[picks[ti][num-1]?.id]" class="image-center" :src="resizedImageNoWrap(picks[ti][num-1], ['main_image', 'icon'], 'h-500')" @load="() => loaded[picks[ti][num-1]?.id] = true">
                                    </transition>
                                </div>
                                <div v-show="loaded[picks[ti][num-1]?.id]" class="pick-text" :style="themeBackground1(broadcast?.event)">
                                    {{ picks[ti]?.[num - 1]?.name }}
                                </div>
                                <div
                                    class="stats-zone"
                                    :style="themeBackground1(broadcast?.event)">
                                    <transition name="fade">
                                        <div
                                            v-if="showStats[`pick/${ti+1}/${num}`] === 1"
                                            class="pick-stats flex-center w-100 text-white flex-column stats-page-1">
                                            <div class="main-stats-row w-100 stats-page">
                                                <div class="stat-row stat--pickban">
                                                    <!--                                            <div class="stat-text">PICK/BAN %</div>-->
                                                    <div class="stat-text">PB%</div>
                                                    <div class="stat-stat">
                                                        {{
                                                            ((((stats?.[picks[ti]?.[num - 1]?.id]?.picks?.total || 0) + (stats?.[picks[ti]?.[num - 1]?.id]?.bans?.total || 0)) / stats?.totalMaps) * 100).toFixed(0)
                                                        }}%
                                                    </div>
                                                </div>
                                                <div class="stat-row stat--prio-pickban">
                                                    <div class="stat-text">FIRST ROUND</div>
                                                    <div class="stat-stat">
                                                        {{
                                                            ((((stats?.[picks[ti]?.[num - 1]?.id]?.picks?.priority || 0) + (stats?.[picks[ti]?.[num - 1]?.id]?.bans?.priority || 0)) / stats?.totalMaps) * 100).toFixed(0)
                                                        }}%
                                                    </div>
                                                </div>
                                                <div class="stat-row all-center stat--winrate">
                                                    <Squeezable align="left">
                                                        <div class="stat-stat w-full text-center">
                                                            {{ stats?.[picks[ti]?.[num - 1]?.id]?.picks?.wins || "0" }}W&nbsp;{{
                                                                stats?.[picks[ti]?.[num - 1]?.id]?.picks?.losses || "0"
                                                            }}L
                                                        </div>
                                                    </Squeezable>
                                                </div>
                                                <!--                                        <div class="spacer"></div>-->
                                                <div class="stats-title division-stats-title">
                                                    {{ match?.division }} Stats
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            v-else-if="showStats[`pick/${ti+1}/${num}`] === 2"
                                            class="pick-stats flex-center w-100 text-white flex-column stats-page-2">
                                            <div class="team-stats-row w-100 stats-page">
                                                <ThemeLogo
                                                    class="stats-team-icon"
                                                    :theme="team?.theme"
                                                    logo-size="w-200"
                                                    border-width="4px"
                                                    icon-padding="6px" />

                                                <div class="stats-title team-stats-title">
                                                    <div>TEAM STATS</div>
                                                    <div style="font-size: 0.8em">
                                                        ({{ stats?.teamMaps?.[team?.id] || "0" }}
                                                        Map{{ stats?.teamMaps?.[team?.id] === 1 ? "" : "s" }})
                                                    </div>
                                                </div>
                                                <div class="team-stats-stat w-100">
                                                    <div class="team-stats-pick-ban-row">
                                                        <div class="stat-row">
                                                            <div class="stat-text">PICK</div>
                                                            <div class="stat-stat">
                                                                {{
                                                                    stats?.[picks[ti]?.[num - 1]?.id]?.picks?.byTeam?.[team?.id]?.total || 0
                                                                }}x
                                                            </div>
                                                        </div>
                                                        <div class="stat-row">
                                                            <div class="stat-text">BAN</div>
                                                            <div class="stat-stat">
                                                                {{
                                                                    stats?.[picks[ti]?.[num - 1]?.id]?.bans?.byTeam?.[team?.id]?.total || 0
                                                                }}x
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="stat-row stat--team-winloss mt-2">
                                                        <div class="stat-stat">
                                                            {{
                                                                stats?.[picks[ti]?.[num - 1]?.id]?.picks?.byTeam?.[team?.id]?.wins || "0"
                                                            }}W&nbsp;&nbsp;{{
                                                                stats?.[picks[ti]?.[num - 1]?.id]?.picks?.byTeam?.[team?.id]?.losses || "0"
                                                            }}L
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            v-else-if="showStats[`pick/${ti+1}/${num}`] === 3"
                                            class="pick-stats flex-center w-100 text-white flex-column stats-page-3">
                                            <div class="team-stats-row w-100 stats-page">
                                                <div class="stats-title team-stats-title priority-stats-title">
                                                    HERO PRIORITY
                                                </div>
                                                <div class="team-stats-stat w-100 priority-groups">
                                                    <div
                                                        v-for="({ week, stats: weekStats }) in priorityStats"
                                                        :key="week"
                                                        class="priority-group">
                                                        <div class="priority-group-title">{{ week }}</div>
                                                        <div class="pick-ban-icons">
                                                            <div
                                                                v-for="(ban, i) in (weekStats?.usesPriority ? weekStats?.[cleanID(picks[ti]?.[num-1]?.id)]?.bans?.priority : [])"
                                                                :key="i"
                                                                class="pick-ban-icon flex-center bg-first-ban text-white flex-center">
                                                                <span
                                                                    class="pick-ban-priority-number industry-align">1</span>
                                                            </div>
                                                            <div
                                                                v-for="(ban, i) in (weekStats?.usesPriority ? (weekStats?.[cleanID(picks[ti]?.[num-1]?.id)]?.bans?.total || 0) - (weekStats?.[cleanID(picks[ti]?.[num-1]?.id)]?.bans?.priority || 0) : (weekStats?.[cleanID(picks[ti]?.[num-1]?.id)]?.bans?.total || 0))"
                                                                :key="i"
                                                                class="pick-ban-icon bg-danger flex-center">
                                                            </div>
                                                            <div
                                                                v-for="(pick, i) in (weekStats?.usesPriority ? weekStats?.[cleanID(picks[ti]?.[num-1]?.id)]?.picks?.priority : [])"
                                                                :key="i"
                                                                class="pick-ban-icon flex-center bg-info text-white flex-center">
                                                                <span
                                                                    class="pick-ban-priority-number industry-align">1</span>
                                                            </div>
                                                            <div
                                                                v-for="(pick, i) in (weekStats?.usesPriority ? (weekStats?.[cleanID(picks[ti]?.[num-1]?.id)]?.picks?.total || 0) - (weekStats?.[cleanID(picks[ti]?.[num-1]?.id)]?.picks?.priority || 0) : (weekStats?.[cleanID(picks[ti]?.[num-1]?.id)]?.picks?.total || 0))"
                                                                :key="i"
                                                                class="pick-ban-icon bg-primary flex-center">
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </transition>
                                </div>
                            </div>
                            <div
                                v-else
                                class="pick pick-placeholder flex-center"
                                :class="{'pick-next': !hideNextPick && picks[ti]?.[num-1]?.orderItem?.num === (currentPickBan + 1) }">
                                <div class="pick-number">{{ picks[ti]?.[num - 1]?.orderItem?.countOfTeamType }}</div>
                            </div>
                        </transition>
                    </div>
                </div>
            </div>
            <div class="center text-center" :style="{order: 1, ...themeBackground1(broadcast?.event)}">
                <div
                    class="bg-center event-logo"
                    :style="resizedImage(broadcast?.event?.theme, ['default_logo', 'default_wordmark'], 'w-500')"></div>
                <div class="draft-details draft-title">{{ draftTitle }}</div>
                <div class="draft-details draft-subtitle">{{ draftSubtitle }}</div>
                <div class="score">
                    <div v-if="middle === 'score'" class="middle scores">
                        <div class="middle-score">{{ match.score_1 || 0 }}</div>
                        <div class="middle-dash">-</div>
                        <div class="middle-score">{{ match.score_2 || 0 }}</div>
                    </div>
                    <div v-if="middle === 'vs'" class="middle vs">VS</div>
                </div>
                <div v-if="draftText" class="draft-text">
                    {{ draftText }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { logoBackground1, themeBackground1 } from "@/utils/theme-styles";
import { getNewURL, resizedImage, resizedImageNoWrap } from "@/utils/images.js";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { countStats, formatText, getPickBanItem, processPickBanOrder } from "@/utils/content-utils";
import { cleanID } from "shared";
import { GameOverrides } from "@/utils/games";
import { Howl } from "howler";
import Squeezable from "@/components/broadcast/Squeezable.vue";
import ThemeLogo from "@/components/website/ThemeLogo.vue";

export default {
    name: "HeroDraft",
    components: { ThemeLogo, Squeezable },
    props: ["broadcast", "match"],
    data: () => ({
        manualDraftAdvancing: true,
        usePickBanAudio: true,

        currentPickBan: 0,
        timingBarKey: 0,

        autoDraftInterval: null,
        autoDraftDuration: null,
        autoDraftLast: null,
        now: null,

        pickBanJustChanged: false,
        pickBanTimeout: false,

        loaded: {},
        audioPlaying: {},
        showStats: {}
    }),
    computed: {
        middle() {
            // if (!this.match) return "vs";
            // if (!((this.match.score_1 || 0) || (this.match.score_2 || 0))) return "vs";
            return "score";
            // return this.broadcast?.broadcast_settings?.includes("Use dots instead of numbers for score") ? "dots" : "score";
        },
        showAll() {
            return (this.broadcast?.broadcast_settings || [])?.includes("Always show all heroes on desk hero draft");
        },
        fearless() {
            return (this.broadcast?.broadcast_settings || [])?.includes("Show previous picks as fearless bans");
        },
        game() {
            return this.broadcast?.event?.game;
        },
        maxPlayers() {
            return this.gameOverride?.playerCount || 5;
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
                    team_1_protects: ReactiveArray("team_1_protects"),
                    team_2_picks: ReactiveArray("team_2_picks"),
                    team_2_bans: ReactiveArray("team_2_bans"),
                    team_2_protects: ReactiveArray("team_2_protects"),
                })

            });
        },
        priorityHistory() {
            if (!(this.broadcast?.broadcast_settings || []).includes("Show priority stats screen on hero draft")) return [];
            if (!this.hydratedMatch?.week) return [];

            const thisWeek = parseInt(this.hydratedMatch?.week.toString().split(".").pop());

            const previous = [
                thisWeek - 3,
                thisWeek - 2,
                thisWeek - 1,
                thisWeek
            ].filter(p => p > 0);


            const previousWeekMatches = ((ReactiveRoot(this.match?.event?.id, {
                "matches": ReactiveArray("matches")
            }))?.matches || []).filter(m => m.week && previous.includes(parseInt(m?.week.toString().split(".").pop())));

            const hydratedMatches = ReactiveArray("matches", {
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
                    team_1_protects: ReactiveArray("team_1_protects"),
                    team_2_picks: ReactiveArray("team_2_picks"),
                    team_2_bans: ReactiveArray("team_2_bans"),
                    team_2_protects: ReactiveArray("team_2_protects"),
                })
            })({
                matches: previousWeekMatches.map(m => m?.id)
            });

            return previous.map(p => ({
                week: p,
                matches: hydratedMatches.filter(m => m.week && p === parseInt(m?.week.toString().split(".").pop()))
            }));
        },
        priorityStats() {
            if (!this.priorityHistory.length) return [];
            return this.priorityHistory.map(({  week, matches }) => ({ week, stats: countStats(matches || [])}));
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
        fearlessMaps() {
            const maps = (this.hydratedMatch?.maps || []).map((map, i) => ({
                ...map,
                number: map.number || i + 1
            })).filter(map => !map.banner);
            return maps.filter(map => (map.draw || map.winner) && map.id !== this.currentMap?.id);
        },
        gameOverride() {
            if (this.match?.game || this.match?.event?.game) return GameOverrides[this.match?.game || this.match?.event?.game];
            return null;
        },
        pickBanOrder() {
            return processPickBanOrder(this.match?.pick_ban_order || this.gameOverride?.defaultPickBanOrder, this.currentMap?.flip_pick_ban_order);
        },
        firstPick() {
            return this.pickBanOrder.find(b => b.type === "pick");
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
        protects() {
            if (!this.currentMap?.id) return [[], []];

            if (this.pickBanOrder?.length) {
                // pad
                return [
                    this.padPickBans(this.currentMap?.team_1_protects || [], this.pickBanOrder.filter(o => o.type === "protect" && o.team === 1).length, "protect", 1, this.currentPickBan),
                    this.padPickBans(this.currentMap?.team_2_protects || [], this.pickBanOrder.filter(o => o.type === "protect" && o.team === 2).length, "protect", 2, this.currentPickBan),
                ];
            } else {
                return [
                    (this.currentMap?.team_1_protects || []),
                    (this.currentMap?.team_2_protects || []),
                ];
            }
        },
        stats() {
            const { matches } = ReactiveRoot(this.broadcast?.event?.id, {
                "matches": ReactiveArray("matches", {
                    "maps": ReactiveArray("maps", {
                        "team_1_picks": ReactiveArray("team_1_picks"),
                        "team_2_picks": ReactiveArray("team_2_picks"),
                        "team_1_bans": ReactiveArray("team_1_bans"),
                        "team_2_bans": ReactiveArray("team_2_bans"),
                        "team_1_protects": ReactiveArray("team_1_protects"),
                        "team_2_protects": ReactiveArray("team_2_protects")
                    })
                })
            });

            const stageMatches = matches.filter(match => match?.division === this.match?.division);

            const stats = countStats(stageMatches);
            console.log("stats", stats);

            return stats;
        },
        draftText() {
            const items = [];

            if (this.currentMap?.number) {
                items.push(`Map ${this.currentMap.number}`);
            }
            if (this.match?.first_to) {
                if (this.gameOverride?.useBestOf) {
                    items.push(`Best of ${(this.match.first_to * 2)-1}`);
                } else {
                    items.push(`First to ${this.match.first_to}`);
                }
            }

            if (!items?.length) return null;
            return items.join(" - ");
        },
        draftTitle() {
            return formatText(this.broadcast?.draft_title_format, this.broadcast?.event, this.match) || this.match?.sub_event;
        },
        draftSubtitle() {
            return formatText(this.broadcast?.draft_subtitle_format, this.broadcast?.event, this.match) || this.match?.round;
        },
        timingBarStyle() {
            if (!this.autoDraftDuration || !this.autoDraftLast) return null;
            const target = (this.autoDraftDuration) * 1000;
            const ms = (this.autoDraftLast.getTime() + (target)) - this.now.getTime();
            const width = Math.max(0, (Math.max(0, ms) / (target)) * 100);
            if (!width) return null;
            return {
                width: `${width}%`
            };
        },
        hideNextPick() {
            return this.pickBanJustChanged || Object.values(this.audioPlaying).some(Boolean);
        }
    },
    methods: {
        resizedImageNoWrap,
        getPickBanItem,
        cleanID,
        padPickBans(arr, count, type, team, manualAdvanceIndex) {
            console.log("pad pick ban", { arr, count, type, team }, { manual: this.manualDraftAdvancing, showAll: this.showAll });

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
                    console.log("auto draft advancing", arr[i], placeholder);
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
            this.resetAutoDraft();
            this.loaded = {};
        },
        resetAutoDraft() {
            this.timingBarKey = 0;
            if (this.autoDraftInterval) {
                clearInterval(this.autoDraftInterval);
            }
            this.autoDraftLast = null;
        },
        runAutoDraft(seconds) {
            this.timingBarKey = 0;


            this.autoDraftDuration = parseInt(seconds);
            if (this.autoDraftInterval) {
                clearInterval(this.autoDraftInterval);
            }
            if (this.currentPickBan >= this.pickBanOrder?.length) return;

            this.autoDraftLast = new Date();
            this.autoDraftInterval = setInterval(() => {
                this.currentPickBan++;

                setTimeout(() => {
                    this.timingBarKey++;
                    if (this.currentPickBan >= this.pickBanOrder?.length) {
                        // finished
                        this.autoDraftLast = null;
                        clearInterval(this.autoDraftInterval);
                    } else {
                        this.autoDraftLast = new Date();
                    }
                }, 500);
            }, (this.autoDraftDuration + 1) * 1000);
        },
        logoBackground1, resizedImage, themeBackground1,


    },
    watch: {
        "match.id": {
            immediate: true,
            handler(id, oldId) {
                console.log("match ID change", id, oldId);
                this.resetPickBan();
            }
        },
        currentPickBan(newNum, oldNum) {
            const statsTiming = {
                afterVoiceline: 3000,
                afterManual: 5000,
                page1: 6000,
                page2: 6000,
                page3: 6000,
            };


            this.pickBanJustChanged = true;
            if (this.pickBanTimeout) clearTimeout(this.pickBanTimeout);
            this.pickBanTimeout = setTimeout(() => {
                this.pickBanJustChanged = false;
            }, 1000);

            if (!this.usePickBanAudio || !this.pickBanOrder?.length) {
                // send stats straight away
                setTimeout(() => {
                    this.showStats[`${pickBan.type}/${pickBan.team}/${pickBan.countOfTeamType}`] = 1;
                    setTimeout(() => {
                        this.showStats[`${pickBan.type}/${pickBan.team}/${pickBan.countOfTeamType}`] = 2;
                        setTimeout(() => {
                            this.showStats[`${pickBan.type}/${pickBan.team}/${pickBan.countOfTeamType}`] = 0;
                        }, statsTiming.page2);
                    }, statsTiming.page1);
                }, statsTiming.afterManual);
                return;
            }
            console.log("~~ PICK BAN", oldNum, this.pickBanOrder?.length, this.pickBanOrder[oldNum]?.type);

            const pickBan = this.pickBanOrder[oldNum];
            if (!pickBan) return;
            const pickBanType = pickBan?.type;
            const item = (pickBanType === "pick" ? this.picks : this.bans)[pickBan.team - 1][pickBan.countOfTeamType - 1];
            console.log("~~", pickBan, pickBanType === "pick" ? this.picks : this.bans, item, pickBan.team - 1, pickBan.countOfTeamType - 1);
            const itemAudio = item?.[`${pickBanType}_audio`]?.[0];

            console.log("~~", item, itemAudio);
            if (!itemAudio) return console.warn("No audio found", item);
            const audio = new Howl({
                src: [getNewURL(itemAudio, "orig")],
                onplay: () => {
                    console.log("playing", pickBan);
                    this.audioPlaying[`${pickBan.type}/${pickBan.team}/${pickBan.countOfTeamType}`] = true;
                },
                onend: () => {
                    console.log("ending", pickBan);
                    this.audioPlaying[`${pickBan.type}/${pickBan.team}/${pickBan.countOfTeamType}`] = false;


                    setTimeout(() => {
                        this.showStats[`${pickBan.type}/${pickBan.team}/${pickBan.countOfTeamType}`] = 1;
                        setTimeout(() => {

                            if (!this.currentMap?.number || this.stats?.teamMaps?.[this.teams[pickBan.team - 1]?.id] > this.currentMap?.number) {
                                this.showStats[`${pickBan.type}/${pickBan.team}/${pickBan.countOfTeamType}`] = 2;
                                setTimeout(() => {

                                    if ((this.broadcast?.broadcast_settings || []).includes("Show priority stats screen on hero draft")) {
                                        this.showStats[`${pickBan.type}/${pickBan.team}/${pickBan.countOfTeamType}`] = 3;
                                        setTimeout(() => {
                                            this.showStats[`${pickBan.type}/${pickBan.team}/${pickBan.countOfTeamType}`] = 0;
                                        }, statsTiming.page3);
                                    } else {
                                        this.showStats[`${pickBan.type}/${pickBan.team}/${pickBan.countOfTeamType}`] = 0;
                                    }

                                }, statsTiming.page2);
                            } else {
                                // no stats for this team

                                if ((this.broadcast?.broadcast_settings || []).includes("Show priority stats screen on hero draft")) {
                                    this.showStats[`${pickBan.type}/${pickBan.team}/${pickBan.countOfTeamType}`] = 3;
                                    setTimeout(() => {
                                        this.showStats[`${pickBan.type}/${pickBan.team}/${pickBan.countOfTeamType}`] = 0;
                                    }, statsTiming.page3);
                                } else {
                                    this.showStats[`${pickBan.type}/${pickBan.team}/${pickBan.countOfTeamType}`] = 0;
                                }
                            }
                        }, statsTiming.page1);
                    }, statsTiming.afterVoiceline);
                }
            });
            setTimeout(() => {
                audio.play();
            }, 400);
        }
    },
    sockets: {
        advance_draft() {
            this.resetAutoDraft();
            this.currentPickBan++;
            console.log(this.currentPickBan);
        },
        reset_draft() {
            this.resetPickBan();
        },
        auto_draft(seconds) {
            this.runAutoDraft(seconds);
        },
        show_full_draft() {
            this.manualDraftAdvancing = false;
        }
    },
    mounted() {
        setInterval(() => this.now = new Date(), 100);
        if (this.autoDraftInterval) {
            clearInterval(this.autoDraftInterval);
        }
    }
};


class HeroAudioPlayer {
    constructor(trackData) {
        this.loaded = false;
        this.audio =
        console.log(this.audio);
        this.audio.play();
    }
}
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

.square {
    height: 100%;
    width: 2em;
}

.team-bans, .team-squares {
    height: 100%;
    display: flex;
}

.squares-text {
    padding: 0 0.5em;
}
.pick-text {
    position: absolute;
    bottom: 0;
    width: 100%;
    text-align: center;
    font-weight: bold;
    font-size: 1.25em;
    z-index: 2;
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
.right .team-bans,
.right .team-protects {
    flex-direction: row-reverse;
}

.pick-placeholder {
    width: 100%;
    height: 100%;
}

.timing-bar-container {
    height: 8px;
    width: 100%;
    display: flex;
    background-color: rgba(255,255,255,0.1);
    justify-content: center;
    transition: height .3s ease;
}
.timing-bar-container:not(.auto-active) {
    height: 0;
}
.timing-bar {
    height: 100%;
    width: 0;
    transition: width 200ms linear, opacity .5s ease;
}
.timing-bar.fade-leave-active {
    width: 0 !important;
}

img.image-center {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
}
.square-image {
    height: 36px;
    width: 100%;
}
.ban img.image-center, .square-image img {
    height: 36px;
    object-fit: contain;
}

.pick.audio-playing,
.ban.audio-playing .ban-image {
    background-color: var(--highlight, #ffefd740);
}
.pick, .square-image {
    transition: background-color 300ms ease;
}
.pick {
    overflow: hidden;
}


.pick .pick-image,
.ban img {
    transition: transform 300ms ease;
    transform: scale(1);
}

.pick.audio-playing .pick-image {
    transform: scale(1.1)
}
.ban.audio-playing img {
    transform: scale(1.25)
}

.pick-number {
    opacity: 0.2;
}


.pick-stats {
    z-index: 1;
    padding: 0.25em 0;
    justify-content: space-evenly !important;
}

.stat-stat {
    font-size: 1.5em;
    font-weight: bold;
    letter-spacing: 1px;
    line-height: 1;
}

.stat-text {
    line-height: 1;
    font-size: 1em;
}

.stat-row {
    width: 100%;
    line-height: 1;
    padding: 0 0.5em;
}

.pick-number {
    position: absolute;
    width: 100%;
    text-align: center;
}

.team-stats-row .stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.1em 0.2em;
}

.team-stats-row .stat-stat {
    font-size: 1.5em;
    text-align: right;
    width: 100%;
}
.team-stats-row .stat-row:last-child .stat-stat {
    text-align: center;
}
.stat--pickban .stat-stat {
    font-size: 2.5em;
}
.stat--team-winloss {
    font-size: 1em;
}
.stats-title {
    text-align: center;
    letter-spacing: 0.5px;
    font-size: 1em;
    text-transform: uppercase;
}
.team-stats-stat {
    padding: 0 0.1em;
}
.stats-title.team-stats-title {
    line-height: 1;
    font-size: 1.1em;
}
/*.team-stats-row {*/
/*    background-color: #ffffff30 !important;*/
/*    border-radius: .25em;*/
/*    border: 1px solid #ffffff40;*/
/*    margin-top: .25em;*/
/*}*/

.pick {
    --pick-text-height: 30px;
}

.pick-text {
    transition: bottom .25s ease;
    bottom: 0;
}
.pick-stats {
    transition: top .25s ease, opacity .25s ease .25s;
    position: absolute;
    top: 100%;
    height: calc(100% - var(--pick-text-height))
}


.pick.show-stats .pick-text {
    bottom: calc(100% - var(--pick-text-height)) !important;
}
.pick.show-stats .pick-stats.stats-page-1 {
    top: var(--pick-text-height) !important;
}
.pick.show-stats-2 .pick-stats.stats-page-2 {
    top: var(--pick-text-height) !important;
}
.pick.show-stats-3 .pick-stats.stats-page-3 {
    top: var(--pick-text-height) !important;
}
.spacer {
    flex-grow: 1;
}

.stats-page {
    height: 100%;
    gap: .2em;
    /*padding: 0.2em 0;*/
    display: flex;
    /*justify-content: flex-start;*/
    align-items: center;
    flex-direction: column;
    justify-content: space-around;
}

.stats-team-icon {
    width: 50px;
    height: 40px;
}
.stat--prio-pickban {
    font-size: 1.25em;
}
.stat--prio-pickban .stat-text {
    font-size: 11px;
}
.stat--winrate {
    font-size: 1.25em;
    text-align: center;
    display: flex;
}
.team-pill {
    font-size: 0.75em;
    line-height: 1em;
    padding: 3px 6px;
    border: 2px solid;
    border-radius: 1em;
}
.draft-details.draft-title {
    font-weight: bold;
    font-size: 1.1em;
}
.middle.scores {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: .25em;
    text-align: center;
}


.pick-ban-icons {
    display: flex;
    /*flex-direction: row;*/
    flex-direction: column;
    /*flex-wrap: wrap;*/
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

.pick-ban-priority-number {
    color: black;
    font-size: .4em;
}
.bg-first-ban {
    background-color: #fd4a14;
}

.priority-groups {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    text-align: center;
    justify-content: space-around;
}

.priority-group {
    font-size: 2.4em;
}

.priority-group-title {
    font-size: 0.35em;
    padding-bottom: .2em;
}

.priority-group-title:before {
    content: "#"
}

.stats-page-3 .stats-page {
    justify-content: flex-start;
}

.priority-stats-title.stats-title {
    font-size: 1em !important;
    letter-spacing: .0em;
    padding: 0.1em 0.2em;
    padding-top: .2em;
}

</style>

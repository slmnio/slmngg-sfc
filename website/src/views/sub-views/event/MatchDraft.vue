<template>
    <div v-if="draftingEnabled" class="draft-container bg-dark text-center rounded action-container">
        <div class="w-100 draft-display my-1">
            <PickBanDisplay
                :match="match"
                :map="currentMap"
                :order="pickBanOrder"
                :highlight-index="currentPickBanIndex"
                :teams-display="!showDraftInOrder"
                :fearless-maps="fearlessMaps" />
        </div>
        <div class="draft-title action-title h5 mb-0 flex-center gap-1" :class="isOwnTeamPick ? `bg-${{'ban': 'danger', 'pick': 'primary', 'protect': 'info text-black'}[currentPickBan?.type]}` : 'bg-secondary'">
            <div v-if="currentPickBanLabel">{{ currentPickBanLabel }}</div>
            <div v-else>Map {{ (match.maps?.length || 0) + ([STATES.preDraft, STATES.readyForNext].includes(state) ? 1 : 0) }} Draft: <b>{{ stateLabel }}</b></div>
        </div>
        <div class="action-content">
            <!--            <div class="draft-header w-100">-->
            <!--                <div class="team-names w-100">-->
            <!--                    <div class="team-name">-->
            <!--                        <div class="fw-bold">Picking First:</div>-->
            <!--                        <h1>{{ orderedTeams[0].name }}</h1>-->
            <!--                    </div>-->
            <!--                    <div v-if="currentPickBan">-->
            <!--                        <i class="pick-ban-chevron fas fa-fw" :class="currentPBSide === 1 ? 'fa-chevron-left' : 'fa-chevron-right'"></i>-->
            <!--                    </div>-->
            <!--                    <div class="team-name">-->
            <!--                        <div class="fw-bold">Picking Second:</div>-->
            <!--                        <h1>{{ orderedTeams[1].name }}</h1>-->
            <!--                    </div>-->
            <!--                </div>-->
            <!--                <div v-if="draftStarted || state === STATES.finished" class="pick-ban-display w-100">-->
            <!--                    <div class="team-display team-display-t1">-->
            <!--                        <div class="display-bans">-->
            <!--                            <div v-for="ban in ((flip ? processedPickBans.teamTwoBans : processedPickBans.teamOneBans) || [])" :key="ban.id" class="display-ban">-->
            <!--                                <div v-b-tooltip="ban?.name" class="display-pick-ban-image" :style="resizedImage(ban, ['icon', 'main_image'], 's-100')"></div>-->
            <!--                            </div>-->
            <!--                        </div>-->
            <!--                        <div class="display-picks">-->
            <!--                            <div v-for="pick in ((flip ? processedPickBans.teamTwoPicks : processedPickBans.teamOnePicks) || [])" :key="pick.id" class="display-pick">-->
            <!--                                <div v-b-tooltip="pick?.name" class="display-pick-ban-image" :style="resizedImage(pick, ['icon', 'main_image'], 's-100')"></div>-->
            <!--                            </div>-->
            <!--                        </div>-->
            <!--                    </div>-->
            <!--                    <div v-if="state !== STATES.finished" class="timer"><h1 class="mb-0">{{ timerLabel }}</h1></div>-->
            <!--                    <div class="team-display team-display-t2">-->
            <!--                        <div class="display-bans">-->
            <!--                            <div v-for="ban in ((flip ? processedPickBans.teamOneBans : processedPickBans.teamTwoBans) || [])" :key="ban.id" class="display-ban">-->
            <!--                                <div v-b-tooltip="ban?.name" class="display-pick-ban-image" :style="resizedImage(ban, ['icon', 'main_image'], 's-100')"></div>-->
            <!--                            </div>-->
            <!--                        </div>-->
            <!--                        <div class="display-picks">-->
            <!--                            <div v-for="pick in ((flip ? processedPickBans.teamOnePicks : processedPickBans.teamTwoPicks) || [])" :key="pick.id" class="display-pick">-->
            <!--                                <div v-b-tooltip="pick?.name" class="display-pick-ban-image" :style="resizedImage(pick, ['icon', 'main_image'], 's-100')"></div>-->
            <!--                            </div>-->
            <!--                        </div>-->
            <!--                    </div>-->
            <!--                </div>-->
            <!--                <div-->
            <!--                    v-else-if="[STATES.preDraft, STATES.readyForNext].includes(state)"-->
            <!--                    class="ready-states flex-center w-100">-->
            <!--                    <div class="w-100 flex-center gap-2">-->
            <!--                        <div-->
            <!--                            class="ready-state badge pill text-white"-->
            <!--                            :class="{'bg-success': readyChecks[orderedTeams[0].id], 'bg-secondary': !readyChecks[orderedTeams[0].id]}">-->
            <!--                            {{ readyChecks[orderedTeams[0].id] ? "Ready" : "Not Ready" }}-->
            <!--                        </div>-->
            <!--                        <div-->
            <!--                            v-if="ownTeam && ownTeamIsTeamOne"-->
            <!--                            class="ready-state badge pill text-white bg-primary">-->
            <!--                            Your team-->
            <!--                        </div>-->
            <!--                    </div>-->
            <!--                    <div class="w-100 flex-center gap-2">-->
            <!--                        <div-->
            <!--                            class="ready-state badge pill text-white"-->
            <!--                            :class="{'bg-success': readyChecks[orderedTeams[1].id], 'bg-secondary': !readyChecks[orderedTeams[1].id]}">-->
            <!--                            {{ readyChecks[orderedTeams[1].id] ? "Ready" : "Not Ready" }}-->
            <!--                        </div>-->
            <!--                        <div-->
            <!--                            v-if="ownTeam && !ownTeamIsTeamOne"-->
            <!--                            class="ready-state badge pill text-white bg-primary">-->
            <!--                            Your team-->
            <!--                        </div>-->
            <!--                    </div>-->
            <!--                </div>-->
            <!--            </div>-->
            <div v-if="state !== STATES.finished" class="timer"><h1 class="mb-0">{{ timerLabel }}</h1></div>
            <div v-if="draftStarted && state !== STATES.finished" class="w-100">
                <!--                <pre>{{ { ownIndex: this.ownTeamIndex, team: this.ownTeam?.id, teams: (hydratedMatch.teams || []).map(t => t.id) } }}</pre>-->
                <form class="w-100" @submit.prevent="lockIn(selectedHero)">
                    <div
                        class="pick-ban-container p-2 opacity-changes"
                        :class="{
                            'low-opacity': !isOwnTeamPick || !ownTeam,
                            'disabled low-opacity': !isOwnTeamPick || processing['lock_hero_long'] || !ownTeam,
                            'currently-picking currently-picking-t1': currentPickBan?.type === 'pick' && currentPickBan?.team === ((this.ownTeamIndex || 0) + 1),
                            'currently-picking currently-picking-t2': currentPickBan?.type === 'pick' && currentPickBan?.team !== ((this.ownTeamIndex || 0) + 1),
                            'currently-protecting currently-protecting-t1': currentPickBan?.type === 'protect' && currentPickBan?.team === ((this.ownTeamIndex || 0) + 1),
                            'currently-protecting currently-protecting-t2': currentPickBan?.type === 'protect' && currentPickBan?.team !== ((this.ownTeamIndex || 0) + 1),
                            'currently-banning currently-banning-t1': currentPickBan?.type === 'ban' && currentPickBan?.team === ((this.ownTeamIndex || 0) + 1),
                            'currently-banning currently-banning-t2': currentPickBan?.type === 'ban' && currentPickBan?.team !== ((this.ownTeamIndex || 0) + 1),
                        }">
                        <div
                            v-for="pick in pickableHeroes"
                            :key="pick.id"
                            class="flex-center pick"
                            :class="{
                                'pick-hover': cleanID(currentHover?.id) === cleanID(pick.id) && !isOwnTeamPick,
                                'pick-selected': cleanID(selectedHero?.id) === cleanID(pick.id) && isOwnTeamPick,

                                'pick-picked pick-picked-t1': (currentMap?.[ownTeamIsTeamOne ? 'team_1_picks' : 'team_2_picks'] || []).some(hero => cleanID(hero?.id) === cleanID(pick.id)),
                                'pick-picked pick-picked-t2': (currentMap?.[ownTeamIsTeamOne ? 'team_2_picks' : 'team_1_picks'] || []).some(hero => cleanID(hero?.id) === cleanID(pick.id)),
                                'pick-banned pick-banned-t1': (currentMap?.[ownTeamIsTeamOne ? 'team_1_bans' : 'team_2_bans'] || []).some(hero => cleanID(hero?.id) === cleanID(pick.id)),
                                'pick-banned pick-banned-t2': (currentMap?.[ownTeamIsTeamOne ? 'team_2_bans' : 'team_1_bans'] || []).some(hero => cleanID(hero?.id) === cleanID(pick.id)),
                                'pick-protected pick-protected-t1': (currentMap?.[ownTeamIsTeamOne ? 'team_1_protects' : 'team_2_protects'] || []).some(hero => cleanID(hero?.id) === cleanID(pick.id)),
                                'pick-protected pick-protected-t2': (currentMap?.[ownTeamIsTeamOne ? 'team_2_protects' : 'team_1_protects'] || []).some(hero => cleanID(hero?.id) === cleanID(pick.id)),

                                'pick-banned': pick._isPickable?.style === 'ban',
                                'pick-protected': pick._isPickable?.style === 'protect',
                                'pick-picked': pick._isPickable?.style === 'pick',

                                'unpickable disabled': !(pick._isPickable?.result)
                            }"
                            @click.prevent="setHovering(pick)"
                        >
                            <div class="pick-image-container flex-center">
                                <transition name="fade">
                                    <img
                                        v-show="loaded[pick.id]"
                                        class="image-center"
                                        :src="resizedImageNoWrap(pick, gameOverride?.imageSets?.matchDraftPick || ['main_image', 'icon'], 'h-200')"
                                        @load="() => loaded[pick.id] = true">
                                </transition>
                                <div v-if="pick._isPickable?.result === false && pick._isPickable?.reason" class="pick-image-reason">
                                    <div class="ban-icon">
                                        <i class="fas fa-fw" :class="pick._isPickable?.icon || 'fa-ban'"></i>
                                    </div>
                                    <div v-if="isOwnTeamPick" class="reason-text">{{ pick._isPickable.reason }}</div>
                                </div>
                            </div>
                            <div v-show="loaded[pick.id]" class="pick-text" :style="themeBackground1(broadcast?.event)">
                                {{ pick.name }}
                            </div>
                        </div>
                    </div>
                    <div class="mt-3">
                        <b-button
                            :variant="{'ban': 'danger', 'pick': 'primary', 'protect': 'info'}[currentPickBan?.type]"
                            type="submit"
                            :disabled="!canLockIn || processing['lock_hero_long']">
                            Lock in {{
                                currentPickBan?.type
                            }}
                            <LoadingIcon v-if="processing['lock_hero_long']" />
                        </b-button>
                    </div>

                    <div class="d-flex" style="justify-content: flex-end">
                        <div class="d-flex flex-column" style="justify-content: flex-start; text-align: left">
                            <b-form-checkbox v-model="onlyShowAvailable" inline>
                                Only show available heroes
                            </b-form-checkbox>
                            <b-form-checkbox v-model="showDraftInOrder" inline>
                                Show draft in order
                            </b-form-checkbox>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <!-- <div v-if="[STATES.preDraft, STATES.readyForNext, STATES.inProgress].includes(state)" class="button-row action-footer">-->
        <!--     <b-button :variant="readyChecks[ownTeam.id] ? 'success' : 'secondary'" @click.prevent="toggleReady()">-->
        <!--         <i class="fas fa-fw fa-check"></i> {{ readyChecks[ownTeam.id] ? "Unready" : "Ready Up" }}-->
        <!--     </b-button>-->
        <!--     <b-button @click.prevent="swapSide()">-->
        <!--         <i class="fas fa-fw fa-exchange"></i> Swap Sides-->
        <!--     </b-button>-->
        <!--     <b-button variant="primary" :disabled="Object.values(readyChecks).filter((r) => r).length !== 2" @click.prevent="start()">-->
        <!--         <i class="fas fa-fw fa-play"></i> Start Draft-->
        <!--     </b-button>-->
        <!-- </div>-->
    </div>
    <!--    <div v-else-if="draftingEnabled" class="p-2 bg-dark text-center rounded">-->
    <!--        You don't control a team in this draft.-->
    <!--    </div>-->
    <div v-else class="p-2 bg-dark text-center rounded">
        Drafting is not enabled.
    </div>
</template>

<script>
import { socket } from "@/socket";
import { useAuthStore } from "@/stores/authStore";
import { bg, resizedImage, resizedImageNoWrap } from "@/utils/images.js";
import { cleanID } from "shared";
import {dirtyID, processPickBanOrder } from "@/utils/content-utils";
import { ReactiveArray, ReactiveList, ReactiveRoot, ReactiveThing, } from "@/utils/reactive";
import { useInterval } from "@vueuse/core";
import { themeBackground1 } from "@/utils/theme-styles";
import { GameOverrides } from "@/utils/games";
import { sortAlpha } from "@/utils/sorts";
import PickBanDisplay from "@/views/sub-views/match-room/PickBanDisplay.vue";
import LoadingIcon from "@/components/website/LoadingIcon.vue";

const STATES = Object.freeze({
    preDraft: "preDraft",
    inProgress: "inProgress",
    finished: "finished",
    readyForNext: "readyForNext",
});

export default {
    name: "MatchDraft",
    components: { LoadingIcon, PickBanDisplay },
    props: ["match", "step", "stepData", "currentMapID", "controllableTeams"],
    data: () => ({
        selectedHero: null,
        currentPickBanIndex: null,
        loaded: {},
        readyChecks: {},
        currentHover: null,

        draftStarted: false,
        onlyShowAvailable: false,
        showDraftInOrder: true,

        counter: 0,
        draftCounterRunning: false,
        draftCounterReset: () => {
        },
        draftCounterPause: () => {
        },
        draftCounterResume: () => {
        },

        processing: {},
        error: {}
    }),
    computed: {
        fearlessMaps() {
            const maps = (this.hydratedMatch?.maps || []).map((map, i) => ({
                ...map,
                number: map.number || i + 1
            })).filter(map => !map.banner);
            return maps.filter(map => (map.draw || map.winner) && map.id !== this.currentMap?.id);
        },
        draftComplete() {
            const donePickBans = this.totalAvailableHeroes.length - this.availableHeroes.length;
            return donePickBans >= this.pickBanOrder.length;
        },
        readyForNextDraft() {
            if (!this.currentMap) return true;
            return (this.currentMap.winner || this.currentMap.draw) !== undefined;
        },
        STATES() {
            return STATES;
        },
        state() {
            if (!this.currentMap) return STATES.preDraft;
            if (this.currentMap && !this.currentMap.winner && !this.currentMap.draw && this.availableHeroes.length === this.totalAvailableHeroes.length) return STATES.preDraft;
            if (this.readyForNextDraft) return STATES.readyForNext;
            if (this.draftComplete) return STATES.finished;
            return STATES.inProgress;
        },
        stateLabel() {
            if (this.state === STATES.preDraft) return "Ready to start";
            if (this.state === STATES.inProgress) return "In progress";
            if (this.state === STATES.finished) return "Finished";
            if (this.state === STATES.readyForNext) return "Ready to start";
            return "Unknown state";
        },
        currentPickBanLabel() {
            if (!this.currentPickBan) return null;
            const teamIndex = this.flip ? +!(this.currentPickBan?.team - 1) : (this.currentPickBan?.team - 1);
            if (this.isOwnTeamPick) {
                return `${this.currentPickBan?.type.slice(0,1).toUpperCase()}${this.currentPickBan?.type.slice(1)} a ${this.gameOverride?.lang?.hero?.toLowerCase() || "hero" }`;
            } else {
                return `${this.orderedTeams[teamIndex]?.name} is ${this.currentPickBan?.type === "pick" ? "picking" : this.currentPickBan?.type === "protect" ? "protecting" : "banning" } a ${this.gameOverride?.lang?.hero?.toLowerCase() || "hero" }`;
            }
        },
        orderedTeams() {
            const t = [...this.hydratedMatch.teams];
            return this.flip ? t.reverse() : t;
        },
        ownTeam() {
            const {
                isAuthenticated,
                player
            } = useAuthStore();
            if (!isAuthenticated) return null;
            return this.hydratedMatch.teams?.find((t) =>
                [
                    ...(t.players || []),
                    ...(t.captains || []),
                    ...(t.staff || []),
                    ...(t.owners || []),
                ]?.includes(dirtyID(player.id))
            );
        },
        ownTeamIsTeamOne() {
            if (this.hydratedMatch.teams?.length !== 2) return false;
            return this.hydratedMatch.teams?.indexOf(this.ownTeam) === 0;
        },
        ownTeamIndex() {
            if (this.hydratedMatch.teams?.length !== 2) return false;
            console.log("own index", this.hydratedMatch.teams, this.ownTeam);
            return this.hydratedMatch.teams?.findIndex(t => cleanID(t?.id || t) === cleanID(this.ownTeam?.id));
        },
        ownTeamIsFirstPick() {
            return this.flip ? !this.ownTeamIsTeamOne : this.ownTeamIsTeamOne;
        },
        broadcast() {
            return this.match?.broadcast;
        },
        eventSettings() {
            if (!this.match?.event?.blocks) return null;
            return JSON.parse(this.match.event.blocks);
        },
        draftingEnabled() {
            return this.eventSettings?.drafting?.enabled || false;
        },
        draftPickTimer() {
            if (!this.draftingEnabled) return null;
            return this.eventSettings?.drafting?.pickTimer || 60;
        },
        timerLabel() {
            return Math.max(0, this.draftPickTimer - this.counter);
        },
        game() {
            return this.match?.event?.game;
        },
        gameOverride() {
            if (this.match?.game || this.match?.event?.game) return GameOverrides[this.match?.game || this.match?.event?.game];
            return null;
        },
        maxPlayers() {
            return this.gameOverride?.playerCount || 5;
        },
        totalAvailableHeroes() {
            return ReactiveList("Heroes").filter(
                (hero) => hero.game === this.game
            ).sort((a,b) => sortAlpha(a, b, "name")).map(h => ({
                ...h,
                _isPickable: this.isPickable(h)
            }));
        },
        pickableHeroes() {
            if (!this.onlyShowAvailable) return this.totalAvailableHeroes;
            return this.totalAvailableHeroes.filter(h => h._isPickable?.result);
        },
        hydratedMatch() {
            if (!this.match?.id) return null;
            return ReactiveRoot(this.match?.id, {
                teams: ReactiveArray("teams"),
                maps: ReactiveArray("maps", {
                    map: ReactiveThing("map"),
                    winner: ReactiveThing("winner", {
                        theme: ReactiveThing("theme"),
                    }),
                    picker: ReactiveThing("picker", {
                        theme: ReactiveThing("theme"),
                    }),
                    banner: ReactiveThing("banner", {
                        theme: ReactiveThing("theme"),
                    }),
                    team_1_picks: ReactiveArray("team_1_picks"),
                    team_1_bans: ReactiveArray("team_1_bans"),
                    team_1_protects: ReactiveArray("team_1_protects"),
                    team_2_picks: ReactiveArray("team_2_picks"),
                    team_2_bans: ReactiveArray("team_2_bans"),
                    team_2_protects: ReactiveArray("team_2_protects"),
                }),
            });
        },
        flip() {
            return this.currentMap?.flip_pick_ban_order;
        },
        pickBanOrder() {
            console.log(this.stepData);
            return processPickBanOrder(this.stepData?.rawPickBanOrder || this.match?.pick_ban_order || this.gameOverride?.defaultPickBanOrder, this.flip);
        },
        currentPickBan() {
            return this.pickBanOrder[this.currentPickBanIndex];
        },
        currentPBSide() {
            return this.flip ? (this.currentPickBan?.team === 1 ? 2 : 1) : (this.currentPickBan?.team);
        },
        isOwnTeamPick() {
            if (!this.ownTeam) return false;
            return this.currentPickBan?.team === (this.ownTeamIsTeamOne ? 1 : 2);
        },
        currentMap() {
            const maps = (this.hydratedMatch?.maps || []).map((map, i) => ({
                ...map,
                number: map.number || i + 1
            })).filter((map) => !map.banner);
            if (this.currentMapID) {
                const map = maps.find(map => cleanID(map.id) === cleanID(this.currentMapID));
                if (map) return map;
            }
            let currentMap = maps.find((map) => !(map.draw || map.winner)) || maps[maps.length - 1];
            return currentMap;
        },
        processedPickBans() {
            return {
                teamOnePicks: this.currentMap?.team_1_picks || [],
                teamTwoPicks: this.currentMap?.team_2_picks || [],
                teamOneBans: this.currentMap?.team_1_bans || [],
                teamTwoBans: this.currentMap?.team_2_bans || [],
            };
        },
        canLockIn() {
            return (this.selectedHero && this.isOwnTeamPick);
        },
        pickedPicks() {
            return new Set([...this.processedPickBans.teamOnePicks, ...this.processedPickBans.teamTwoPicks].map((h) => h.id));
        },
        teamOnePicks() {
            return new Set((this.flip ? this.processedPickBans.teamTwoPicks : this.processedPickBans.teamOnePicks).map((h) => h.id));
        },
        teamTwoPicks() {
            return new Set((this.flip ? this.processedPickBans.teamOnePicks : this.processedPickBans.teamTwoPicks).map((h) => h.id));
        },
        bannedPicks() {
            return new Set([...this.processedPickBans.teamOneBans, ...this.processedPickBans.teamTwoBans].map((h) => h.id));
        },
        availableHeroes() {
            return this.totalAvailableHeroes.filter((h) => !this.pickedPicks.has(h.id) && !this.bannedPicks.has(h.id));
        },
    },
    methods: {
        cleanID,
        resizedImage,
        bg,
        resizedImageNoWrap,
        themeBackground1,
        // toggleReady() {
        //     this.readyChecks[this.ownTeam.id] = !(this.readyChecks[this.ownTeam.id] || false);
        //     console.log({
        //         team: this.ownTeam.id,
        //         status: this.readyChecks[this.ownTeam.id]
        //     });
        //     socket.emit("match_draft", "team_ready", this.match.id, {
        //         team: this.ownTeam.id,
        //         status: this.readyChecks[this.ownTeam.id]
        //     });
        // },
        // swapSide() {
        //     socket.emit("match_draft", "swap_sides", this.match.id);
        // },
        start() {
            this.draftStarted = true;
            // this.currentPickBanIndex = 0;
            // socket.emit("match_draft", "draft_start", this.match.id);
            const {
                counter,
                isActive,
                reset,
                pause
            } = useInterval(1000, {
                controls: true,
                callback: this.intervalCalled
            });
            this.counter = counter;
            this.draftCounterRunning = isActive;
            this.draftCounterReset = reset;
            this.draftCounterPause = pause;
        },
        intervalCalled(seconds) {
            if (seconds > this.draftPickTimer) {
                console.log("Timer ran out!");
                this.draftCounterPause();
            }
        },
        setHovering(hero) {
            if (!this.isOwnTeamPick) return;
            console.log(`Starting hover of ${hero.name}`);
            this.selectedHero = hero;
            // socket.emit("match_draft", "team_hover", this.match.id, {
            //     team: this.ownTeam.id,
            //     hero,
            // });
            this.roomEmit("hero_draft:hover_hero", { teamID: this.ownTeam.id, heroID: hero.id });
        },
        lockIn(hero) {
            console.log(`Locking in ${hero.name}`);
            // socket.emit("match_draft", "team_lock", this.match.id, {
            //     team: this.ownTeam.id,
            //     pickBan: this.currentPickBan,
            //     hero,
            // });
            this.roomEmit("hero_draft:lock_hero", { teamID: this.ownTeam.id, heroID: hero.id });
            this.processing["lock_hero_long"] = true;
        },
        isPickable(hero) {
            const heroLocations = [
                "team_1_picks",
                "team_2_picks",
                "team_1_bans",
                "team_2_bans",
                "team_1_protects",
                "team_2_protects",
            ].filter(key => this.currentMap?.[key]?.find(h => cleanID(h?.id || h) === hero.id));
            const ownTeam = this.ownTeamIsTeamOne ? "team_1" : "team_2";
            const opponentTeam = !this.ownTeamIsTeamOne ? "team_1" : "team_2";

            console.log(hero, "found in", heroLocations, ownTeam, this.currentPickBan);

            if (!this.currentPickBan?.type) {
                return false;

            } else if (this.currentPickBan.type === "pick") {
                if (heroLocations.includes(`${ownTeam}_bans`)) return { result: false, reason: "Banned by own team" };
                if (heroLocations.includes(`${opponentTeam}_bans`)) return { result: false, reason: "Banned by opponent" };

                if (this.step?.settings?.pickAgnostic) {
                    // can be picked if on other team
                } else {
                    // normal solo-pick
                    if (heroLocations.includes(`${opponentTeam}_picks`)) return {
                        result: false,
                        reason: "Picked by opponent",
                        quietMessage: true
                    };
                }
                if (heroLocations.includes(`${ownTeam}_picks`)) return { result: false, reason: "Picked by own team", icon: "fa-check"  };

                // TODO: Fearless here
                if (this.step?.settings?.fearlessBans) {

                    if (this.step?.settings?.protectsBypassFearless) {
                        if (this.step?.settings?.pickAgnostic) {
                            if (heroLocations.includes(`${ownTeam}_protects`)) return { result: true, reason: "Protected by own team", icon: "fa-check"  };
                        } else {
                            if (heroLocations.includes(`${ownTeam}_protects`)) return { result: true, reason: "Protected by own team", icon: "fa-check"  };
                            if (heroLocations.includes(`${opponentTeam}_protects`)) return { result: true, reason: "Protected by opponent", icon: "fa-check"  };
                        }
                    }
                    // check previous maps, see if they should be bans or not

                    const checkTeams = this.step?.settings?.fearlessBans === "team_previous_picks" ? [`${ownTeam}_picks`] : ["team_1_picks", "team_2_picks"];
                    const previouslyPicked = this.fearlessMaps.some(map =>
                        checkTeams.some(key =>
                            (map?.[key] || []).find(h =>
                                cleanID(h?.id || h) === cleanID(hero.id))));

                    if (previouslyPicked) {
                        return { result: false, reason: "Fearless banned", style: "ban" };
                    } else {
                        return { result: true, reason: "Not picked previously" };
                    }
                }

            } else if (this.currentPickBan.type === "ban") {
                if (heroLocations.includes(`${ownTeam}_protects`)) return { result: false, reason: "Protected by own team" };
                if (heroLocations.includes(`${opponentTeam}_protects`)) return { result: false, reason: "Protected by opponent" };
                if (heroLocations.includes(`${ownTeam}_bans`)) return { result: false, reason: "Banned by own team" };
                if (heroLocations.includes(`${opponentTeam}_bans`)) return { result: false, reason: "Banned by opponent" };

                if (!this.step?.settings?.allowBansAnywhere) {
                    if (heroLocations.includes(`${ownTeam}_picks`)) return { result: false, reason: "Picked by own team", icon: "fa-check"  };
                    if (heroLocations.includes(`${opponentTeam}_picks`)) return { result: false, reason: "Picked by opponent" };
                }


                if (this.step?.settings?.fearlessBans) {
                    // check previous maps, see if they should be bans or not

                    const checkTeams = this.step?.settings?.fearlessBans === "team_previous_picks" ? [`${ownTeam}_picks`] : ["team_1_picks", "team_2_picks"];
                    const previouslyPicked = this.fearlessMaps.some(map =>
                        checkTeams.some(key =>
                            (map?.[key] || []).find(h =>
                                cleanID(h?.id || h) === cleanID(hero.id))));

                    if (previouslyPicked) {
                        return { result: false, reason: "Fearless banned", style: "ban" };
                    } else {
                        return { result: true, reason: "Not picked previously" };
                    }
                }


                if (this.step?.settings?.onlyBanOnce) {
                    const checkTeams = `${ownTeam}_bans`;
                    const previouslyPicked = this.fearlessMaps.some(map =>
                        checkTeams.some(key =>
                            (map?.[key] || []).find(h =>
                                cleanID(h?.id || h) === cleanID(hero.id))));

                    if (previouslyPicked) {
                        return { result: false, reason: "Already banned this series", style: "ban" };
                    } else {
                        return { result: true, reason: "Not banned this series" };
                    }
                }


            } else if (this.currentPickBan.type === "protect") {
                if (heroLocations.includes(`${ownTeam}_protects`)) return { result: false, reason: "Protected by own team", icon: "fa-check" };
                if (this.step?.settings?.protectFrom) {
                    // only pick from previous picks (i.e. fearless)

                    const checkTeams = this.step?.settings?.protectFrom === "team_previous_picks" ? [`${ownTeam}_picks`] : ["team_1_picks", "team_2_picks"];
                    const previouslyPicked = this.fearlessMaps.some(map =>
                        checkTeams.some(key =>
                            (map?.[key] || []).find(h =>
                                cleanID(h?.id || h) === cleanID(hero.id))));

                    if (previouslyPicked) {
                        return { result: true, reason: "Picked previously" };
                    } else {
                        return { result: false, reason: "Not picked previously" };
                    }
                } else {
                    // anything is pickable if nothing else is stopping it

                }
                if (heroLocations.includes(`${ownTeam}_protects`)) return { result: false, reason: "Protected by own team", icon: "fa-check" };
                if (heroLocations.includes(`${opponentTeam}_protects`)) return { result: false, reason: "Protected by opponent" };
                if (heroLocations.includes(`${ownTeam}_bans`)) return { result: false, reason: "Banned by own team" };
                if (heroLocations.includes(`${opponentTeam}_bans`)) return { result: false, reason: "Banned by opponent" };
                if (heroLocations.includes(`${ownTeam}_picks`)) return { result: false, reason: "Picked by own team", icon: "fa-check" };
                if (heroLocations.includes(`${opponentTeam}_picks`)) return { result: false, reason: "Picked by opponent", quietMessage: true };
            }


            return { result: true };

            /*
            *
            * Picks:
            *  - Default: Cannot be a pick from team 1 or team 2
            *  - Agnostic: Cannot be a pick from your team, but can be a pick from other team.
            *
            * Bans:
            *  - Default: Cannot be something that is picked, banned or protected.
            *
            * Protects:
            *  - Default: Can't be something that is picked, banned or protected.
            * */
        },
        async roomEmit(command, data) {
            console.log("sending room_command", cleanID(this.match.id), command, data);
            this.processing[command] = true;
            this.error[command] = null;
            // socket.emit("match_room:room_command", cleanID(this.id), event, data);
            try {
                socket.emit("match_room:room_command", cleanID(this.match.id), command, data, (err, response) => {
                    console.log("response", { err, response });

                    if (err || response.error) {
                        this.processing[command] = null;
                        this.error[command] = true;
                        this.$notyf.error(`${response?.errorMessage || response?.message || err?.message || err?.errorMessage || "This is taking longer than expected"}`);
                    } else {
                        this.processing[command] = null;
                        this.error[command] = false;
                    }
                });
            } catch (err) {
                // the server did not acknowledge the event in the given delay
                console.error("failed - timeout", err);
                this.processing[command] = false;
                this.error[command] = true;
            }
        }
    },
    watch: {
        "stepData.pickBanIndex": {
            immediate: true,
            handler(index) {
                if (index === undefined) return;
                this.currentPickBanIndex = index;
            }
        },
        currentPickBanIndex(newIndex) {
            this.processing["lock_hero_long"] = false;
            this.currentHover = null;
            this.selectedHero = null;
            this.draftCounterReset();
        }
    },
    sockets: {
        draft_start() {
            if (!this.draftStarted) return this.start();
        },
        team_ready({
            team,
            status
        }) {
            this.readyChecks[team] = status;
            console.log(`Team ${team} ${status}`);
        },
        team_hover({
            team,
            hero
        }) {
            console.log(team, hero);
            if (team === this.ownTeam.id) this.selectedHero = hero;
            this.currentHover = hero;
            console.log(`Team ${team} hovering ${hero.name}`);
        },
        team_lock({
            team,
            hero
        }) {
            console.log(`Team ${team} locked ${hero.name}`);
            this.currentHover = null;
            this.selectedHero = null;
            // TODO: derive this from the map picks/bans instead of incrementing
            // this.currentPickBanIndex++;
            this.draftCounterReset();
        },
        "match_room:pickBanIndex"(id, index) {
            console.log(id, index);
            if (cleanID(id) !== cleanID(this.match?.id)) return;
            this.currentPickBanIndex = index;
        },
        "hero_draft:hero_hover"(id, {
            teamID,
            heroID
        }) {
            console.log(id);
            if (cleanID(id) !== cleanID(this.match?.id)) return;

            console.log(teamID, heroID);
            const hero = this.totalAvailableHeroes.find(h => cleanID(h.id) === cleanID(heroID));
            console.log(hero, this.totalAvailableHeroes);
            if (!hero) return;

            if (this.ownTeam && cleanID(teamID) === cleanID(this.ownTeam?.id)) this.selectedHero = hero;
            this.currentHover = hero;
        },
        "match_room:step_update"(id, { stepData }) {
            console.log(id, stepData);
            if (cleanID(id) !== cleanID(this.match?.id)) return;
            this.currentPickBanIndex = stepData.pickBanIndex || 0;
        }
    },
    mounted() {
        // socket.emit("match_draft", "join", this.match.id);
        if (!this.draftStarted) return this.start();
    },
};
</script>
<style scoped>
@import "../match-editors.css";

.disabled {
    pointer-events: none;
}
.draft-container {
    --pick-opacity: 0.2;
    --pick-color: 48, 48, 48;

    --col-team-2: 192, 155, 84;
    --col-team-1: 94, 120, 231;
    --col-ban: 255, 0, 0;
    --col-protect: 23, 162, 184;
}

.pick {
    width: 100%;
    height: 100%;
    background-size: cover;
    position: relative;
    align-items: center;
    justify-content: flex-start;
    flex-direction: column;
    gap: 0.2em;
    border-radius: .25em;
    cursor: pointer;


    outline: 2px solid color-mix(in srgb, rgb(var(--pick-color)) 70%, transparent);
    background-image: radial-gradient(transparent, rgba(var(--pick-color), var(--pick-opacity)));
}
.pick * {
    user-select: none;
    pointer-events: none;
}

img.image-center {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
}
.pick:not(.unpickable):hover {
    --pick-opacity: 0.3;
}

.pick.unpickable {
    cursor: not-allowed;
}
.unpickable {
    opacity: 0.5;
}

.pick-hover {
    --pick-opacity: 0.2 !important;
    outline-style: dotted;
}
.pick-selected {
    --pick-opacity: 0.75 !important;
    outline-style: dashed;
}

.currently-picking-t2 .pick-hover:not(.unpickable),
.currently-picking-t2 .pick:hover:not(.unpickable),
.currently-picking-t2 .pick-selected:not(.unpickable) {
    --pick-color: var(--col-team-2);
}
.currently-picking-t1 .pick-hover:not(.unpickable),
.currently-picking-t1 .pick:hover:not(.unpickable),
.currently-picking-t1 .pick-selected:not(.unpickable) {
    --pick-color: var(--col-team-1);
}
.currently-banning .pick-hover:not(.unpickable),
.currently-banning .pick:hover:not(.unpickable),
.currently-banning .pick-selected:not(.unpickable) {
    --pick-color: var(--col-ban);
}

.currently-protecting .pick-hover,
.currently-protecting .pick:hover:not(.unpickable),
.currently-protecting .pick-selected:not(.unpickable) {
    --pick-color: var(--col-protect);
}

.pick-picked-t2 {
    --pick-opacity: 0.4;
    --pick-color: var(--col-team-2);
}
.pick-picked-t1 {
    --pick-opacity: 0.4;
    --pick-color: var(--col-team-1);
}


.pick-banned {
    --pick-opacity: 0.4;
    --pick-color: var(--col-ban);
}
.pick-protected {
    --pick-opacity: 0.4;
    --pick-color: var(--col-protect);
}

.pick-ban-container {
    display: grid;
    gap: 0.5em;
    row-gap: .5em;
    grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
}

.pick-image-container {
    width: 100%;
    height: 4em;
}

.pick-text {
    width: 100%;
    text-align: center;
    font-weight: bold;
    font-size: 1em;
    z-index: 2;
    line-height: 1;
    padding: 0.25em 0.5em;
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}
.draft-header {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.team-names {
    display: flex;
    justify-content: center;
    align-items: center;
    align-content: center;
}

.bans,
.team-name {
    flex: 1;
}

.pick-ban-display {
    justify-content: center;
    align-items: flex-start;
    align-content: center;
    display: flex;
}

.button-row {
    display: flex;
    column-gap: 1em;
    justify-content: center;
}

.ready-state {
    font-size: 1em;
}

.draft-container {
    flex-direction: column;
}
.pick-ban-chevron {
    font-size: 2em;
}
.timer {
    min-width: 5em;
}

.team-display {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: .5em;
}

.display-bans, .display-picks {
    display: flex;
    justify-content: center;
    gap: .5em;
}
.display-pick-ban-image {
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    width: 80%;
    height: 80%;
}
.display-pick, .display-ban {
    display: flex;
    justify-content: center;
    align-items: center;

    --pick-opacity: 0.2;
    --pick-color: 0, 0, 0;
    background-image: radial-gradient(transparent, rgba(var(--pick-color), var(--pick-opacity)));
    border-radius: .25em;
}
.display-ban {
    width: 2em;
    height: 2em;
}
.display-pick {
    width: 3em;
    height: 3em;
}

.display-ban {
    --pick-color: var(--col-ban);
}
.team-display-t1 .display-pick {
    --pick-color: var(--col-team-1);
}
.team-display-t2 .display-pick {
    --pick-color: var(--col-team-2);
}

.pick-image-reason {
    position: absolute;
    background-color: color-mix(in srgb,  rgba(var(--pick-color), 0.9), transparent);
    line-height: 1;
    padding: 0.25em 0.1em;
    font-weight: bold;
    color: white;
    font-size: 0.8em;
    max-width: 90%;
    border-radius: .25em;
}
.pick-image-reason .ban-icon {
    font-size: 1.5em;
    margin-bottom: .1em;
}


</style>

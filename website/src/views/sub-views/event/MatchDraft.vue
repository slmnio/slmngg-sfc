<template>
    <div v-if="draftingEnabled && ownTeam" class="draft-container bg-dark text-center rounded action-container">
        <div class="draft-title action-title h5 mb-0 flex-center gap-1" :class="{'bg-primary': isOwnTeamPick, 'bg-secondary': !isOwnTeamPick}">
            <div v-if="currentPickBanLabel">{{ currentPickBanLabel }}</div>
            <div v-else>Map {{ (match.maps?.length || 0) + ([STATES.preDraft, STATES.readyForNext].includes(state) ? 1 : 0) }} Draft: <b>{{ stateLabel }}</b></div>
        </div>
        <div class="action-content">
            <div class="draft-header w-100">
                <div class="team-names w-100">
                    <div class="team-name">
                        <div class="fw-bold">Picking First:</div>
                        <h1>{{ orderedTeams[0].name }}</h1>
                    </div>
                    <div v-if="currentPickBan">
                        <i class="pick-ban-chevron fas fa-fw" :class="currentPBSide === 1 ? 'fa-chevron-left' : 'fa-chevron-right'"></i>
                    </div>
                    <div class="team-name">
                        <div class="fw-bold">Picking Second:</div>
                        <h1>{{ orderedTeams[1].name }}</h1>
                    </div>
                </div>
                <div v-if="draftStarted || state === STATES.finished" class="pick-ban-display w-100">
                    <div class="team-display team-display-t1">
                        <div class="display-bans">
                            <div v-for="ban in ((flip ? processedPickBans.teamTwoBans : processedPickBans.teamOneBans) || [])" :key="ban.id" class="display-ban">
                                <div v-b-tooltip="ban?.name" class="display-pick-ban-image" :style="resizedImage(ban, ['icon', 'main_image'], 's-100')"></div>
                            </div>
                        </div>
                        <div class="display-picks">
                            <div v-for="pick in ((flip ? processedPickBans.teamTwoPicks : processedPickBans.teamOnePicks) || [])" :key="pick.id" class="display-pick">
                                <div v-b-tooltip="pick?.name" class="display-pick-ban-image" :style="resizedImage(pick, ['icon', 'main_image'], 's-100')"></div>
                            </div>
                        </div>
                    </div>
                    <div v-if="state !== STATES.finished" class="timer"><h1 class="mb-0">{{ timerLabel }}</h1></div>
                    <div class="team-display team-display-t2">
                        <div class="display-bans">
                            <div v-for="ban in ((flip ? processedPickBans.teamOneBans : processedPickBans.teamTwoBans) || [])" :key="ban.id" class="display-ban">
                                <div v-b-tooltip="ban?.name" class="display-pick-ban-image" :style="resizedImage(ban, ['icon', 'main_image'], 's-100')"></div>
                            </div>
                        </div>
                        <div class="display-picks">
                            <div v-for="pick in ((flip ? processedPickBans.teamOnePicks : processedPickBans.teamTwoPicks) || [])" :key="pick.id" class="display-pick">
                                <div v-b-tooltip="pick?.name" class="display-pick-ban-image" :style="resizedImage(pick, ['icon', 'main_image'], 's-100')"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    v-else-if="[STATES.preDraft, STATES.readyForNext].includes(state)"
                    class="ready-states flex-center w-100">
                    <div class="w-100 flex-center gap-2">
                        <div
                            class="ready-state badge pill text-white"
                            :class="{'bg-success': readyChecks[orderedTeams[0].id], 'bg-secondary': !readyChecks[orderedTeams[0].id]}">
                            {{ readyChecks[orderedTeams[0].id] ? "Ready" : "Not Ready" }}
                        </div>
                        <div
                            v-if="ownTeam && ownTeamIsTeamOne"
                            class="ready-state badge pill text-white bg-primary">
                            Your team
                        </div>
                    </div>
                    <div class="w-100 flex-center gap-2">
                        <div
                            class="ready-state badge pill text-white"
                            :class="{'bg-success': readyChecks[orderedTeams[1].id], 'bg-secondary': !readyChecks[orderedTeams[1].id]}">
                            {{ readyChecks[orderedTeams[1].id] ? "Ready" : "Not Ready" }}
                        </div>
                        <div
                            v-if="ownTeam && !ownTeamIsTeamOne"
                            class="ready-state badge pill text-white bg-primary">
                            Your team
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="draftStarted && state !== STATES.finished" class="w-100">
                <form class="w-100" @submit.prevent="lockIn(selectedHero)">
                    <div
                        class="pick-ban-container p-2 opacity-changes"
                        :class="{
                            'low-opacity': !isOwnTeamPick,
                            'currently-picking-t1': currentPickBan?.type === 'pick' && currentPickBan?.team === 1,
                            'currently-picking-t2': currentPickBan?.type === 'pick' && currentPickBan?.team === 2,
                            'currently-banning': currentPickBan?.type === 'ban'
                        }">
                        <div
                            v-for="pick in totalAvailablePicks"
                            :key="pick.id"
                            class="flex-center pick"
                            :class="{
                                'pick-hover': currentHover?.id === pick.id && !isOwnTeamPick,
                                'pick-selected': selectedHero?.id === pick.id && isOwnTeamPick,
                                'pick-picked-t1': teamOnePicks.has(pick.id),
                                'pick-picked-t2': teamTwoPicks.has(pick.id),
                                'pick-banned': bannedPicks.has(pick.id),
                                'unpickable': [...teamOnePicks, ...teamTwoPicks, ...bannedPicks].includes(pick.id)
                            }"
                            @click.prevent="setHovering(pick)"
                        >
                            <div class="pick-image-container">
                                <transition name="fade">
                                    <img
                                        v-show="loaded[pick.id]"
                                        class="image-center"
                                        :src="resizedImageNoWrap(pick, ['main_image', 'icon'], 'h-70')"
                                        @load="() => loaded[pick.id] = true">
                                </transition>
                            </div>
                            <div v-show="loaded[pick.id]" class="pick-text" :style="themeBackground1(broadcast?.event)">
                                {{ pick.name }}
                            </div>
                        </div>
                    </div>
                    <b-button variant="primary" type="submit" :disabled="!canLockIn">Lock in {{ currentPickBan?.type }}</b-button>
                </form>
            </div>
        </div>
        <div v-if="[STATES.preDraft, STATES.readyForNext, STATES.inProgress].includes(state)" class="button-row action-footer">
            <b-button :variant="readyChecks[ownTeam.id] ? 'success' : 'secondary'" @click.prevent="toggleReady()">
                <i class="fas fa-fw fa-check"></i> {{ readyChecks[ownTeam.id] ? "Unready" : "Ready Up" }}
            </b-button>
            <b-button @click.prevent="swapSide()">
                <i class="fas fa-fw fa-exchange"></i> Swap Sides
            </b-button>
            <b-button variant="primary" :disabled="Object.values(readyChecks).filter((r) => r).length !== 2" @click.prevent="start()">
                <i class="fas fa-fw fa-play"></i> Start Draft
            </b-button>
        </div>
    </div>
    <div v-else-if="draftingEnabled && !ownTeam" class="p-2 bg-dark text-center rounded">
        You don't control a team in this draft.
    </div>
    <div v-else class="p-2 bg-dark text-center rounded">
        Drafting is not enabled.
    </div>
</template>

<script>
import { socket } from "@/socket";
import { useAuthStore } from "@/stores/authStore";
import { bg, resizedImage, resizedImageNoWrap } from "@/utils/images.js";
import { dirtyID, processPickBanOrder } from "@/utils/content-utils";
import { ReactiveArray, ReactiveList, ReactiveRoot, ReactiveThing, } from "@/utils/reactive.js";
import { useInterval } from "@vueuse/core";
import { themeBackground1 } from "@/utils/theme-styles";
import { GameOverrides } from "@/utils/games";
import { sortAlpha } from "@/utils/sorts.js";

const STATES = Object.freeze({
    preDraft: "preDraft",
    inProgress: "inProgress",
    finished: "finished",
    readyForNext: "readyForNext",
});

export default {
    name: "MatchDraft",
    props: ["match"],
    data: () => ({
        selectedHero: null,
        currentPickBanIdx: null,
        loaded: {},
        readyChecks: {},
        currentHover: null,

        draftStarted: false,

        counter: 0,
        draftCounterRunnig: false,
        draftCounterReset: () => {
        },
        draftCounterPause: () => {
        },
        draftCounterResume: () => {
        },
    }),
    computed: {
        draftComplete() {
            const donePickBans = this.totalAvailablePicks.length - this.availablePicks.length;
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
            if (this.currentMap && !this.currentMap.winner && !this.currentMap.draw && this.availablePicks.length === this.totalAvailablePicks.length) return STATES.preDraft;
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
            return `${this.orderedTeams[this.currentPickBan?.team - 1]?.name} is ${this.currentPickBan?.type === "pick" ? "picking" : "banning"}`;
        },
        orderedTeams() {
            const t = this.hydratedMatch.teams;
            return this.flip ? t.reverse() : t;
        },
        ownTeam() {
            const {
                isAuthenticated,
                player
            } = useAuthStore();
            if (!isAuthenticated) return null;
            return this.hydratedMatch.teams?.find((t) =>
                t.captains?.includes(dirtyID(player.id))
            );
        },
        ownTeamIsTeamOne() {
            if (this.hydratedMatch.teams?.length !== 2) return false;
            return this.hydratedMatch.teams?.indexOf(this.ownTeam) === 0;
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
            if (this.game === "Deadlock") return 6;

            return 5;
        },
        totalAvailablePicks() {
            return ReactiveList("Heroes").filter(
                (hero) => hero.game === this.game
            ).sort((a,b) => sortAlpha(a, b, "name"));
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
                    team_2_picks: ReactiveArray("team_2_picks"),
                    team_2_bans: ReactiveArray("team_2_bans"),
                }),
            });
        },
        flip() {
            return this.currentMap?.flip_pick_ban_order;
        },
        pickBanOrder() {
            return processPickBanOrder(this.match?.pick_ban_order || this.gameOverride?.defaultPickBanOrder, this.flip);
        },
        currentPickBan() {
            return this.pickBanOrder[this.currentPickBanIdx];
        },
        currentPBSide() {
            return this.flip ? (this.currentPickBan?.team === 1 ? 2 : 1) : (this.currentPickBan?.team);
        },
        isOwnTeamPick() {
            return this.currentPickBan?.team === (this.ownTeamIsTeamOne ? 1 : 2);
        },
        currentMap() {
            const maps = (this.hydratedMatch?.maps || []).map((map, i) => ({
                ...map,
                number: map.number || i + 1
            })).filter((map) => !map.banner);
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
        availablePicks() {
            return this.totalAvailablePicks.filter((h) => !this.pickedPicks.has(h.id) && !this.bannedPicks.has(h.id));
        },
    },
    methods: {
        resizedImage,
        bg,
        resizedImageNoWrap,
        themeBackground1,
        toggleReady() {
            this.readyChecks[this.ownTeam.id] = !(this.readyChecks[this.ownTeam.id] || false);
            console.log({
                team: this.ownTeam.id,
                status: this.readyChecks[this.ownTeam.id]
            });
            socket.emit("match_draft", "team_ready", this.match.id, {
                team: this.ownTeam.id,
                status: this.readyChecks[this.ownTeam.id]
            });
        },
        swapSide() {
            socket.emit("match_draft", "swap_sides", this.match.id);
        },
        start() {
            this.draftStarted = true;
            this.currentPickBanIdx = 0;
            socket.emit("match_draft", "draft_start", this.match.id);
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
            this.draftCounterRunnig = isActive;
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
            socket.emit("match_draft", "team_hover", this.match.id, {
                team: this.ownTeam.id,
                hero,
            });
        },
        lockIn(hero) {
            console.log(`Locking in ${hero.name}`);
            socket.emit("match_draft", "team_lock", this.match.id, {
                team: this.ownTeam.id,
                pickBan: this.currentPickBan,
                hero,
            });
        },
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
            this.currentPickBanIdx++;
            this.draftCounterReset();
        },
    },
    mounted() {
        socket.emit("match_draft", "join", this.match.id);
    },
};
</script>
<style>

@import "../match-editors.css";

.draft-container {
    --pick-opacity: 0.2;
    --pick-color: 0, 0, 0;

    --col-team-1: 192, 155, 84;
    --col-team-2: 94, 120, 231;
    --col-ban: 255, 0, 0;
}

.pick {
    width: 100%;
    height: 100%;
    background-size: cover;
    position: relative;
    align-items: flex-start;
    flex-direction: column;
    gap: 0.2em;
    border-radius: .25em;
    cursor: pointer;


    background-image: radial-gradient(transparent, rgba(var(--pick-color), var(--pick-opacity)));
}
.pick * {
    user-select: none;
    pointer-events: none;
}

.pick:not(.unpickable):hover {
    --pick-opacity: 0.3;
}

.pick.unpickable {
    cursor: not-allowed;
}

.pick-hover {
    --pick-opacity: 0.2 !important;
}
.pick-selected {
    --pick-opacity: 0.75 !important;
}

.currently-picking-t1 .pick-hover:not(.unpickable),
.currently-picking-t1 .pick:hover:not(.unpickable),
.currently-picking-t1 .pick-selected:not(.unpickable) {
    --pick-color: var(--col-team-1);
}
.currently-picking-t2 .pick-hover:not(.unpickable),
.currently-picking-t2 .pick:hover:not(.unpickable),
.currently-picking-t2 .pick-selected:not(.unpickable) {
    --pick-color: var(--col-team-2);
}
.currently-banning .pick-hover:not(.unpickable),
.currently-banning .pick:hover:not(.unpickable),
.currently-banning .pick-selected:not(.unpickable) {
    --pick-color: var(--col-ban);
}

.pick-picked-t1 {
    --pick-opacity: 0.4;
    --pick-color: var(--col-team-1);
}

.pick-picked-t2 {
    --pick-opacity: 0.4;
    --pick-color: var(--col-team-2);
}

.pick-banned {
    --pick-opacity: 0.4;
    --pick-color: var(--col-ban);
}

.pick-ban-container {
    display: grid;
    gap: 0.3em;
    grid-template-columns: repeat(5, minmax(0, 1fr));
}

.pick-image-container {
    width: 100%;
    height: 100%;
}

.pick-text {
    width: 100%;
    text-align: center;
    font-weight: bold;
    font-size: 1.25em;
    z-index: 2;
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


</style>

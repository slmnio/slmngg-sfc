<template>
    <div v-if="draftingEnabled && ownTeam" class="draftContainer p-2 bg-dark text-center rounded">
        <div class="draftHeader">
            <div class="teamNames w-100">
                <div class="teamName">Picking First:<h1>{{ orderedTeams[0].name }}</h1></div>
                <div v-if="currentPickBan"><h1 class="pt-3">{{ currentPBSide === 1 ? "<" : ">" }}</h1></div>
                <div class="teamName">Picking Second:<h1>{{ orderedTeams[1].name }}</h1></div>
            </div>
            <div v-if="draftStarted" class="bansAndTimer w-100">
                <div class="bans">{{ (flip ? currentMap.team_2_bans : currentMap.team_1_bans).map(p => p.name).join(", ") }}</div>
                <div><h1>{{ timerLabel }}</h1></div>
                <div class="bans">{{ (flip ? currentMap.team_1_bans : currentMap.team_2_bans).map(p => p.name).join(", ") }}</div>
            </div>
            <div v-else class="bansAndTimer w-100">
                <div class="bans">{{ readyChecks[orderedTeams[0].id] ? "Ready" : "Not Ready" }}</div>
                <div class="bans">{{ readyChecks[orderedTeams[1].id] ? "Ready" : "Not Ready" }}</div>
            </div>
        </div>

        <!-- <b-button @click.prevent="start()">Start</b-button>
        <b-button @click.prevent="currentPickBanIdx++">Skip</b-button> -->
        <div v-if="draftStarted">
            <form @submit.prevent="lockIn(selectedHero)">
                <div class="pickbanContainer p-2">
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
                        }"
                        @click.prevent="setHovering(pick)"
                    >
                        <div class="pickImageContainer">
                            <transition name="fade">
                                <img v-show="loaded[pick.id]" class="image-center" :src="resizedImageNoWrap(pick, ['main_image', 'icon'], 'h-70')" @load="() => loaded[pick.id] = true">
                            </transition>
                        </div>
                        <div v-show="loaded[pick.id]" class="pick-text" :style="themeBackground1(broadcast?.event)">
                            {{ pick.name }}
                        </div>
                    </div>
                </div>
                <b-button type="submit" :disabled="!canLockIn">Lock in</b-button>
            </form>
        </div>
        <div v-else class="buttonRow">
            <b-button @click.prevent="toggleReady()">{{ readyChecks[ownTeam.id] ? "Unready" : "Ready Up" }}</b-button>
            <b-button :disabled="Object.values(readyChecks).filter((r) => r).length !== 2" @click.prevent="start()">Start Draft</b-button>
        </div>
    </div>
    <div v-else class="p-2 bg-dark text-center rounded">
        Drafting is not enabled.
    </div>
</template>

<script>
import { socket } from "@/socket";
import { useAuthStore } from "@/stores/authStore";
import { resizedImageNoWrap } from "@/utils/images.js";
import { dirtyID, processPickBanOrder } from "@/utils/content-utils";
import {
    ReactiveArray,
    ReactiveRoot,
    ReactiveList,
    ReactiveThing,
} from "@/utils/reactive.js";
import { useInterval } from "@vueuse/core";
import { themeBackground1 } from "@/utils/theme-styles";

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
        draftCounterReset: () => {},
        draftCounterPause: () => {},
        draftCounterResume: () => {},
    }),
    computed: {
        orderedTeams() {
            const t = this.hydratedMatch.teams;
            return this.flip ? t.reverse() : t;
        },
        ownTeam() {
            const { isAuthenticated, player } = useAuthStore();
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
        maxPlayers() {
            if (this.game === "Deadlock") return 6;

            return 5;
        },
        totalAvailablePicks() {
            return ReactiveList("Heroes").filter(
                (hero) => hero.game === this.game
            );
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
            return this.flip ? (this.currentPickBan.team === 1 ? 2 : 1) : (this.currentPickBan.team);
        },
        isOwnTeamPick() {
            return this.currentPickBan?.team === (this.ownTeamIsTeamOne ? 1 : 2);
        },
        currentMap() {
            const maps = (this.hydratedMatch?.maps || []).map((map, i) => ({ ...map, number: map.number || i + 1 })).filter((map) => !map.banner);
            let currentMap = maps.find((map) => !(map.draw || map.winner)) || maps[maps.length - 1];
            return currentMap;
        },
        canLockIn() {
            return (this.selectedHero && this.isOwnTeamPick);
        },
        pickedPicks() {
            return new Set([...this.currentMap.team_1_picks, ...this.currentMap.team_2_picks].map((h) => h.id));
        },
        teamOnePicks() {
            return new Set((this.flip ? this.currentMap.team_2_picks : this.currentMap.team_1_picks).map((h) => h.id));
        },
        teamTwoPicks() {
            return new Set((this.flip ? this.currentMap.team_1_picks : this.currentMap.team_2_picks).map((h) => h.id));
        },
        bannedPicks() {
            return new Set([...this.currentMap.team_1_bans, ...this.currentMap.team_2_bans].map((h) => h.id));
        },
        availablePicks() {
            return this.totalAvailablePicks.filter((h) => !this.pickedPicks.has(h.id) && !this.bannedPicks.has(h.id));
        },
    },
    methods: {
        resizedImageNoWrap,
        themeBackground1,
        toggleReady() {
            this.readyChecks[this.ownTeam.id] = !(this.readyChecks[this.ownTeam.id] || false);
            console.log({ team: this.ownTeam.id, status: this.readyChecks[this.ownTeam.id] });
            socket.emit("match_draft", "team_ready", this.match.id, { team: this.ownTeam.id, status: this.readyChecks[this.ownTeam.id]});
        },
        start() {
            this.draftStarted = true;
            this.currentPickBanIdx = 0;
            socket.emit("match_draft", "draft_start", this.match.id);
            const { counter, isActive, reset, pause } = useInterval(1000, { controls: true, callback: this.intervalCalled });
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
                hero,
            });
        },
    },
    sockets: {
        draft_start() {
            if (!this.draftStarted) return this.start();
        },
        team_ready({ team, status }) {
            this.readyChecks[team] = status;
            console.log(`Team ${team} ${status}`);
        },
        team_hover({ team, hero }) {
            console.log(team, hero);
            if (team === this.ownTeam.id) this.selectedHero = hero;
            this.currentHover = hero;
            console.log(`Team ${team} hovering ${hero.name}`);
        },
        team_lock({ team, hero }) {
            console.log(`Team ${team} locked ${hero.name}`);
            this.currentHover = null;
            this.selectedHero = null;
            this.currentPickBanIdx++;
        },
        set_first_pick({ team }) {
            console.log(`Team ${team} set as 1st pick.`);
        },
    },
    mounted() {
        socket.emit("match_draft", "join", this.match.id);
    },
};
</script>
<style>
.pick-hover,
.pick-selected {
    background-image: radial-gradient(transparent, rgba(0,0,0,0.6)) !important;
}
.pick-picked-t1 {
    background-image: radial-gradient(transparent, rgba(192,155,84,0.2)) !important;
}
.pick-picked-t2 {
    background-image: radial-gradient(transparent, rgba(94,120,231,0.2)) !important;
}
.pick-banned {
    background-image: radial-gradient(transparent, rgba(255,0,0,0.2)) !important;
}
.pick {
    width: 100%;
    height: 100%;
    background-size: cover;
    position: relative;
    background-image: radial-gradient(transparent, rgba(0,0,0,0.2));
    align-items: flex-start;
    flex-direction: column;
    gap: 0.2em;
}
.pickbanContainer {
    display: grid;
    gap: 0.3em;
    grid-template-columns: repeat(4, minmax(0, 1fr));
}

.pickImageContainer {
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

.draftHeader {
    display: flex;
    flex-direction: column;
    align-items: center;
}
.teamNames {
    display: flex;
    justify-content: center;
    align-items: center;
    align-content: center;
}
.bans,
.teamName {
    flex: 1;
}
.bansAndTimer {
    justify-content: center;
    align-items: top;
    align-content: center;
    display: flex;
}
.buttonRow {
    display:flex;
    padding-top: 2em;
    column-gap: 1em;
    justify-content: center;
}
</style>
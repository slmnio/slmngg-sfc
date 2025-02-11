<template>
    <div v-if="draftingEnabled" class="p-2 bg-dark text-center rounded">
        Welcome to the draft. You have {{ draftPickTimer }} seconds per
        pick/ban. You are drafting for <strong>{{ ownTeam.name }}</strong>. You are {{ ownTeamIsTeamOne ? 'first' : 'second' }} pick.
        <form @submit.prevent="lockIn(selectedHero)">
            <div v-for="pick in totalAvailablePicks" :key="pick.id">
                <input
                    :id="'heroSelect_' + pick.id"
                    v-model="selectedHero"
                    name="heroSelect"
                    type="radio"
                    class="peer hidden"
                    :value="pick"
                    :disabled="!this.availablePicks.includes(pick)"
                    @change="setHovering(pick)"
                >
                <label :for="'heroSelect_' + pick.id">{{ pick.name }}</label>
            </div>
            <button type="submit">Lock in</button>
        </form>
    </div>
    <div v-else class="p-2 bg-dark text-center rounded">
        Drafting is not enabled.
    </div>
</template>

<script>
import { socket } from "@/socket";
import { useAuthStore } from "@/stores/authStore";
import { dirtyID, processPickBanOrder } from "@/utils/content-utils";
import {
    ReactiveArray,
    ReactiveRoot,
    ReactiveList,
    ReactiveThing,
} from "@/utils/reactive.js";

export default {
    name: "MatchDraft",
    props: ["match"],
    data: () => ({
        selectedHero: null,
        currentPickBan: null,
    }),
    computed: {
        ownTeam() {
            const { isAuthenticated, player } = useAuthStore();
            if (!isAuthenticated) return null;
            return this.match?.teams?.filter((t) =>
                t.captains?.includes(dirtyID(player.id))
            )[0];
        },
        ownTeamIsTeamOne() {
            if (this.match?.teams?.length !== 2) return false;
            return this.match?.teams?.indexOf(this.ownTeam) === (this.currentMap.flip_pick_ban_order ? 1 : 0);
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
        game() {
            return this.match?.event?.game;
        },
        maxPlayers() {
            if (this.game === "Deadlock") return 6;

            return 5;
        },
        totalAvailablePicks() {
            return ReactiveList("Heroes").filter((hero) => hero.game === this.game);
        },
        hydratedMatch() {
            if (!this.match?.id) return null;
            return ReactiveRoot(this.match?.id, {
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
        pickBanOrder() {
            return processPickBanOrder(this.match?.pick_ban_order || this.gameOverride?.defaultPickBanOrder, this.currentMap?.flip_pick_ban_order);
        },
        currentMap() {
            const maps = (this.hydratedMatch?.maps || [])
                .map((map, i) => ({
                    ...map,
                    number: map.number || i + 1,
                }))
                .filter((map) => !map.banner);

            let currentMap =
                maps.find((map) => !(map.draw || map.winner)) ||
                maps[maps.length - 1];

            return currentMap;
        },
        pickedPicks() {
            return new Set(
                [
                    ...this.currentMap.team_1_picks,
                    ...this.currentMap.team_2_picks,
                ].map((h) => h.id)
            );
        },
        bannedPicks() {
            return new Set(
                [
                    ...this.currentMap.team_1_bans,
                    ...this.currentMap.team_2_bans,
                ].map((h) => h.id)
            );
        },
        availablePicks() {
            return this.totalAvailablePicks.filter(
                (h) =>
                    !this.pickedPicks.has(h.id) && !this.bannedPicks.has(h.id)
            );
        },
    },
    methods: {
        setHovering(hero) {
            console.log(`Starting hover of ${hero.name}`);
            socket.emit("match_draft", "team_hover", this.match.id, { team: this.ownTeam.id, hero });
        },
        lockIn(hero) {
            console.log(`Locking in ${hero.name}`);
            if (this.ownTeamIsTeamOne) {
                // this.match.
            }
            socket.emit("match_draft", "team_lock", this.match.id, { team: this.ownTeam.id, hero });
        }
    },
    sockets: {
        team_hover({team, hero}) {
            console.log(team, hero);
            console.log(`Team ${team} hovering ${hero.name}`);
        },
        team_lock({team, hero}) {
            console.log(`Team ${team} locked ${hero.name}`);
        },
        set_first_pick({team}) {
            console.log(`Team ${team} set as 1st pick.`);
        },
    },
    mounted() {
        socket.emit("match_draft", "join", this.match.id);
    },
};
</script>

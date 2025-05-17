<template>
    <div class="go-to-game">
        <PickBanDisplay
            :match="match"
            :map="currentMap"
            :order="pickBanOrder"
            :teams-display="true"
        />
        <hr>
        <div class="fw-bold bg-success rounded p-2"><i class="fas fa-check fa-fw mr-1"></i> All website steps have been completed for this map.</div>
        <div v-if="step?.instructions" class="mt-3 pb-2">
            <h3>Match Instructions</h3>
            <Markdown :markdown="step?.instructions" />
        </div>

        <div v-if="lobbyAdmins.length" class="mt-2">Lobby admin{{ lobbyAdmins.length === 1 ?'' : 's' }} for this match: <b>{{ niceJoin(lobbyAdmins) }}</b>.</div>
    </div>
</template>

<script>
import PickBanDisplay from "@/views/sub-views/match-room/PickBanDisplay.vue";
import { cleanID, processPickBanOrder } from "@/utils/content-utils.js";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive.js";
import Markdown from "@/components/website/Markdown.vue";

function niceJoin(array, and = "and") {
    if (array.length > 1) {
        const last = array.pop();
        return array.join(", ") + ` ${and} ` + last;
    }
    return array[0];
}
export default {
    name: "GoToGame",
    components: { Markdown, PickBanDisplay },
    props: ["match", "step", "stepData", "currentMapID", "controllableTeams", "showAdvanceButton"],
    data: () => ({
        showAdvanceReadyCheck: false
    }),
    computed: {
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
        lobbyAdmins() {
            return (this.hydratedMatch?.player_relationships || []).filter(r => r.singular_name === "Lobby Admin").map(r => r?.player?.name);
        },
        hydratedMatch() {
            if (!this.match?.id) return null;
            return ReactiveRoot(this.match?.id, {
                "player_relationships": ReactiveArray("player_relationships", {
                    "player": ReactiveThing("player")
                }),
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
        pickBanOrder() {
            return processPickBanOrder(this.stepData?.rawPickBanOrder || this.match?.pick_ban_order || this.gameOverride?.defaultPickBanOrder);
        },
    },
    methods: {niceJoin}
};
</script>

<style scoped>

</style>

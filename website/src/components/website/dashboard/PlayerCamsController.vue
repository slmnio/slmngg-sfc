<template>
    <div class="player-cams-controller d-flex flex-column gap-2 pb-2">
        <div class="cams-input d-flex" :class="{'flex-row-reverse': match?.flip_teams}">
            <div v-for="(team, teamI) in teams" :key="team.id" class="team-group d-flex flex-column">
                <div class="team-name text-center fw-bold">
                    {{ team.name }}
                </div>
                <div
                    class="team-content d-flex"
                    :class="{'flex-row-reverse text-right': teamI === (match?.flip_teams ? 0 : 1)}">
                    <div class="team-players">
                        <div
                            v-for="player in team.players"
                            :key="player.id"
                            class="team-player"
                            :class="{'selected': isSelected(player.id, teamI), 'flex-row-reverse': teamI === (match?.flip_teams ? 0 : 1)}"
                            @click="setPlayer(player.id, teamI)">
                            <div class="player-index">
                                <span v-if="isSelected(player.id, teamI)">{{ getIndex(player.id, teamI) + 1 }}</span>
                            </div>
                            <RoleIcon :role="player.role" />
                            <div class="player-name">{{ player?.name }}{{ usernameDiscriminator(player) }}</div>
                            <div v-if="!player?.live_guests?.length" v-b-tooltip="'Player does not have a Live Guest record'" class="mx-2"><i class="fas fa-video-slash"></i></div>
                        </div>
                    </div>
                    <div class="team-cams">
                        <div
                            class="cams-table"
                            :class="{'bg-info': teamI === (match?.flip_teams ? 1 : 0), 'bg-danger': teamI === (match?.flip_teams ? 0: 1) }">
                            <div
                                v-for="i in camCount"
                                :key="i"
                                class="cam px-2 py-1 fw-bold"
                                :class="{'flex-row-reverse': teamI === (match?.flip_teams ? 1 : 0)}"
                                @click="setPlayers[teamI][i-1] = null">
                                <div class="player-index">{{ i }}</div>
                                <div v-if="getPlayer(teamI, i - 1)?.name" class="player-name">{{ getPlayer(teamI, i - 1)?.name }}</div>
                                <div v-else-if="cams[`team_${teamI + 1}_cams`]?.[i]?.name || setPlayers[teamI]?.[i-1]" class="player-name d-flex flex-center gap-2" :class="{'flex-row-reverse': teamI === (match?.flip_teams ? 1 : 0)}">
                                    <i title="Not part of this team" class="fas fa-exclamation-triangle fa-fw"></i>
                                    <span>{{ cams[`team_${teamI + 1}_cams`]?.[i]?.name || setPlayers[teamI]?.[i-1] }}</span>
                                </div>
                                <!--                                <div v-if="getPlayer(teamI, i - 1)?.live_guests?.length"><i class="fas fa-video"></i></div>-->
                            </div>
                        </div>

                        <b-button variant="primary" class="mt-2" size="sm" @click="setPlayers[teamI] = []">
                            <i v-if="teamI === (match?.flip_teams ? 1 : 0)" class="fas fa-times fa-fw mr-1"></i>
                            <span>Clear</span>
                            <i v-if="teamI === (match?.flip_teams ? 0 : 1)" class="fas fa-times fa-fw ml-1"></i>
                        </b-button>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex-center d-flex gap-2">
            <b-button :disabled="processing.flipTeams" :variant="match.flip_teams ? 'primary' : 'secondary'" @click="toggleFlipTeams"><i class="fas fa-fw fa-exchange"></i> Flip teams</b-button>
            <b-button :disabled="(!canSubmit) || processing.playerCams" variant="success" @click="savePlayerCams"><i class="fas fa-fw fa-save"></i> Save</b-button>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import RoleIcon from "@/components/website/RoleIcon.vue";
import { authenticatedRequest } from "@/utils/dashboard";
import { cleanID } from "@/utils/content-utils";
import { GameOverrides } from "@/utils/games";

export default {
    name: "PlayerCamsController",
    components: { RoleIcon },
    props: ["broadcast", "match"],
    data: () => ({
        setPlayers: [
            [], []
        ],
        processing: {
            flipTeams: false,
            playerCams: false
        }
    }),
    computed: {
        gameOverride() {
            if (this.match?.game || this.match?.event?.game) return GameOverrides[this.match?.game || this.match?.event?.game];
            return null;
        },
        camCount() {
            return this.gameOverride?.playerCount || 5;
        },
        teams() {
            if (!this.match?.id) return [];
            return ReactiveRoot(this.match?.id, {
                "teams": ReactiveArray("teams", {
                    "theme": ReactiveThing("theme"),
                    "players": ReactiveArray("players")
                })
            })?.teams?.map(t => ({
                ...t,
                players: (t?.players || []).sort((a, b) => {
                    if (a.role !== b.role) {
                        const order = ["DPS", "Tank", "Support"];
                        return order.indexOf(a.role) - order.indexOf(b.role);
                    }
                    return 0;
                })
            }));
        },
        canSubmit() {
            if (!this.teams?.length) return false;
            return this.setPlayers.every(team => team.every(playerID => playerID !== null));
        },
        cams() {
            return ReactiveRoot(this.broadcast?.id, {
                "team_1_cams": ReactiveArray("team_1_cams", {
                    "player": ReactiveThing("player")
                }),
                "team_2_cams": ReactiveArray("team_2_cams", {
                    "player": ReactiveThing("player")
                })
            });
        }
    },
    methods: {
        async toggleFlipTeams() {
            try {
                this.processing.flipTeams = true;
                await authenticatedRequest("actions/toggle-flip-teams");
            } finally {
                this.processing.flipTeams = false;
            }
        },
        async savePlayerCams() {
            try {
                this.processing.playerCams = true;
                await authenticatedRequest("actions/set-player-cams", {
                    cams: this.setPlayers
                });
            } finally {
                this.processing.playerCams = false;
            }
        },
        setPlayer(playerID, teamI) {
            if (this.isSelected(playerID, teamI)) {
                // remove
                console.log("is selected", playerID, teamI);
                this.setPlayers[teamI].splice(this.getIndex(playerID, teamI), 1, null);
                return;
            }

            if (this.setPlayers[teamI].indexOf(null) !== -1) {
                // replace null
                console.log("replacing null", this.setPlayers[teamI].indexOf(null));
                this.setPlayers[teamI].splice(this.setPlayers[teamI].indexOf(null), 1, playerID);
                return;
            }

            if (this.setPlayers[teamI]?.length >= this.camCount) return;
            // push
            this.setPlayers[teamI].push(playerID);
        },
        isSelected(playerID, teamI) {
            return this.setPlayers?.[teamI]?.includes(playerID);
        },
        getIndex(playerID, teamI) {
            return this.setPlayers?.[teamI]?.indexOf(playerID);
        },
        getPlayer(teamI, playerI) {
            const id = this.setPlayers?.[teamI]?.[playerI];
            if (!id) return null;
            return this.teams?.[teamI]?.players?.find(p => p.id === id);
        },
        usernameDiscriminator(player) {
            const gameUsername = player?.[this.gameOverride?.usernameKey || "battletag"]?.split("#")?.[0];
            if (!gameUsername) return null;
            const different = gameUsername?.normalize("NFD").toLowerCase().trim() !== player?.name.normalize("NFD")?.toLowerCase().trim();
            if (different) {
                return ` (${gameUsername})`;
            }
        }
    },
    watch: {
        "cams.team_1_cams": {
            immediate: true,
            handler(cams) {
                this.setPlayers[0] = (cams || []).map(cam => cleanID(cam.player?.id));
            }
        },
        "cams.team_2_cams": {
            immediate: true,
            handler(cams) {
                this.setPlayers[1] = (cams || []).map(cam => cleanID(cam.player?.id));
            }
        }
    }
};
</script>

<style scoped>
    .team-group, .team-players, .team-cams {
        width: 100%;
        padding: .5em;
    }
    .team-player {
        display: flex;
        align-items: center;

        background-color: rgba(255,255,255,0.05);
        margin: .1em;
        padding: .1em;
        cursor: pointer;
        user-select: none;
        gap: .5em;
    }
    .team-player:hover {
        background-color: rgba(255,255,255,0.1);
    }

    .team-player.selected {
        background-color: rgba(255,255,255,0.15);
    }
    .team-player.selected:hover {
        background-color: rgba(255,255,255,0.2);
    }
    .player-index {
        width: 1.5em;
        height: 1.5em;
        text-align: center;
        background-color: rgba(0,0,0,0.25);
        border-radius: .2em;
    }
    .team-players.low-opacity {
        pointer-events: all;
    }

    .team-cams .cams-table {
        --bs-bg-opacity: 0.5 !important;
    }
    .cam {
        border-top: 1px solid rgba(0,0,0,0.25);
        display: flex;
        gap: .5em;
        cursor: pointer;
        user-select: none;
    }
    .cam:hover {
        background-color: rgba(255,255,255,0.1);
    }
</style>

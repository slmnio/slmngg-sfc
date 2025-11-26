<template>
    <div class="match-room">
        <div v-if="!matchRoomsEnabled" class="p-2 bg-dark text-center rounded">
            Match rooms disabled
        </div>
        <div v-else-if="'dev' === 1">
            <div class="badge badge-pill bg-secondary mr-2" style="font-size: 1em">{{ serverStatus }}</div>

            <h3>In room</h3>
            <ul>
                <li v-for="viewer in viewers" :key="viewer.id">{{ viewer?.name || '...' }} {{ viewer._authStatus }}</li>
            </ul>

            <b-button v-if="canWakeServer && serverStatus === 'wakeable'" variant="success" @click="wakeServer">Start match room</b-button>
            Match rooms enabled

            <hr>
        </div>
        <div v-else>
            <b-alert v-if="roomFrozen" :model-value="true" variant="info">
                <div><b>Room frozen by staff</b></div>
            </b-alert>
            <ActionCard v-if="serverStatus === 'wakeable' && canWakeServer" title="Match room">
                <template #footer-right>
                    <div v-if="serverStatus === 'wakeable'" class="d-flex gap-3 flex-center">
                        <div v-if="authStatus.team">Ready for use</div>
                        <b-button variant="success" @click="wakeServer">Start match room</b-button>
                    </div>
                    <div v-else>
                        Match room is currently unavailable. (<pre>{{ serverStatus }}</pre>)
                    </div>
                </template>
            </ActionCard>

            <ActionCard v-if="serverStatus === 'connected' && (roomState === 'collect-match-ready' || currentStep?.type === 'collect-ready')" :title="`Ready up (${(roomReady || []).length}/${(this.match.teams || [])?.length || 0})`" title-variant="primary">
                <div class="team-split d-flex w-100">
                    <div v-for="team in match.teams" :key="team.id" class="team w-100 d-flex flex-column gap-2">
                        <h3 class="team-top m-0">{{ team.name }}</h3>
                        <div class="team-buttons">
                            <b-button
                                v-if="roomReady.includes(cleanID(team.id))"
                                size="lg"
                                :disabled="!authStatus.teams?.includes(cleanID(team.id))"
                                variant="success"
                                @click="roomEmit('unready', { teamID: team.id })">
                                <i class="fas fa-check fa-fw mr-1"></i>
                                {{ authStatus.teams?.includes(cleanID(team.id)) ? 'Unready' : 'Ready' }} <span v-if="authStatus.teams?.includes(cleanID(team.id)) && processing['ready_up']"><LoadingIcon /></span>
                            </b-button>
                            <b-button
                                v-else
                                size="lg"
                                :disabled="!authStatus.teams?.includes(cleanID(team.id))"
                                :variant="authStatus.teams?.includes(cleanID(team.id)) ? 'primary' : 'secondary'"
                                @click="roomEmit('ready_up', { teamID: team.id })">
                                Ready up <span v-if="authStatus.teams?.includes(cleanID(team.id)) && processing['ready_up']"><LoadingIcon /></span>
                            </b-button>
                        </div>
                        <div class="team-viewers text-center">
                            <div class="fw-bold">In room</div>
                            <div
                                v-for="v in viewers.filter(v => (v?._authStatus?.teams || []).includes(cleanID(team.id)))"
                                :key="v.id"
                                class="viewer"
                            >
                                <i class="fas fa-user fa-fw mr-1"></i>{{ v.name || '...' }}
                            </div>
                        </div>
                    </div>
                </div>
                <template v-if="!loggedIn" #footer>
                    <div class="bg-primary px-2 py-1 rounded">You are viewing the room as a guest. <router-link to="/login" class="text-white text-underline">Log in</router-link> to interact.</div>
                </template>
                <template v-else #footer>
                    <div class="w-100 flex-column text-center flex-center">
                        <div class="w-100 text-center">
                            A representative from both teams is required to ready up.
                        </div>

                        <div v-if="viewers.filter(v => !(v?._authStatus?.teams || []).length).length" class="text-muted">
                            <i class="fas fa-eye fa-fw mr-1"></i> Viewers: {{ viewers.filter(v => !(v?._authStatus?.teams || []).length).map(v => v.name || '...').join(', ') }}
                        </div>
                    </div>
                </template>
            </ActionCard>


            <ActionCard v-else-if="mapCompleteDialog" title="Is the map complete?" title-variant="success">
                <div>
                    Only advance if you have finished a map.
                </div>
                <template #footer>
                    <div class="d-flex w-100" style="justify-content: space-between">
                        <b-button variant="secondary" @click="mapCompleteDialog = false"><i class="fas fa-chevron-left mr-1"></i> Go back</b-button>

                        <b-button
                            :disabled="processing['map_complete']"
                            variant="success"
                            @click="roomEmit('map_complete')">
                            <span v-if="processing['map_complete']"><LoadingIcon /></span>
                            Confirm map is complete <i class="fas fa-check ml-1"></i>
                        </b-button>
                    </div>
                </template>
            </ActionCard>
            <ActionCard v-else-if="serverStatus === 'connected'" :title="currentStep?.type || 'match-room'">
                <FlipPickBanOrder v-if="currentStep?.type === 'flip-pick-ban-order'" v-bind="{ step: currentStep, stepData: currentStepData, match, controllableTeams }" />
                <MatchDraft v-else-if="currentStep?.type === 'hero-draft'" v-bind="{ match, step: currentStep, stepData: currentStepData, controllableTeams, currentMapID: currentSectionData?.mapID }" />
                <GoToGame v-else-if="currentStep?.type === 'go-to-game'" class="w-100" v-bind="{ match, step: currentStep, stepData: currentStepData, controllableTeams, currentMapID: currentSectionData?.mapID, showAdvanceButton: true }" />


                <template v-if="!loggedIn" #footer>
                    <div class="bg-primary px-2 py-1 rounded"><i class="fas fa-info-circle fa-fw"></i> You are viewing the room as a guest. <router-link to="/login" class="text-white text-underline">Log in</router-link> to interact.</div>
                </template>
                <template v-else-if="currentStep?.type === 'go-to-game'" #footer>
                    <div class="w-100 d-flex" style="justify-content:flex-end">
                        <b-button variant="success" @click="mapCompleteDialog = true">Map complete <i class="fas fa-chevron-right fa-fw"></i></b-button>
                    </div>
                </template>
            </ActionCard>
            <ActionCard v-else-if="!serverStatus || serverStatus === 'offline'" title="Match room">
                This match room is currently inactive.
                <template v-if="!loggedIn" #footer>
                    <div class="bg-primary px-2 py-1 rounded">You are viewing the room as a guest. <router-link to="/login" class="text-white text-underline">Log in</router-link> to interact.</div>
                </template>
            </ActionCard>

            <ActionCard v-if="authStatus?.staff" class="mt-3" title="Staff panel">
                <b-button variant="danger" @click="check('Confirm full room reset') ? roomEmit('staff:reset') : {}">Full reset</b-button>
                <b-button variant="warning" @click="check('Advance to next room step') ? roomEmit('staff:advance') : {}">Advance to next step</b-button>
                <b-button variant="primary" @click="() => roomEmit('staff:set_pick_ban_index', { index: currentStepData.pickBanIndex - 1 })">PB index --</b-button>
                <b-button variant="primary" @click="() => roomEmit('staff:set_pick_ban_index', { index: 0 })">Set pick ban index to 0</b-button>
                <b-button variant="primary" @click="() => roomEmit('staff:set_pick_ban_index', { index: currentStepData.pickBanIndex + 1 })">PB index ++</b-button>


                <b-button variant="info" @click="check('Confirm room freeze') ? roomEmit('staff:freeze') : {}">Freeze</b-button>
                <b-button variant="info" @click="check('Confirm room unfreeze') ? roomEmit('staff:unfreeze') : {}">Unfreeze</b-button>
            </ActionCard>
        </div>
    </div>
</template>

<script>
import { useAuthStore } from "@/stores/authStore.ts";
import { cleanID } from "shared";
import { isEventStaffOrHasRole } from "@/utils/client-action-permissions.js";
import { getDataServerAddress } from "@/utils/fetch.js";
import { socket } from "@/socket.js";
import { authenticatedRequest } from "@/utils/dashboard.ts";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import ActionCard from "@/components/website/ActionCard.vue";
import LoadingIcon from "@/components/website/LoadingIcon.vue";
import FlipPickBanOrder from "@/views/sub-views/match-room/FlipPickBanOrder.vue";
import MatchDraft from "@/views/sub-views/event/MatchDraft.vue";
import GoToGame from "@/views/sub-views/match-room/GoToGame.vue";
import store from "@/thing-store.js";

export default {
    name: "MatchRoom",
    components: { GoToGame, MatchDraft, FlipPickBanOrder, LoadingIcon, ActionCard },
    props: ["match"],
    data: () => ({
        serverStatusCheck: null,
        socketStatus: null,
        roomState: null,
        viewerIDs: [],
        processing: {},
        error: {},
        roomReady: [],
        currentStepAddress: { section: null, index: -1 },
        currentStep: null,
        currentStepData: null,
        currentSectionData: null,
        mapCompleteDialog: false,
        roomFrozen: false
    }),
    computed: {
        eventSettings() {
            if (!this.match?.event?.blocks) return null;
            return JSON.parse(this.match.event.blocks);
        },
        matchComplete() {
            if (!this.match?.first_to) return false;
            return [this.match?.score_1 || 0, this.match?.score_2 || 0].some(x => x === this.match?.first_to);
        },
        matchRoomsEnabled() {
            return this.eventSettings?.matchrooms?.enabled;
        },
        controllableTeams() {
            const { isAuthenticated, player } = useAuthStore();
            if (!isAuthenticated) return [];
            return this.getControllableTeams(player);
        },
        authStatus() {
            const { isAuthenticated, user } = useAuthStore();
            if (!isAuthenticated) return false;
            return this.getAuthStatus(user);
        },
        loggedIn() {
            const { isAuthenticated } = useAuthStore();
            return isAuthenticated;
        },
        enabledMatchID() {
            if (!this.matchRoomsEnabled) return null;
            return this.match?.id || null;
        },
        canWakeServer() {
            if (store.getters.hasWebsiteFlag("server_rebuilding")) return false;
            return this.authStatus.team || this.authStatus.staff;
        },
        serverStatus() {
            if (this.socketStatus === "connected") return "connected";
            if (this.serverStatusCheck?.active) {
                // active but not connected
                if (this.socketStatus === "connecting") return "socketStatus";
                return "connectable";
            } else if (!this.serverStatusCheck?.active) {
                if (this.canWakeServer) {
                    return "wakeable";
                } else {
                    return "offline";
                }
            } else if (this.serverStatusCheck?.error) {
                return "error";
            } else {
                return "contacting";
            }
        },
        socketRoomID() {
            return `match_room:${this.match.id}`;
        },
        viewers() {
            return (ReactiveArray("ids")({ ids: this.viewerIDs })).map(viewer => ({
                ...viewer,
                _authStatus: this.getAuthStatus(viewer)
            }));
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
    },
    methods: {
        check(...args) {
            return window.confirm(...args);
        },
        cleanID,
        async wakeServer() {
            if (!this.canWakeServer) return;
            const response = await authenticatedRequest(`match-rooms/wake/${this.match?.id}`);
            console.log(response);
        },
        getControllableTeams(user) {
            return (this.match?.teams || []).filter(team => [
                ...team.players || [],
                ...team.captains || [],
                ...team.staff || [],
                ...team.owners || [],
            ].some(person => {
                return cleanID(user?.id || user?.airtableID) === cleanID(person?.id || person);
            }));
        },
        getAuthStatus(user) {
            let status = {
                team: false,
                teams: [],
                staff: false
            };
            const teams = this.getControllableTeams(user);
            if (teams.length) {
                status.team = true;
                status.teams = teams.map(t => cleanID(t.id));
            }

            const editorPerm = isEventStaffOrHasRole(user, this.match?.event, ["Can edit any match", "Can edit any event"]);
            if (editorPerm) status.staff = true;
            return status;
        },
        async roomEmit(command, data) {
            if (this.processing[command] && !command.includes("staff:")) return;
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
        "match.id": {
            immediate: true,
            async handler(id) {
                if (!id) return;
                console.log("id change", id);
                socket.emit("match-room:join", id);
                this.socketStatus = "requested";
            }
        },
        "enabledMatchID": {
            immediate: true,
            async handler(id) {
                if (!id) return;
                console.log("id change", id);
                this.serverStatusCheck = await fetch(`${getDataServerAddress()}/match-rooms/active/${this.match?.id}`).then(res => res.json());

                if (this.serverStatusCheck?.active && this.socketStatus !== "connected") {
                    console.log("joining match room", id);
                    socket.emit("match-room:join", id);
                    this.socketStatus = "waking";
                }
            }
        }
    },
    sockets: {
        connect() {
            if (this.match?.id) {
                console.log("wiping");
                this.serverStatusCheck = null;
                this.socketStatus = null;
                this.roomState = null;
                this.viewerIDs = [];
                this.processing = {};
                this.error = {};
                this.roomReady = [];

                socket.emit("match-room:join", this.match?.id);
            }
        },
        "match_room:join_ack"(id) {
            if (cleanID(id) !== cleanID(this.match?.id)) return;
            console.log("match_room:join_ack", { id });
            this.socketStatus = "connected";
        },
        "match_room:started"(id) {
            if (cleanID(id) !== cleanID(this.match?.id)) return;
            console.log("match_room:started", { id });
            this.socketStatus = "connected";
        },
        "match_room:viewers"(id, ids) {
            if (cleanID(id) !== cleanID(this.match?.id)) return;
            console.log("match_room:viewers", ids);
            this.viewerIDs = ids;
        },
        "match_room:inactive"(id) {
            if (cleanID(id) !== cleanID(this.match?.id)) return;
            console.log("match_room:inactive", { id });
            this.socketStatus = "connected-waiting";
        },
        "match_room:frozen"(id, state) {
            if (cleanID(id) !== cleanID(this.match?.id)) return;
            console.log("match_room:frozen", { id, state });
            this.roomFrozen = state;
        },
        "match_room:state"(id, state) {
            console.log("state", { id, state });
            if (cleanID(id) !== cleanID(this.match?.id)) return;
            this.roomState = state;
            this.mapCompleteDialog = false;
            this.processing = {};
            this.error = {};
        },
        "match_room:ready"(id, readies) {
            console.log("ready", { id, readies });
            if (cleanID(id) !== cleanID(this.match?.id)) return;
            this.roomReady = readies;
            this.processing["ready_up"] = false;
        },
        "match_room:step_update"(id, { address, step, stepData, sectionData }) {
            console.log("step update", { address, step });
            if (cleanID(id) !== cleanID(this.match?.id)) return;
            this.currentStepAddress = address;
            this.currentStep = step;
            this.currentStepData = stepData;
            this.currentSectionData = sectionData;
            this.mapCompleteDialog = false;
        }
    }
};
</script>

<style scoped>
    .text-underline {
        text-decoration: underline;
    }
    .team-split .team {
        align-items: center;
        justify-content: flex-start;
    }
</style>

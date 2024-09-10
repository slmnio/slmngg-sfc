<template>
    <div class="broadcast-roles">
        <table class="table table-bordered table-sm table-dark mb-0 border-no-top" style="table-layout: auto">
            <thead>
                <tr>
                    <th>Role</th>
                    <th class="text-nowrap">Assigned staff</th>
                    <th colspan="2">Staff</th>
                </tr>
            </thead>
            <tbody>
                <tr key="Caster">
                    <td class="w-25">Caster</td>
                    <td>
                        <linked-players v-if="casters?.length" :players="casters" />
                    </td>
                    <td class="form-groups">
                        <div v-for="i of formData['Caster']?.count" :key="i" class="form-group">
                            <b-form-select
                                v-model="formData['Caster'].selected[i-1]"
                                class="role-selectable opacity-changes"
                                size="sm"
                                :class="{'low-opacity': clientsLoading}"
                                :options="eventCasters"
                                @keydown.delete="() => formData['Caster'].selected[i-1] = null" />
                        </div>
                    </td>
                    <td style="width: 2em">
                        <b-button class="role-selectable" size="sm" variant="success" @click="formData['Caster'].count++">
                            <i class="fa fa-plus"></i>
                        </b-button>
                        <b-button
                            v-for="i of Math.max(0, (formData['Caster']?.count || 0) - 1)"
                            :key="i"
                            class="role-selectable"
                            size="sm"
                            variant="danger"
                            @click="removeRow('Caster', i)">
                            <i class="fa fa-minus"></i>
                        </b-button>
                    </td>
                </tr>
                <tr v-for="(role) in roles" :key="role">
                    <td class="w-25">{{ role }}</td>
                    <td>
                        <linked-players v-if="rolePlayers(role)?.length" :players="rolePlayers(role)" />
                    </td>
                    <td class="form-groups">
                        <div v-for="i of formData[role]?.count" :key="i" class="form-group">
                            <b-form-select
                                v-model="formData[role].selected[i-1]"
                                class="role-selectable opacity-changes"
                                size="sm"
                                :class="{'low-opacity': clientsLoading}"
                                :options="clientOptions"
                                @keydown.delete="() => formData[role].selected[i-1] = null" />
                            <div v-if="role === 'Observer'" class="observer-buttons">
                                <b-button size="sm" class="observer-button" :variant="observerTeamButtons?.[i-1]?.includes('Team 1') ? 'primary' : 'secondary'" @click="toggleObsTeamButton(i - 1, 'Team 1')">1</b-button>
                                <b-button size="sm" class="observer-button" :variant="observerTeamButtons?.[i-1]?.includes('Team 2') ? 'primary' : 'secondary'" @click="toggleObsTeamButton(i - 1, 'Team 2')">2</b-button>
                            </div>
                        </div>
                    </td>
                    <td style="width: 2em">
                        <b-button class="role-selectable" size="sm" variant="success" @click="formData[role].count++">
                            <i class="fa fa-plus"></i>
                        </b-button>
                        <b-button
                            v-for="i of Math.max(0, (formData[role]?.count || 0) - 1)"
                            :key="i"
                            class="role-selectable"
                            size="sm"
                            variant="danger"
                            @click="removeRow(role, i)">
                            <i class="fa fa-minus"></i>
                        </b-button>
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="d-flex justify-content-end p-2 gap-2">
            <b-button variant="secondary" @click="clearFormData">
                <i class="fas fa-fw fa-redo"></i> Reset
            </b-button>
            <b-button
                variant="success"
                :disabled="processing"
                class="opacity-changes"
                :class="{'low-opacity': processing}"
                @click="saveToCurrentMatch">
                <i class="fas fa-fw" :class="{'fa-save': !processing, 'fa-pulse fa-spinner': processing}"></i> Save to current match
            </b-button>
        </div>
    </div>
</template>
<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import LinkedPlayers from "@/components/website/LinkedPlayers.vue";
import { authenticatedRequest } from "@/utils/dashboard";

export default {
    name: "BroadcastRoles",
    components: { LinkedPlayers },
    props: {
        broadcast: {},
        liveMatch: {}
    },
    data: () => ({
        buttonCount: 6,
        processing: false,
        roles: ["Producer", "Observer", "Observer Director", "Replay Producer", "Lobby Admin"],
        defaultRoleCount: {
            Observer: 4,
            Caster: 2
        },
        formData: {},
        test: "",
        observerTeamButtons: []
    }),
    computed: {
        clients() {
            return new ReactiveRoot(this.broadcast?.id, {
                clients: ReactiveArray("clients", {
                    staff: ReactiveThing("staff")
                }),
                event: ReactiveThing("event")
            })?.clients || [];
        },
        clientsLoading() {
            return this.clients.some(c => c.__loading);
        },
        clientOptions() {
            return [
                { text: "", value: null },
                ...this.clients.map((client) => ({
                    text: client.name,
                    value: client?.staff?.id
                })).sort((a, b) => {
                    const [aName, bName] = [a, b].map(x => (x.text || "").toLowerCase());
                    if (aName > bName) return 1;
                    if (aName < bName) return -1;
                    return 0;
                })
            ];
        },
        matchRelationships() {
            return new ReactiveRoot(this.liveMatch?.id, {
                player_relationships: ReactiveArray("player_relationships", {
                    player: ReactiveThing("player")
                })
            })?.player_relationships || [];
        },
        casters() {
            return new ReactiveRoot(this.liveMatch?.id, {
                "casters": ReactiveArray("casters")
            })?.casters || [];
        },
        eventCasters() {
            return (new ReactiveRoot(this.broadcast?.id, {
                "event": ReactiveThing("event", {
                    "casters": ReactiveArray("casters")
                })
            })?.event?.casters || []).map((player) => ({
                text: player?.name,
                value: player?.id
            }));
        },
        clientObserverTeamButtons() {
            return (this.formData["Observer"]?.selected || []).map((playerID, i) => ({
                clientID: this.clients.find(client => client?.staff?.id === playerID)?.id,
                cams: this.observerTeamButtons?.[i]
            }));
        }
    },
    methods: {
        removeRow(role, i) {
            this.formData[role].selected.splice(i, 1);
            this.formData[role].count--;
        },
        async saveToCurrentMatch() {
            this.processing = true;
            try {
                console.log("form data", this.formData);
                const response = await authenticatedRequest("actions/set-player-relationships", {
                    matchID: this.liveMatch.id,
                    roles: this.formData,
                    clientCams: this.clientObserverTeamButtons
                });
                if (!response.error) {
                    const { added } = response.data;
                    this.$notyf.success(`${added.length} relationship${added.length === 1 ? "" : "s"} added`);
                }
            } finally {
                this.processing = false;
            }
        },
        rolePlayers(roleName) {
            return this.matchRelationships
                .filter(rel => rel?.singular_name === roleName)
                .map(rel => rel.player);
        },
        updateData(relationships, casters) {
            console.log("updating data",{ relationships, casters });
            this.clearFormData();
            for (const relationship of (relationships || this.matchRelationships)) {
                if (relationship.player?.id) {
                    this.formData[relationship.singular_name].selected.push(relationship.player?.id);
                }
            }
            for (const caster of (casters || this.casters)) {
                if (caster?.id) {
                    this.formData["Caster"].selected.push(caster?.id);
                }
            }
            for (const roleName in this.formData) {
                this.formData[roleName].count = Math.max(this.formData[roleName].selected.length, this.defaultRoleCount[roleName] || 1);
            }
        },
        resetFromServer() {
            this.updateData(this.matchRelationships, this.casters);
        },
        clearFormData() {
            this.roles.forEach(role => {
                this.formData[role] = {
                    count: this.defaultRoleCount[role] || 1,
                    selected: []
                };
            });
            this.formData["Caster"] = {
                count: this.defaultRoleCount["Caster"] || 1,
                selected: []
            };
        },
        playerClient(playerID) {
            console.log(playerID, this.clients);
            return this.clients?.find(c => c?.staff?.id === playerID);
        },
        clientTeamActive(teamKey, observerIndex) {
            const observerPlayerID = this.formData["Observer"]?.selected?.[observerIndex];
            if (!observerPlayerID) return;
            const client = this.clients?.find(c => c?.staff?.id === observerPlayerID);
            if (!client) return;
            return (client?.cams || []).includes(teamKey);
        },
        toggleObsTeamButton(observerIndex, teamKey) {
            console.log(observerIndex, teamKey, this.observerTeamButtons[observerIndex]);
            if (!this.observerTeamButtons?.[observerIndex]) return;
            if (this.observerTeamButtons[observerIndex].includes(teamKey)) {
                this.observerTeamButtons[observerIndex].splice(this.observerTeamButtons[observerIndex], 1);
            } else {
                this.observerTeamButtons[observerIndex].push(teamKey);
            }
        }
    },
    watch: {
        matchRelationships: {
            deep: true,
            immediate: true,
            handler(newRels, oldRels) {
                const [n, o] = [newRels, oldRels].map(x => (x || []).map(r => `${r?.id}-${r?.player?.name}`).join(","));
                if (n !== o) this.updateData(newRels);
            }
        },
        casters: {
            deep: true,
            immediate: true,
            handler(newCasters, oldCasters) {
                const [n, o] = [newCasters, oldCasters].map(x => (x || []).map(r => `${r?.id}-${r?.player?.name}`).join(","));
                if (n !== o) this.updateData(null, newCasters);
            }
        },
        "formData.Observer.selected": {
            deep: true,
            immediate: true,
            handler(selected) {
                console.log("obs selected", selected);
                this.observerTeamButtons = (selected || []).map(observerPlayerID => {
                    if (!observerPlayerID) return null;
                    const client = this.clients?.find(c => c?.staff?.id === observerPlayerID);
                    if (!client) return null;
                    return client?.cams || [];
                });
            }
        },
        clients: {
            deep: true,
            immediate: true,
            handler(clients) {
                this.observerTeamButtons = (this.formData?.Observer?.selected || []).map(observerPlayerID => {;
                    if (!observerPlayerID) return null;
                    const client = clients?.find(c => c?.staff?.id === observerPlayerID);
                    if (!client) return null;
                    return client?.cams || [];
                });
            }
        },
        "liveMatch.id": {
            immediate: true,
            handler(id) {
                console.log("id change", id);
                this.resetFromServer();
            }
        }
    }
};
</script>

<style>
    .opacity-changes {
        opacity: 1;
        transition: opacity .3s ease;
    }
    .low-opacity {
        opacity: 0.5;
        pointer-events: none;
        cursor: wait;
    }
    .role-selectable + .role-selectable {
        margin-top: 2px;
    }
    .form-groups {
        display: flex;
        flex-direction: column;
        gap: 2px;
        width: 100%;
        flex-grow: 1;
    }
    .form-group {
        display: flex;
        gap: 2px;
    }
    .observer-buttons {
        display: flex;
        gap: 2px;
    }
    .observer-button {
        width: 2.5em;
        text-align: center;
    }
</style>

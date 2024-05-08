<template>
    <div class="broadcast-roles">
        <table class="table table-bordered table-sm table-dark mb-0 border-no-top" style="table-layout: auto">
            <thead>
                <tr>
                    <th>Role</th>
                    <th class="text-nowrap">Assigned staff</th>
                    <th colspan="2">Clients</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(role) in roles" :key="role">
                    <td class="w-25">{{ role }}</td>
                    <td>
                        <linked-players v-if="rolePlayers(role)?.length" :players="rolePlayers(role)" />
                    </td>
                    <td class="w-100">
                        <b-form-select
                            v-for="i of formData[role]?.count"
                            :key="i"
                            v-model="formData[role].selected[i-1]"
                            class="role-selectable opacity-changes"
                            size="sm"
                            :class="{'low-opacity': clientsLoading}"
                            :options="clientOptions"
                            @keydown.delete="() => $set(formData[role].selected, i-1, null)" />
                    </td>
                    <td style="width: 2em">
                        <b-button class="role-selectable" size="sm" variant="success" @click="formData[role].count++">
                            <i
                                class="fa fa-plus"></i>
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
            <b-button variant="secondary" @click="resetFromServer">
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
            Observer: 4
        },
        formData: {},
        test: ""
    }),
    computed: {
        clients() {
            return new ReactiveRoot(this.broadcast?.id, {
                clients: ReactiveArray("clients", {
                    staff: ReactiveThing("staff")
                }),
                event: ReactiveThing("event")
            })?.clients;
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
                    roles: this.formData
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
        updateData(newShit) {
            if (!newShit) return;
            this.clearFormData();
            console.log("updating data", newShit);
            for (const relationship of newShit) {
                if (relationship.player?.id) {
                    this.formData[relationship.singular_name].selected.push(relationship.player?.id);
                }
            }
            for (const roleName in this.formData) {
                this.formData[roleName].count = Math.max(this.formData[roleName].selected.length, this.defaultRoleCount[roleName] || 1);
            }
        },
        resetFromServer() {
            this.updateData(this.matchRelationships);
        },
        clearFormData() {
            this.roles.forEach(role => {
                this.formData[role] = {
                    count: this.defaultRoleCount[role] || 1,
                    selected: []
                };
            });
        }
    },
    watch: {
        matchRelationships: {
            deep: true,
            immediate: true,
            handler(newShit, oldShit) {
                // console.log(data);
                this.updateData(newShit, oldShit);
            }
        }
    },
    mounted() {
        this.clearFormData();
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
</style>

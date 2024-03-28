<template>
    <div class="broadcast-roles">
        <table class="table table-bordered table-sm table-dark mb-0">
            <tr>
                <th>Role</th>
                <th>Clients</th>
                <!-- <th>Role</th> -->
            </tr>
            <tr v-for="(role) in roles" :key="role">
                <td>{{ role }}</td>
                <td>{{ formData[role] }}</td>
                <td>
                    <b-form-select v-for="i of formData[role]?.count" v-model="formData[role].selected[i-1]"  size="sm" :options="clientOptions"></b-form-select>
                </td>
                <td>
                    <b-button size="sm" variant="success" @click="formData[role].count++"><i class="fa fa-plus"></i></b-button>
                </td>
            </tr>
            <!-- <tr v-for="(client, i) in clients" :key="client.id">
                <td>{{ i+1 }}</td>
                <td>{{ client.name }}</td>
                <td><select></select></td>
            </tr> -->
        </table>
        <pre class="text-white">{{ formData }}</pre>
    </div>
</template>
<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { BButton, BButtonGroup, BFormSelect } from "bootstrap-vue";
import { updateGfxIndex } from "@/utils/dashboard";

export default {
    name: "BroadcastRoles",
    components: { BButtonGroup, BButton, BFormSelect },
    props: {
        broadcast: {},
        liveMatch: {}
    },
    data: () => ({
        buttonCount: 6,
        processing: false,
        roles: ["Producer", "Observer", "Replay Producer", "Observer Director", "Lobby Admin", "Tournament Admin", "Graphics Operator", "Stats Producer"],
        formData: {},
        test: ""
    }),
    computed: {
        buttonNumbers() {
            return Array.from(Array(this.buttonCount).keys());
        },
        clients() {
            return new ReactiveRoot(this.broadcast?.id, {
                clients: ReactiveArray("clients", {
                    staff: ReactiveThing("staff")
                }),
                event: ReactiveThing("event")
            })?.clients;
        },
        clientOptions() {
            return [
                { text: "", value: null },
                ...this.clients.map((client) => ({
                    text: client.name,
                    value: client?.staff?.id
                })).sort((a,b) => {
                    const [aName, bName] = [a,b].map(x => (x.text || "").toLowerCase())
                    console.log(aName, bName, a, b);
                    if (aName > bName) return 1;
                    if (aName < bName) return -1;
                    return 0;
                })
            ]
        },
        matchRelationships() {
            return new ReactiveRoot(this.liveMatch?.id, {
                player_relationships: ReactiveArray("player_relationships", {
                    player: ReactiveThing("player")
                })
            })?.player_relationships;
        }
    },
    methods: {
        async setGfxIndex(id, num) {
            this.processing = true;
            try {
                await updateGfxIndex(this.$root.auth, id, num);
            } finally {
                this.processing = false;
            }
        },
        updateData(newShit, oldShit) {
            // HERE
            if (!newShit) return;
            this.clearFormData()
            console.log("updating data", newShit)
            for (const relationship of newShit) {
                // console.log('cock', relationship, this.formData?.[relationship.singular_name])
                if (relationship.player?.id) {
                    this.formData[relationship.singular_name].selected.push(relationship.player?.id);
                }
            }
            for (const roleName in this.formData) {
                this.formData[roleName].count = Math.max(this.formData[roleName].selected.length, 1)
            }
        },
        clearFormData() {
            this.roles.forEach(role => {
            this.$set(this.formData, role, {
                count: 1,
                selected: []
            })
        })
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

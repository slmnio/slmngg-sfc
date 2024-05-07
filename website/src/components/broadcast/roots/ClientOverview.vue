<template>
    <div class="client-overview container">
        <h1>Client Overview - {{ client && client.key }}</h1>

        <b-button class="mt-2" variant="danger" @click="reloadAll"><i class="fas fa-redo fa-fw"></i> Reload all sources</b-button>

        <table class="my-3">
            <tbody>
                <tr
                    v-for="overlay in sortedOverlays"
                    :key="overlay.socket"
                    :class="{ 'overlay-minor': overlay.minor || overlay.forHumans, 'overlay-for-humans': overlay.forHumans, 'overlay-active bg-danger': overlay.active }">
                    <td>
                        <b-button size="sm" variant="dark" @click="sendToOverlay(overlay.socket, 'reload')"><i class="fa fa-fw fa-sync"></i></b-button>
                    </td>
                    <td>
                        <b-button size="sm" variant="dark" :href="overlay.fullPath" target="_blank"><i class="fa fa-fw fa-external-link"></i></b-button>
                    </td>
                    <td>
                        <span class="b-pad"><i class="fa fa-fw" :class="{'fa-eye': overlay.visible, 'fa-eye-slash': !overlay.visible}"></i></span>
                    </td>
                    <td>
                        <span class="b-pad fw-bold">{{ overlay.component }}</span>
                    </td>
                    <td>
                        <span class="b-pad">{{ decodeURIComponent(overlay.fullPath.replace(overlay.path, "")) }}</span>
                    </td>
                </tr>
            </tbody>
        </table>

        <div class="remote-obs-data">
            <div class="d-flex">
                <b-button @click="requestUpdate">Request update</b-button>
                <div class="ml-2 p-2 fw-bold">Remote OBS control</div>
            </div>

            <div v-if="remoteObsData" class="d-flex">
                <div class="p-2">
                    <b>Scenes</b>
                    <ul>
                        <li v-for="scene in (remoteObsData?.scenes || [])" :key="scene?.sceneName">{{ scene?.sceneName }}</li>
                    </ul>
                </div>
                <div class="p-2">
                    <b>Input</b>
                    <ul>
                        <li v-for="input in (remoteObsData?.inputs || [])" :key="input.inputName">{{ input.inputName }} <span class="ml-2 badge badge-pill badge-secondary">{{ input?.inputKind }}</span></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { socket } from "@/socket";

export default {
    name: "ClientOverview",
    props: ["client"],
    data: () => ({
        overlays: {},
        prodData: {
            forHumans: true
        },
        noBroadcastStyle: true,
        noStinger: true,

        remoteObsData: null
    }),
    meta: {
        noStinger: true
    },
    computed: {
        sortedOverlays() {
            const sortKeys = ["forHumans", "minor", "component"];
            return Object.values(this.overlays).sort((a, b) => {
                for (const key of sortKeys) {
                    if (a[key] && !b[key]) return 1;
                    if (!a[key] && b[key]) return -1;
                    if (a[key] > b[key]) return 1;
                    if (a[key] < b[key]) return -1;
                }
                return 0;
            });
        }
    },
    methods: {
        sendToOverlay(socketID, event, data) {
            if (socket) {
                socket.emit("prod-send", {
                    socketID,
                    event,
                    data
                });
            }
        },
        reloadAll() {
            if (!confirm("Are you sure you want to reload all client sources?")) return;
            this.sortedOverlays.forEach(overlay => {
                if (overlay.socket === socket.id) return;
                this.sendToOverlay(overlay.socket, "reload");
            });
        },
        requestUpdate() {
            if (socket) socket.emit("prod_trigger", "request_obs_remote_control_update");
        }
    },
    sockets: {
        prod_update(data) {
            this.overlays[data.socket] = data;
        },
        prod_disconnect(socketID) {
            this.$delete(this.overlays, socketID);
        },
        obs_remote_data(data) {
            if (!data?.[0]?.results) return;
            const [scenes, inputs] = data[0].results;
            console.log(scenes, inputs);
            this.remoteObsData = {
                scenes: scenes.scenes,
                inputs: inputs.inputs
            };
        }
    },
    mounted() {
        console.log("prod-join", this.client?.key);
        if (socket) {
            socket.emit("prod-overview-join", this.client?.key);
            socket.emit("prod_trigger", "request_obs_remote_control_update");
        }
    }

};
</script>

<style scoped>
    .client-overview {
        background-color: #222;
        color: white;
        overflow-y: initial !important;
        height: 100vh;
    }
    .b-pad {
        padding: 0 0.5rem;
    }
    .overlay-minor:deep(.btn) {
        padding: 1px 0.5rem;
        height: 26px;
    }
    tr.overlay-minor {
        height: 30px;
    }
    .fa-eye-slash {
        opacity: 0.3;
    }
</style>

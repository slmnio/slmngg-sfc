<template>
    <div class="client-overview container">
        <h1>Client Overview - {{ client && client.key }}</h1>
        <table class="my-3">
            <tr v-for="overlay in sortedOverlays" :key="overlay.socket" :class="{ 'overlay-minor': overlay.minor || overlay.forHumans, 'overlay-for-humans': overlay.forHumans, 'overlay-active bg-danger': overlay.active }">
                <td><b-button @click="sendToOverlay(overlay.socket, 'reload')" size="sm" variant="dark"><i class="fa fa-fw fa-sync"></i></b-button></td>
                <td><b-button size="sm" variant="dark" :href="overlay.fullPath" target="_blank"><i class="fa fa-fw fa-external-link"></i></b-button></td>
                <td><span class="b-pad"><i class="fa fa-fw" :class="{'fa-eye': overlay.visible, 'fa-eye-slash': !overlay.visible}"></i></span></td>
                <td><span class="b-pad fw-bold">{{ overlay.component }}</span></td>
                <td><span class="b-pad">{{ decodeURIComponent(overlay.fullPath.replace(overlay.path, "")) }}</span></td>
            </tr>
        </table>
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
        noStinger: true
    }),
    methods: {
        sendToOverlay(socketID, event, data) {
            if (socket) {
                socket.emit("prod-send", {
                    socketID,
                    event,
                    data
                });
            }
        }
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
    mounted() {
        console.log("prod-join", this.client?.key);
        if (socket) socket.emit("prod-overview-join", this.client?.key);
    },
    sockets: {
        prod_update(data) {
            this.$set(this.overlays, data.socket, data);
        },
        prod_disconnect(socketID) {
            this.$delete(this.overlays, socketID);
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
    .overlay-minor >>> .btn {
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

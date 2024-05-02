<template>
    <BroadcastApp v-if="broadcastID" :id="broadcastID" :title="title" :client="_client" :no-animation="noAnimation"
        :no-stinger="noStinger" :body-class="bodyClass" :full="full" :clientName="client" :background-index="backgroundIndex" :stinger-text="stingerText" :stingerThemeOverride="stingerThemeOverride" />
</template>

<script>
import { socket } from "@/socket";
import BroadcastApp from "@/apps/BroadcastApp";
import { ReactiveRoot, ReactiveThing } from "@/utils/reactive";

export default {
    name: "ClientApp",
    components: { BroadcastApp },
    props: ["client", "title", "noAnimation", "noStinger", "bodyClass", "full", "backgroundIndex", "stingerText", "stingerThemeOverride"],
    computed: {
        _client() {
            return ReactiveRoot(`client-${this.client}`, {
                broadcast: ReactiveThing("broadcast")
            });
        },
        broadcastID() {
            return this._client?.broadcast?.id;
        }
    },
    mounted() {
        console.log("prod-join", this.client);
        socket.emit("prod-join", this.client);
    },
    sockets: {
        connect() {
            socket.emit("prod-join", this.client);
        }
    }
};
</script>

<style scoped>

</style>

<template>
    <BroadcastApp v-if="broadcastID" :id="broadcastID" :title="title" :client="_client" />
</template>

<script>
import BroadcastApp from "@/apps/BroadcastApp";
import { ReactiveRoot, ReactiveThing } from "@/utils/reactive";
export default {
    name: "ClientApp",
    components: { BroadcastApp },
    props: ["client", "title"],
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
        this.$socket.client.emit("prod-join", this.client);
    }
};
</script>

<style scoped>

</style>

<template>
    <BroadcastApp v-if="broadcastID" :id="broadcastID" :title="title" />
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
    }
};
</script>

<style scoped>

</style>

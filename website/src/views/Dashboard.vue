<template>
    <div class="container">
        <h1>SLMN.GG Dashboard</h1>
        <div class="client-broadcasts" v-if="client && client.broadcast">
            <BroadcastSwitcher :broadcasts="client.broadcast" />
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import BroadcastSwitcher from "@/components/website/dashboard/BroadcastSwitcher";

export default {
    name: "Dashboard",
    components: { BroadcastSwitcher },
    computed: {
        user() {
            if (!this.$root.auth.user?.airtableID) return {};
            return ReactiveRoot(this.$root.auth.user.airtableID, {
                clients: ReactiveArray("clients", {
                    broadcast: ReactiveArray("broadcast", {
                        event: ReactiveThing("event", {
                            theme: ReactiveThing("theme")
                        })
                    })
                }) // TODO: make this just client
            });
        },
        client() {
            const client = this.user?.clients?.[0];
            if (!client?.broadcast) return {};
            return client;
        }
    }
};
</script>

<style scoped>

</style>

<template>
    <div v-if="team">
        <ThingTop :thing="team" type="team"></ThingTop>
        <div class="container">
            <table>
                <tr v-for="([key, val]) in Object.entries(team)" v-bind:key="key">
                    <td>{{ key }}</td>
                    <td>{{ val }}</td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script>

import { resolveThing } from "@/utils/fetch";
import ThingTop from "@/components/ThingTop";

export default {
    name: "Team",
    components: {
        ThingTop
    },
    computed: {},
    data: () => ({
        team: null
    }),
    methods: {
        async fetchData () {
            const team = await resolveThing(this.$route.params.teamId);
            team.theme = await resolveThing(team.theme);
            team.event = await resolveThing(team.event);
            this.team = team;
        }
    },
    async created () {
        await this.fetchData();
        this.sockets.subscribe("data-update", (d) => console.log(d));
        this.$socket.emit("subscribe", this.team.id);
    },
    sockets: {
        connect() { console.log("Team.vue - socket connected"); },
        data_update(id, data) { console.log("Team.vue - data update", id, data); }
    }
};

</script>

<style scoped>

</style>

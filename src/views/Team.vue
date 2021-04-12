<template>
    <div v-if="team">
        <ThingTop :thing="team" type="team"></ThingTop>
        <div class="container mt-3">
            <ContentRow v-if="team.captain" title="Captain">
                <ContentThing type="player" :text="team.captain.name" :thing="team.captain" :theme="team.theme"></ContentThing>
            </ContentRow>
            <ContentRow v-if="players" title="Players">
                <ContentThing type="player" :text="player.name" :thing="player" :theme="team.theme" v-for="player in players" v-bind:key="player.id"></ContentThing>
            </ContentRow>
            <ContentRow v-if="sister_teams" title="Sister teams">
                <ContentThing type="team" :show-logo="true" :text="item.name" :thing="item" :theme="item.theme" v-for="item in sister_teams" v-bind:key="item.id"></ContentThing>
            </ContentRow>
        </div>
        <div class="container">
            <table>
                <tr v-for="([key, val]) in Object.entries(team)" v-bind:key="key">
                    <td>{{ key }}</td>
                    <td style="max-width: 50vw; overflow:hidden; max-height: 7em">{{ val && val['name'] || val }}</td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script>

import { resolveThing, resolveID, resolveThings } from "@/utils/fetch";
import ThingTop from "@/components/ThingTop";
import ContentRow from "@/components/ContentRow";
import ContentThing from "@/components/ContentThing";

import { cleanID } from "@/utils/content-utils";

export default {
    name: "Team",
    components: {
        ThingTop, ContentRow, ContentThing
    },
    data: () => ({
        // team: null
        resolve_queue: []
    }),
    metaInfo() {
        return {
            title: "test title",
            meta: [
                { name: "description", content: "test description" },
                { name: "og:description", content: "test description" },
                { name: "og:title", content: this.team.name }
            ]
        };
    },
    computed: {
        players() {
            // return [];
            return this.team.players.filter(player => player && player.__stored);
        },
        sister_teams() {
            // return [];
            return this.team.sister_teams.filter(item => item && item.__stored);
        },
        team() {
            // use the
            let data = this.storeCache(this.$route.params.teamId);
            // console.log(">team computed", data);
            if (!data) return null;

            // console.log(this.subs);
            //

            data = {
                ...data,
                captain: this.storeCache(data.captain),
                event: this.storeCache(data.event),
                theme: this.storeCache(data.theme),
                players: (data.players || []).map(id => this.storeCache(resolveID(id))),
                sister_teams: (data.sister_teams || []).map(id => this.storeCache(resolveID(id)))
            };

            data.sister_teams.forEach(team => {
                if (team) team.theme = this.storeCache(resolveID(team.theme));
            });

            return data;
        }
        // subs() {
        //     // this.sub(this.team.id);
        //     // this.sub(this.team.theme.id);
        //     // this.sub(this.team.captain.id);
        //     // this.sub(this.team.event.id);
        //     // this.team.players.forEach(id => this.sub(resolveID(id)));
        //     return [];
        // }
    },
    watch: {
        subs(newSubs, oldSubs) {
            newSubs.forEach(sub => this.sub(sub));
        },
        async resolve_queue(newQueue, oldQueue) {
            const id = newQueue[0];
            if (!id) return;
            await resolveThing(id).then(e => { console.log(`Force resolved [${id}]`); });
        }
    },
    methods: {
        storeCache(id) {
            id = cleanID(resolveID(id));
            // console.log("store cache req", id);
            // console.log(">things", this.$store.state.things);
            const item = this.$store.state.things.find(item => item.id === id);
            if (!item || !item.__stored) {
                if (!this.resolve_queue.includes(id)) this.resolve_queue.push(id);
                return { id };
            }
            this.sub(id);
            return item;
        },
        async fetchData () {
            // get first load data
            const team = await resolveThing(this.$route.params.teamId);
            team.theme = await resolveThing(team.theme);
            team.captain = await resolveThing(team.captain);
            team.event = await resolveThing(team.event);
            team.players = await resolveThings(team.players);
            team.sister_teams = await resolveThings(team.sister_teams);
            // this.team = this.storeCache(this.$route.params.teamId);
            // console.log(">team", team);
            // team.theme = await resolveThing(team.theme);
            // team.event = await resolveThing(team.event);
            // this.team = team;
        },
        sub(id) {
            this.$socket.emit("subscribe", id);
        }
    },
    async created () {
        console.log("first load");
        // get first load data
        await this.fetchData();
        // set up subscriptions
        this.sub(this.team.id);
        this.sub(this.team.theme.id);
        this.sub(this.team.captain.id);
        this.sub(this.team.event.id);
        this.team.players.forEach(id => this.sub(resolveID(id)));
    },
    sockets: {
        connect() {
            console.log("Team.vue - socket connected");
        },
        data_update(id, data) {
            console.log("Team.vue - data update", id, data);
        }
    }
};

</script>

<style scoped>

</style>

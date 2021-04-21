<template>
    <div v-if="event">
        <ThingTop :thing="event" type="event"></ThingTop>

        <div class="container mt-3">
            <ContentRow title="Teams">
                <ContentThing :thing="team" type="team" :theme="team.theme" v-for="team in event.teams" v-bind:key="team.id" :show-logo="true"></ContentThing>
            </ContentRow>
        </div>
    </div>
</template>

<script>

import { fetchThing, fetchThings } from "@/utils/fetch";
import ThingTop from "@/components/ThingTop";
import ContentThing from "@/components/ContentThing";
import ContentRow from "@/components/ContentRow";

export default {
    name: "Event",
    props: ["id"],
    components: {
        ThingTop, ContentThing, ContentRow
    },
    computed: {},
    data: () => ({
        event: null
    }),
    methods: {
        async fetchData () {
            const event = await fetchThing(this.id);
            if (event.theme) event.theme = await fetchThing(event.theme[0]);
            event.teams = await fetchThings(event.teams);
            event.teams.forEach(async team => {
                if (team.theme) team.theme = await fetchThing(team.theme[0]);
            });
            this.event = event;
            // this.event = event;
        }
    },
    async created () {
        await this.fetchData();
    }
};

</script>

<style scoped>

</style>

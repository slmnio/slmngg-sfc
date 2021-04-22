<template>
    <div v-if="event">
        <ThingTop :thing="event" type="event"></ThingTop>

        <div class="container mt-3">
            <ContentRow title="Teams">
                <ContentThing :thing="team" type="team" :theme="team.theme" v-for="team in event.teams" v-bind:key="team.id" :show-logo="true"></ContentThing>
            </ContentRow>
            <ContentRow title="Staff">
                <ContentThing :thing="staff" type="player" :theme="event.theme" v-for="staff in event.staff" v-bind:key="staff.id"></ContentThing>
            </ContentRow>
        </div>
    </div>
</template>

<script>

import { fetchThing, fetchThings } from "@/utils/fetch";
import ThingTop from "@/components/ThingTop";
import ContentThing from "@/components/ContentThing";
import ContentRow from "@/components/ContentRow";
import { ReactiveRoot, ReactiveThing, ReactiveArray } from "@/utils/reactive";

export default {
    name: "Event",
    props: ["id"],
    components: {
        ThingTop, ContentThing, ContentRow
    },
    computed: {
        event() {
            return ReactiveRoot(this.id, {
                theme: ReactiveThing("theme"),
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                }),
                staff: ReactiveArray("staff")
            });
        }
    }
};

</script>

<style scoped>

</style>

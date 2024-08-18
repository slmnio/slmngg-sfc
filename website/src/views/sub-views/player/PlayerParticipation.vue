<template>
    <div>
        <div class="container">
            <h2>{{ player.participationPoints }} participation points</h2>
            <div v-for="event in player.participationEvents" :key="event.id" class="event d-flex mb-3">
                <div class="event-top d-flex">
                    <ContentThing
                        class="event-thing"
                        :thing="event"
                        :theme="event.theme"
                        show-logo="true"
                        type="event" />
                    <span class="event-points m-2">{{ event.participation_points }} point{{ event.participation_points === 1 ? '' : 's' }}</span>
                </div>
                <div class="event-bottom d-flex ml-2">
                    <ContentThing
                        v-for="team in eventTeams.get(event.id)"
                        :key="team.id"
                        class="team-thing"
                        :thing="team"
                        :theme="team.theme"
                        :show-logo="true"
                        type="team">
                        {{ team.name }}
                    </ContentThing>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import ContentThing from "@/components/website/ContentThing.vue";

export default {
    name: "PlayerParticipation",
    components: {
        ContentThing
    },
    props: ["player"],
    computed: {
        eventTeams() {
            const events = new Map();
            this.player.participationEvents.forEach(event => {
                events.set(event.id, []);
            });
            this.player.member_of.forEach(team => {
                if (events.has(team.event?.id)) {
                    events.get(team.event.id).push(team);
                }
            });

            return events;
        }
    }
};
</script>

<style scoped>
.event {
    display: flex;
    font-size: 1.25em;
}
</style>

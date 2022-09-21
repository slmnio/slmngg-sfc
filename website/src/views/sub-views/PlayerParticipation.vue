<template>
    <div>
        <div class="container">
            <h2>{{ player.participationPoints }} participation points</h2>
            <div class="event d-flex mb-3" v-for="event in player.participationEvents" :key="event.id">
                <div class="event-top d-flex">
                    <ContentThing class="event-thing" :thing="event" :theme="event.theme"
                                  show-logo="true" type="event"></ContentThing>
                    <span class="event-points m-2">{{ event.participation_points }} point{{ event.participation_points === 1 ? '' : 's' }}</span>
                </div>
                <div class="event-bottom d-flex ml-2">
                    <ContentThing class="team-thing" v-for="team in eventTeams.get(event.id)" :key="team.id"
                                  :thing="team" :theme="team.theme" :show-logo="true" type="team">{{ team.name }}</ContentThing>
                </div>

            </div>
        </div>
    </div>
</template>

<script>
import ContentThing from "@/components/website/ContentThing";

export default {
    props: ["player"],
    name: "PlayerParticipation",
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
    },
    components: {
        ContentThing
    }
};
</script>

<style scoped>
.event {
    display: flex;
    font-size: 1.25em;
}
</style>

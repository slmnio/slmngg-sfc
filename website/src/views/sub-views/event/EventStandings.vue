<template>
    <div class="container event-standings align-items-center d-flex flex-column">
        <Standings
            v-for="standing in standings"
            :key="standing.title"
            class="standings my-2"
            :event="event"
            :stage="standing.group"
            :stages="standing.groups"
            :title="standing.title"
            :tie-text="standing.tieText"
            show-map-diff />
    </div>
</template>

<script>
import Standings from "@/components/broadcast/Standings.vue";
export default {
    name: "EventStandings",
    components: { Standings },
    props: ["event"],
    computed: {
        settings() {
            if (!this.event?.blocks) return null;
            try {
                return JSON.parse(this.event.blocks);
            } catch (e) {
                return null;
            }
        },
        // _event() {
        //     return {
        //         ...this.event,
        //         ...ReactiveRoot(this.event.id, {
        //             teams: ReactiveArray("teams", {
        //                 matches: ReactiveArray("matches", {
        //                     teams: ReactiveArray("teams")
        //                 })
        //             })
        //         })
        //     };
        // },
        standings() {
            if (!this.settings?.standings) return [];

            return this.settings.standings;/* .map(config => {
                return ({
                    meta: config
                });
            }); */
        }
    }
};
</script>

<style scoped>
    .standings {
        font-size: 24px;
        width: fit-content;
    }
    .standings:deep(.standings-team) {
        padding: 4px 0;
    }
    .standings:deep(.team-name) {
        margin-right: 32px;
        min-width: 250px;
    }
    .standings:deep(.team-name.team-code) {
        margin-right: 32px;
        min-width: 50px;
    }
</style>

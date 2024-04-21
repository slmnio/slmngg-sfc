<template>
    <div class="container event-standings align-items-center d-flex flex-column">
        <Standings class="standings my-2" v-for="standing in standings" :key="standing.title"
                   :event="event" :stage="standing.group" :title="standing.title" :tie-text="standing.tieText" show-map-diff />
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
    .standings >>> .standings-team {
        padding: 4px 0;
    }
    .standings >>> .team-name {
        margin-right: 32px;
        min-width: 250px;
    }
    .standings >>> .team-name.team-code {
        margin-right: 32px;
        min-width: 50px;
    }
</style>

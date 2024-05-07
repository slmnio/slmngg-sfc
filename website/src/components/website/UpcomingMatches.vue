<template>
    <div v-if="matches && matches.length" class="upcoming-matches">
        <h1>Upcoming Matches</h1>
        <div class="matches-holder row">
            <UpcomingMatch v-for="match in matches" :key="match.id" :match="match" />
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import UpcomingMatch from "@/components/website/UpcomingMatch";

export default {
    name: "UpcomingMatches",
    components: { UpcomingMatch },
    computed: {
        matches() {
            return (ReactiveRoot("special:upcoming-matches", {
                matches: ReactiveArray("matches", {
                    teams: ReactiveArray("teams", {
                        theme: ReactiveThing("theme")
                    }),
                    event: ReactiveThing("event", {
                        theme: ReactiveThing("theme")
                    })
                })
            })?.matches || []).slice(0, 6);
        }
    }
};
</script>

<style scoped>
    .matches-holder {
        margin-left: -5px;
        margin-right: -5px;
    }
</style>

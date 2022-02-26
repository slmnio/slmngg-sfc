<template>
    <div class="container">
        <h2 class="text-center mb-3">Team matches</h2>
        <div class="w-100">
            <ScheduleMatch class="match" v-for="match in matches" :match="match" :key="match.id" :left-team="team" />
        </div>
    </div>
</template>

<script>
import ScheduleMatch from "@/components/website/schedule/ScheduleMatch";
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import { sortMatches } from "@/utils/sorts";

export default {
    name: "TeamMatches",
    props: ["team"],
    components: {
        ScheduleMatch
    },
    computed: {
        matches() {
            if (!this.team?.matches?.length) return [];
            return ReactiveArray("matches", {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                }),
                maps: ReactiveArray("maps")
            })(this.team).sort(sortMatches);
        }
    }
};
</script>

<style scoped>

</style>

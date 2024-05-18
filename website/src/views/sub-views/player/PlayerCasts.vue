<template>
    <div>
        <div class="container">
            <div class="row">
                <div v-for="match in casts" :key="match.id" class="cast-match col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <Match :hydrated-match="match" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Match from "@/components/website/match/Match.vue";
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import { sortMatches } from "@/utils/sorts";
import { formatTime, url } from "@/utils/content-utils";

export default {
    name: "PlayerCasts",
    components: { Match },
    props: ["player"],
    computed: {
        casts() {
            if (!this.player?.casts) return [];
            return ReactiveArray("casts", {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                }),
                event: ReactiveThing("event", {
                    theme: ReactiveThing("theme")
                })
            })(this.player).sort(sortMatches);
        }
    },
    methods: { url, formatTime }
};
</script>

<style scoped>

</style>

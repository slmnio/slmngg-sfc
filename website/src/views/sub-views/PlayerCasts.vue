<template>
    <div>
        <div class="container">
            <div class="row">
                <div class="cast-match col-12 col-sm-6 col-md-4 col-lg-3 mb-3" v-for="match in casts" :key="match.id">
                    <Match :hydrated-match="match"/>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Match from "@/components/website/match/Match";
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import { sortMatches } from "@/utils/sorts";
import { formatTime, url } from "@/utils/content-utils";

export default {
    name: "PlayerCasts",
    methods: { url, formatTime },
    props: ["player"],
    components: { Match },
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
    }
};
</script>

<style scoped>

</style>

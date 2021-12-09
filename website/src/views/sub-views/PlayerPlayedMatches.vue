<template>
    <div class="container">
        <div class="row">
            <Match v-for="match in matches" :id="match" v-bind:key="match" class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3" />
        </div>
    </div>
</template>

<script>
import Match from "@/components/website/match/Match";
import { sortMatches } from "@/utils/sorts";

export default {
    name: "PlayerPlayedMatches",
    props: ["player"],
    components: {
        Match
    },
    computed: {
        matches() {
            let matches = [];
            if (!this.player) return [];
            if (!this.player.member_of) return [];
            this.player.member_of.forEach(team => {
                if (team.matches) {
                    matches = matches.concat(team.matches);
                }
            });
            // TODO: fix this - it's just IDs at this point, has no extra data
            return matches.sort(sortMatches);
        }
    }
};
</script>

<style scoped>

</style>

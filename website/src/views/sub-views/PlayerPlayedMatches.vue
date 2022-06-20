<template>
    <div class="container">
        <div class="row">
            <Match v-for="match in matches" :hydrated-match="match" v-bind:key="match.id" class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3" />
        </div>
    </div>
</template>

<script>
import Match from "@/components/website/match/Match";
import { sortMatches } from "@/utils/sorts";
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";

export default {
    name: "PlayerPlayedMatches",
    props: ["player"],
    components: {
        Match
    },
    computed: {
        teams() {
            if (!this.player?.member_of?.length) return [];
            return ReactiveArray("member_of", {
                matches: ReactiveArray("matches", {
                    teams: ReactiveArray("teams", {
                        theme: ReactiveThing("theme")
                    }),
                    event: ReactiveThing("event", {
                        theme: ReactiveThing("theme")
                    })
                })
            })(this.player);
        },
        matches() {
            if (!this.teams) return [];
            let matches = [];
            this.teams.forEach(team => {
                console.log(team.matches);
                if (team.matches) matches = matches.concat(team.matches);
            });

            const sortIndex = {};
            matches.forEach((match, i) => {
                sortIndex[match.id] = i;
            });
            return matches.filter((val, i) => sortIndex[val.id] === i).sort(sortMatches);
        }
    }
};
</script>

<style scoped>

</style>

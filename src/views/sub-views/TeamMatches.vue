<template>
    <div class="container">
        <div class="row">
            <Match v-for="match in matches" :id="match" v-bind:key="match" class="col-md-3 mb-3" />
        </div>
    </div>
</template>

<script>
import Match from "@/components/Match";

export default {
    name: "TeamMatches",
    props: ["team"],
    components: {
        Match
    },
    computed: {
        matches() {
            return this.team.matches;
        }
    }
};
</script>

<style scoped>

</style>

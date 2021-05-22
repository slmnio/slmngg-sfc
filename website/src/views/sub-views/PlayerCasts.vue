<template>
    <div>
        <div class="container">
            <div class="row">
                <div class="cast-match col-md-3 mb-3" v-for="id in casts" v-bind:key="id">
                    <Match :id="id"/>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Match from "@/components/website/Match";

export default {
    name: "PlayerCasts",
    props: ["player"],
    components: { Match },
    computed: {
        casts() {
            if (!this.player) return [];
            return this.player.casts;
        }
    }
};
</script>

<style scoped>

</style>

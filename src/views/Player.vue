<template>
  <div v-if="player"></div>
</template>

<script>
export default {
    name: "Player",
    props: ["id"],
    computed: {
        player () {
            return this.reactiveThing(this.id);
        }
    },
    methods: {
        reactiveThing(id) {
            /*
            * - subscribe to socket events
            * - get current cached data
            * - be reactive with new data
            * */
            return this.$store.state.things.find(item => item.id === id);
        }
    }
};


</script>

<style scoped>

</style>

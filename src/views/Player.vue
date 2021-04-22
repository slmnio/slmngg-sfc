<template>
  <div v-if="player"></div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import Social from "@/components/Social";
import SubPageNav from "@/components/SubPageNav";

export default {
    name: "Player",
    props: ["id"],
    computed: {
        player () {
            return ReactiveRoot(this.id, {
                member_of: ReactiveArray("member_of", {
                    theme: ReactiveThing("theme"),
                    accolades: ReactiveArray("accolades", {
                        event: ReactiveThing("event", {
                            theme: ReactiveThing("theme")
                        })
                    })
                }),
                captain_of: ReactiveArray("captain_of", {
                    theme: ReactiveThing("theme")
                }),
                event_staff: ReactiveArray("event_staff", {
                    theme: ReactiveThing("theme")
                }),
                player_accolades: ReactiveArray("accolades"),
                socials: ReactiveArray("socials")
            });
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

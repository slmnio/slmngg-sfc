<template>
    <div class="broadcast-app">
        <router-view id="overlay" :broadcast="broadcast"/>
        <v-style v-if="broadcast && broadcast.event">
            {{ broadcast.event.broadcast_css }}
        </v-style>
    </div>
</template>

<script>
import { ReactiveRoot, ReactiveThing } from "@/utils/reactive";

export default {
    name: "BroadcastApp",
    props: ["id"],
    computed: {
        broadcast() {
            return ReactiveRoot(`broadcast-${this.id}`, {
                event: ReactiveThing("event")
            });
        }
    },
    mounted () {
        console.log("overlay app mounted", this.id);
        // let css = document.createElement('style');;
        // css.innerText = this.event.
    },
    beforeCreate () {
        document.body.className = "overlay";
    }
};
</script>

<style>

</style>

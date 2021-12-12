<template>
    <div class="broadcast-app">
        <router-view id="overlay" :broadcast="broadcast" :client="client" :title="title" :top="top"/>
        <v-style v-if="broadcast && broadcast.event">
            {{ broadcast.event.broadcast_css }}
        </v-style>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";

export default {
    name: "BroadcastApp",
    props: ["id", "title", "top", "code", "client"],
    computed: {
        broadcast() {
            return ReactiveRoot(this.id || `broadcast-${this.code}`, {
                event: ReactiveThing("event", {
                    theme: ReactiveThing("theme")
                }),
                other_broadcasts: ReactiveArray("other_broadcasts"),
                headlines: ReactiveArray("headlines")
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
    .broadcast-app, #overlay, body.overlay {
        overflow: hidden;
    }
    body.overlay #slmngg-app {
        padding-bottom: 0 !important;
    }
</style>

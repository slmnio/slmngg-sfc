<template>
    <router-view id="overlay" :broadcast="broadcast"/>
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
    },
    beforeCreate () {
        document.body.className = "overlay";
    }
};
</script>

<style>

</style>

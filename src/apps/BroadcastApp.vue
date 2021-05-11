<template>
    <router-view id="overlay" :broadcast="broadcast"/>
</template>

<script>
import { ReactiveRoot } from "@/utils/reactive";
import { fetchThing } from "@/utils/fetch";

export default {
    name: "BroadcastApp",
    props: ["id"],
    computed: {
        broadcast() {
            return ReactiveRoot(`broadcast-${this.id}`);
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

<template>
    <router-view id="overlay"/>
</template>

<script>
export default {
    name: "BroadcastApp",
    mounted () {
        console.log("overlay app mounted");
    },
    beforeCreate () {
        document.body.className = "overlay";
    }
};
</script>

<style>

</style>

<template>
  <div class="ingame-overlay"></div>
</template>

<script>
export default {
    name: "IngameOverlay",
    mounted () {
        console.log("ingame overlay mounted");
    }
};
</script>

<style scoped>
/*@import "~@/assets/overlay.css";*/
.ingame-overlay {
    background: red;
}
</style>

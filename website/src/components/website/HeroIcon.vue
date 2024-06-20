<template>
    <img class="hero-icon" :src="url">
</template>

<script>
export default {
    name: "HeroIcon",
    props: ["hero"],
    computed: {
        url() {
            return `https://media.slmn.io/heroes/${this.hero}_icon_pink.png`;
        }
    }
};
</script>

<style scoped>
    .hero-icon {
        height: 24px;
        filter: brightness(0) invert();
    }
</style>

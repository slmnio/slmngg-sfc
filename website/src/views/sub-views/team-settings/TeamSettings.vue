<template>
    <div class="team-settings container">
        <h2>Team Settings</h2>

        <router-view :team="team" />
    </div>
</template>

<script>

export default {
    name: "TeamSettings",
    props: {
        team: {},
        isMinisite: Boolean
    }
};
</script>

<style scoped>

</style>

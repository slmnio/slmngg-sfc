<template>
    <div id="app">
      <div class="development-bar bg-warning text-dark text-center py-1">
        <b>In development:</b> things may break, be missing, or not appear as expected.
      </div>
        <nav class="navbar navbar-expand-lg navbar-dark">
            <router-link to="/" class="navbar-brand">SLMN.GG</router-link>
            <ul class="navbar-nav mr-auto">
                <router-link to="/events" class="nav-link" active-class="active">Events</router-link>
                <router-link to="/teams" class="nav-link" active-class="active">Teams</router-link>
                <router-link to="/players" class="nav-link" active-class="active">Players</router-link>
                <router-link to="/news" class="nav-link" active-class="active">News</router-link>
            </ul>
        </nav>
        <router-view class="my-3 slmngg-page"/>
    </div>
</template>

<script>

export default {
    name: "WebsiteApp",
    beforeCreate () {
        document.body.className = "website";
    }
};
</script>

<style scoped>
@import "~@/assets/bootstrap.css";
@import "~@/assets/app.css";

</style>

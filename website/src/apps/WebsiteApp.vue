<template>
    <div id="app">
        <div class="development-bar bg-warning text-dark text-center py-1">
            <b>In development:</b> things may break, be missing, or not appear as expected.
        </div>
        <b-navbar toggleable="lg" type="dark">
            <router-link class="navbar-brand" to="/">SLMN.GG</router-link>

            <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

            <b-collapse id="nav-collapse" is-nav>
                <b-navbar-nav>
                    <router-link active-class="active" class="nav-link" to="/events">Events</router-link>
                    <router-link active-class="active" class="nav-link" to="/teams">Teams</router-link>
                    <router-link active-class="active" class="nav-link" to="/players">Players</router-link>
                    <router-link active-class="active" class="nav-link" to="/news">News</router-link>
                </b-navbar-nav>
            </b-collapse>
        </b-navbar>

        <router-view class="my-3 slmngg-page"/>
    </div>
</template>

<script>

import {
    BCollapse,
    BNavbar,
    BNavbarNav,
    BNavbarToggle
} from "bootstrap-vue";

export default {
    name: "WebsiteApp",
    components: {
        BNavbar,
        BNavbarToggle,
        BCollapse,
        BNavbarNav
    },
    beforeCreate () {
        document.body.className = "website";
    }
};
</script>

<style scoped>
@import "~@/assets/bootstrap.css";
@import "~@/assets/app.css";

</style>

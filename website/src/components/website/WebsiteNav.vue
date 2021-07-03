<template>
    <div class="website-nav">
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
                <b-navbar-nav>
                    <NavLiveMatch v-for="match in liveMatches" :match="match" v-bind:key="match.id" />
                </b-navbar-nav>
            </b-collapse>
        </b-navbar>
    </div>
</template>

<script>
import {
    BCollapse,
    BNavbar,
    BNavbarNav,
    BNavbarToggle
} from "bootstrap-vue";
import NavLiveMatch from "@/components/website/NavLiveMatch";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";

export default {
    name: "WebsiteNav",
    components: {
        BNavbar,
        BNavbarToggle,
        BCollapse,
        BNavbarNav,
        NavLiveMatch
    },
    computed: {
        liveMatches() {
            return ReactiveRoot("special:live-matches", {
                matches: ReactiveArray("matches", {
                    event: ReactiveThing("event")
                })
            }).matches;
        }
    }
};
</script>

<style scoped>

</style>

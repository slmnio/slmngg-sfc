<template>
    <div class="website-nav">
        <div class="development-bar bg-warning text-dark text-center py-1">
            <b>In development:</b> things may break, be missing, or not appear as expected.
        </div>
        <b-navbar toggleable="lg" type="dark">
            <router-link class="navbar-brand" to="/">{{ minisite ? (minisite.navbar_name || minisite.series_name || minisite.name) : "SLMN.GG"}}</router-link>

            <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

            <b-collapse id="nav-collapse" is-nav>
                <b-navbar-nav v-if="!minisite">
                    <router-link active-class="active" class="nav-link" to="/events">Events</router-link>
                    <router-link active-class="active" class="nav-link" to="/teams">Teams</router-link>
                    <router-link active-class="active" class="nav-link" to="/players">Players</router-link>
                    <router-link active-class="active" class="nav-link" to="/news">News</router-link>
                </b-navbar-nav>
                <b-navbar-nav v-if="minisite">
                    <router-link active-class="active" v-if="minisite.matches" class="nav-link" to="/schedule">Schedule</router-link>
                    <router-link active-class="active" v-if="minisite.brackets" class="nav-link" to="/bracket">{{ minisite.brackets.length === 1 ? 'Bracket' : 'Brackets' }}</router-link>
                </b-navbar-nav>
                <b-navbar-nav class="mr-auto">
                    <NavLiveMatch v-for="match in liveMatches" :match="match" v-bind:key="match.id" />
                </b-navbar-nav>
                <b-navbar-nav v-if="minisite">
                    <a :href="slmnggURL('')" class="nav-link">SLMN.GG</a>
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
    props: ["minisite"],
    computed: {
        liveMatches() {
            return ReactiveRoot("special:live-matches", {
                matches: ReactiveArray("matches", {
                    event: ReactiveThing("event")
                })
            }).matches;
        },
        slmnggDomain() {
            console.log("env", process.env);
            try {
                return process.env.NODE_ENV === "development" ? "http://localhost:8080" : "https://dev.slmn.gg";
            } catch (e) {
                return "https://dev.slmn.gg";
            }
        }
    },
    methods: {
        slmnggURL(page) {
            return `${this.slmnggDomain}/${page}`;
        }
    }
};
</script>

<style scoped>

</style>

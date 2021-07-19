<template>
    <div class="website-nav">
        <div class="development-bar bg-warning text-dark text-center py-1 px-1">
            <b><a href="https://github.com/slmnio/slmngg-sfc" class="text-dark">In development:</a></b> things may break, be missing, or not appear as expected.
        </div>
        <b-navbar toggleable="lg" type="dark">
            <router-link class="navbar-brand " to="/">
                <img v-if="minisiteIcon" :src="minisiteIcon" alt="" class="navbar-image d-inline-block align-top mr-2">
                {{ minisite ? (minisite.navbar_name || minisite.series_name || minisite.name) : "SLMN.GG"}}
            </router-link>

            <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

            <b-collapse id="nav-collapse" is-nav>
                <b-navbar-nav v-if="!minisite">
                    <router-link active-class="active" class="nav-link" to="/events">Events</router-link>
                    <router-link active-class="active" class="nav-link" to="/teams">Teams</router-link>
                    <router-link active-class="active" class="nav-link" to="/players">Players</router-link>
<!--                    <router-link active-class="active" class="nav-link" to="/news">News</router-link>-->
                </b-navbar-nav>
                <b-navbar-nav v-if="minisite">
                    <router-link active-class="active" v-if="minisite.matches" class="nav-link" to="/schedule">Schedule</router-link>
                    <router-link active-class="active" v-if="minisite.brackets" class="nav-link" to="/bracket">{{ minisite.brackets.length === 1 ? 'Bracket' : 'Brackets' }}</router-link>

                    <div class="nav-divider" v-if="navbarEvents.length"></div>

                    <router-link v-for="event in navbarEvents" v-bind:key="event.id"
                                 active-class="active"
                                 class="nav-link" :to="event._link" >
                        {{ event.navbar_short || event.short || event.series_subtitle || event.name }}</router-link>
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
import { getImage } from "@/utils/content-utils";

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
        },
        navbarEvents() {
            if (!this.minisite?.id) return [];
            const events = ReactiveRoot(this.minisite.id, {
                navbar_events: ReactiveArray("navbar_events")
            })?.navbar_events;

            if (events) {
                return events.map(e => {
                    return {
                        ...e,
                        _link: (this.minisite._original_data_id === e.id) ? "/" : `/event/${e.id}`
                    };
                });
            }

            return [];
        },
        minisiteIcon() {
            if (!this.minisite?.id) return null;
            const theme = ReactiveRoot(this.minisite.id, { theme: ReactiveThing("theme") })?.theme;
            // console.log("[theme]", theme);
            if (!theme) return null;
            return getImage(theme.small_logo) || getImage(theme.default_logo);
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
.nav-divider {
    border-top: 1px solid;
    margin: .5rem 0;
    opacity: 0.25;
}

@media (min-width: 992px) {
    .nav-divider {
        border-top: none;
        margin: .2rem .5rem;
        border-left: 1px solid;
    }
}
</style>

<template>
    <div class="website-nav">

        <WebsiteNavBanner class="bg-danger" v-if="showDisconnectedMessage">
            <i class="fas fa-wifi-slash fa-fw mr-1"></i> <b>No connection to the data server.</b> Don't refresh, we're trying to reconnect...
        </WebsiteNavBanner>
        <WebsiteNavBanner class="bg-warning text-dark" v-if="showRebuildingMessage">
            <i class="fas fa-spinner fa-pulse fa-fw mr-1"></i> <b>Server rebuilding</b>: The server is rebuilding its data store. Some pages might not be accessible.</WebsiteNavBanner>

<!--        <WebsiteNavBanner v-if="siteMode === 'live' || siteMode === 'production'" class="bg-primary text-white">-->
<!--            <b><a href="https://github.com/slmnio/slmngg-sfc" class="text-light">Welcome to the new SLMN.GG!</a></b> Completely rewritten to be faster, cleaner and better. Please be patient with any teething problems from the big switch over.-->
<!--        </WebsiteNavBanner>-->
        <WebsiteNavBanner v-if="siteMode === 'staging'" class="bg-warning text-dark">
            <b><a href="https://github.com/slmnio/slmngg-sfc" class="text-dark">Beta development version:</a></b> things may break. Use <a href="https://slmn.gg" class="text-dark font-weight-bold">slmn.gg</a> for the latest stable update.
        </WebsiteNavBanner>
        <WebsiteNavBanner v-if="siteMode === 'local'" class="bg-primary text-light">
            SLMN.GG is running in local development mode.
        </WebsiteNavBanner>
<!--       example: <WebsiteNavBanner class="bg-success" v-if="$socket.connected">Connected to the data server for live data updates!</WebsiteNavBanner>-->

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
                    <a target="_blank" class="nav-link" href="https://slmn.statuspage.io/?utm_source=slmngg_nav">Status</a>
<!--                    <router-link active-class="active" class="nav-link" to="/news">News</router-link>-->
                </b-navbar-nav>
                <b-navbar-nav v-if="minisite">
                    <router-link active-class="active" v-if="minisite.matches" class="nav-link" to="/schedule">Schedule</router-link>
                    <router-link active-class="active" v-if="minisite.brackets" class="nav-link" to="/bracket">{{ minisite.brackets.length === 1 ? 'Bracket' : 'Brackets' }}</router-link>
                    <router-link active-class="active" v-if="minisiteSettings && minisiteSettings.standings" class="nav-link" to="/standings">Standings</router-link>
                    <div class="nav-divider" v-if="navbarEvents.length"></div>

                    <router-link v-for="event in navbarEvents" v-bind:key="event.id"
                                 active-class="active"
                                 class="nav-link" :to="event._link" :exact="event.__id === minisite.__id">
                        {{ event.navbar_short || event.short || event.series_subtitle || event.name }}</router-link>
<!--                    <router-link :to="'/'" v-if="minisite.navbar_short" active-class="active" exact class="nav-link">{{ minisite.navbar_short }}</router-link>-->
                </b-navbar-nav>
                <b-navbar-nav class="mr-auto">
                    <NavLiveMatch v-for="match in liveMatches" :match="match" v-bind:key="match.id" />
                </b-navbar-nav>
                <b-navbar-nav v-if="minisite">
                    <a :href="slmnggURL('')" class="nav-link">SLMN.GG</a>
                </b-navbar-nav>
                <b-navbar-nav v-else>
                    <a target="_blank" class="nav-link" href="https://slmn.statuspage.io/?utm_source=slmngg_nav">SLMN.GG Status</a>
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
import WebsiteNavBanner from "@/components/website/WebsiteNavBanner";

export default {
    name: "WebsiteNav",
    components: {
        WebsiteNavBanner,
        BNavbar,
        BNavbarToggle,
        BCollapse,
        BNavbarNav,
        NavLiveMatch
    },
    props: ["minisite"],
    data: () => ({
        pageNoLongerNew: false
    }),
    computed: {
        liveMatches() {
            return ReactiveRoot("special:live-matches", {
                matches: ReactiveArray("matches", {
                    event: ReactiveThing("event")
                })
            }).matches;
        },
        slmnggDomain() {
            try {
                // console.log("[minisite]", this.minisite);

                if (!this.minisite?.subdomain) {
                    // basically just defaults if we can't automatically go back up to the parent
                    if (process.env.NODE_ENV === "development") return "http://localhost:8080";
                    if (process.env.VUE_APP_DEPLOY_MODE === "local") return "http://localhost:8080";
                    if (process.env.VUE_APP_DEPLOY_MODE === "staging") return "https://dev.slmn.gg";
                    if (process.env.NODE_ENV === "production") return "https://slmn.gg";
                    if (process.env.VUE_APP_DEPLOY_MODE === "production") return "http://slmn.gg";
                    return "http://dev.slmn.gg";
                } else {
                    return window.location.origin.replace(`${this.minisite.subdomain}.`, "");
                }
            } catch (e) {
                return "https://dev.slmn.gg";
            }
        },
        siteMode() {
            // console.log("env", process.env);
            return process.env.VUE_APP_DEPLOY_MODE || process.env.NODE_ENV;
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
        },
        showDisconnectedMessage() {
            return this.pageNoLongerNew && this.$socket.disconnected;
        },
        showRebuildingMessage() {
            if (this.showDisconnectedMessage) return false;
            return this.$root.isRebuilding;
        },
        minisiteSettings() {
            if (!this.minisite?.blocks) return null;
            try {
                return JSON.parse(this.minisite.blocks);
            } catch {
                return null;
            }
        }
    },
    mounted() {
        setTimeout(() => {
            // ignore if the socket is disconnected for the first 3 seconds of loading
            this.pageNoLongerNew = true;
        }, 3000);
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

@media (min-width: 958px) {
    .nav-divider {
        border-top: none;
        margin: .2rem .5rem;
        border-left: 1px solid;
    }
}
</style>

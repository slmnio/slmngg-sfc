<template>
    <div class="website-nav">

        <WebsiteNavBanner class="bg-danger" v-if="showDisconnectedMessage">
            <i class="fas fa-wifi-slash fa-fw mr-1"></i> <b>No connection to the data server.</b> Don't refresh, we're trying to reconnect...
        </WebsiteNavBanner>
        <WebsiteNavBanner class="bg-warning text-dark" v-if="showHighErrorRateMessage">
            <i class="fas fa-exclamation-triangle fa-fw mr-1"></i> <b>Data server errors.</b> We are having some errors requesting data from our upstream provider. Some data maybe inaccurate, incomplete or inaccessible.
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
                <span class="d-lg-inline d-none">{{ minisite ? (minisite.navbar_name || minisite.series_name || minisite.name) : "SLMN.GG"}}</span>
                <span class="d-inline d-lg-none">{{ minisite ? (minisite.short || minisite.series_name || minisite.name) : "SLMN.GG"}}</span>

            </router-link>

            <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

            <b-collapse id="nav-collapse" is-nav>
                <b-navbar-nav v-if="!minisite">
                    <router-link active-class="active" class="nav-link" to="/events">Events</router-link>
                    <router-link active-class="active" class="nav-link" to="/teams">Teams</router-link>
                    <router-link active-class="active" class="nav-link" to="/players">Players</router-link>
                    <router-link v-if="isAuthenticated" active-class="active" class="nav-link" to="/profile">Profile</router-link>
                    <router-link v-if="isProduction" active-class="active" class="nav-link" to="/dashboard">Dashboard</router-link>
<!--                    <router-link active-class="active" class="nav-link" to="/news">News</router-link>-->
                </b-navbar-nav>
                <b-navbar-nav v-if="minisite" class="flex-wrap">
                    <router-link active-class="active" v-if="minisite.matches" class="nav-link" to="/schedule">Schedule</router-link>
                    <router-link active-class="active" v-if="minisite.brackets" class="nav-link" to="/bracket">{{ minisite.brackets.length === 1 ? 'Bracket' : 'Brackets' }}</router-link>
                    <router-link active-class="active" v-if="minisiteSettings && minisiteSettings.standings" class="nav-link" to="/standings">Standings</router-link>
                    <div class="nav-divider" v-if="navbarEvents.length"></div>

                    <router-link v-for="event in navbarEvents" :key="event.id"
                                 active-class="active" :class="{'active': event._original_data_id === activeEventID }"
                                 class="nav-link" :to="event._link" :exact="event.__id === minisite.__id">
                        {{ event.navbar_short || event.short || event.series_subtitle || event.name }}</router-link>
<!--                    <router-link :to="'/'" v-if="minisite.navbar_short" active-class="active" exact class="nav-link">{{ minisite.navbar_short }}</router-link>-->
                </b-navbar-nav>
                <b-navbar-nav class="flex-grow-1"></b-navbar-nav>

                <b-navbar-nav>
                    <div class="nav-link" v-b-modal.timezone-swapper-modal>Timezone</div>
                    <a target="_blank" class="nav-link" href="https://slmn.statuspage.io/?utm_source=slmngg_nav">Status</a>
                </b-navbar-nav>

                <b-navbar-nav v-if="minisite">
                    <a :href="slmnggURL('')" class="nav-link">SLMN.GG</a>
                </b-navbar-nav>
                <b-navbar-nav v-else>
                    <a v-if="$root.version" class="nav-link" target="_blank" href="https://github.com/slmnio/slmngg-sfc">SLMN.GG {{ $root.version }}</a>
                </b-navbar-nav>

                <b-navbar-nav>
                    <router-link class="nav-link" to="/login" v-if="!$root.auth.user && !$root.isRebuilding">Login</router-link>
                    <LoggedInUser v-if="$root.auth.user"/>
                </b-navbar-nav>

            </b-collapse>
        </b-navbar>

        <div class="live-matches flex-wrap flex-center" v-if="liveMatches.length">
            <div class="live-matches-text">🔴 LIVE</div>
            <NavLiveMatch v-for="match in liveMatches" :match="match" :key="match.id" />
        </div>

        <b-modal ref="timezone-swapper-modal" id="timezone-swapper-modal" title="Timezone swapper" hide-footer>
            <p>Change your timezone for dates and times across SLMN.GG:</p>
            <TimezoneSwapper align="left" />
        </b-modal>
        <v-style>
            .notyf {
                margin-top: {{ height }}px !important;
            }
        </v-style>
    </div>
</template>

<script>
import {
    BCollapse, BModal,
    BNavbar,
    BNavbarNav,
    BNavbarToggle, VBModal
} from "bootstrap-vue";
import NavLiveMatch from "@/components/website/NavLiveMatch";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import WebsiteNavBanner from "@/components/website/WebsiteNavBanner";
import { resizedImageNoWrap } from "@/utils/images";
import LoggedInUser from "@/components/website/LoggedInUser";
import TimezoneSwapper from "@/components/website/schedule/TimezoneSwapper";
import { isAuthenticated } from "@/utils/auth";
import { getMainDomain } from "@/utils/fetch";

export default {
    name: "WebsiteNav",
    components: {
        TimezoneSwapper,
        LoggedInUser,
        WebsiteNavBanner,
        BNavbar,
        BNavbarToggle,
        BCollapse,
        BNavbarNav,
        NavLiveMatch,
        BModal
    },
    directives: {
        BModal: VBModal
    },
    props: ["minisite", "activeEventID"],
    data: () => ({
        pageNoLongerNew: false,
        resizeObserver: null,
        height: 0
    }),
    computed: {
        liveMatches() {
            return ReactiveRoot("special:live-matches", {
                matches: ReactiveArray("matches", {
                    event: ReactiveThing("event", {
                        theme: ReactiveThing("theme")
                    }),
                    teams: ReactiveArray("teams", {
                        theme: ReactiveThing("theme")
                    })
                })
            })?.matches || [];
        },
        slmnggDomain() {
            return getMainDomain(this.minisite?.subdomain);
        },
        siteMode() {
            return import.meta.env.VITE_DEPLOY_MODE || import.meta.env.NODE_ENV;
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
            return resizedImageNoWrap(theme, ["small_logo", "default_logo"], "h-40");
        },
        showDisconnectedMessage() {
            return this.pageNoLongerNew && this.$socket.disconnected;
        },
        showRebuildingMessage() {
            if (this.showDisconnectedMessage) return false;
            return this.$root.isRebuilding;
        },
        showHighErrorRateMessage() {
            if (this.showDisconnectedMessage || this.showRebuildingMessage) return false;
            return this.$root.highErrorRate;
        },
        minisiteSettings() {
            if (!this.minisite?.blocks) return null;
            try {
                return JSON.parse(this.minisite.blocks);
            } catch {
                return null;
            }
        },
        isProduction() {
            if (!isAuthenticated(this.$root)) return false;
            return this.$root.authUser?.clients?.length;
        }
    },
    mounted() {
        setTimeout(() => {
            // ignore if the socket is disconnected for the first 3 seconds of loading
            this.pageNoLongerNew = true;
        }, 3000);
        this.resizeObserver = new ResizeObserver(this.onResize);
        this.resizeObserver.observe(this.$el);
    },
    methods: {
        isAuthenticated,
        slmnggURL(page) {
            return `${this.slmnggDomain}/${page}`;
        },
        onResize() {
            this.height = this.$el.offsetHeight;
        }
    },
    beforeDestroy () {
        this.resizeObserver.unobserve(this.$el);
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

@media (max-width: 957px) {
    .live-matches-text {
        width: 100%;
        text-align: center;
    }
}

.live-matches {
    gap: 1em;
    padding: .5em 0;
    background-color: rgba(0, 0, 0, 0.3);
}
.live-matches-text {
    font-size: 1.5em;
}
.website-nav >>> .dropdown-item {
    padding: 0.5rem 1.5rem;
}
</style>

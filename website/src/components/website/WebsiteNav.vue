<template>
    <div class="website-nav">
        <WebsiteNavBanner v-if="maintenanceMessage" class="bg-warning text-dark">
            {{ maintenanceMessage }}
        </WebsiteNavBanner>
        <WebsiteNavBanner v-if="showDisconnectedMessage" class="bg-danger">
            <i class="fas fa-wifi-slash fa-fw mr-1"></i> <b>No connection to the data server.</b> Don't refresh, we're trying to reconnect...
        </WebsiteNavBanner>
        <WebsiteNavBanner v-if="showHighErrorRateMessage" class="bg-warning text-dark">
            <i class="fas fa-exclamation-triangle fa-fw mr-1"></i> <b>Data server errors.</b> We are having some errors requesting data from our upstream provider. Some data maybe inaccurate, incomplete or inaccessible.
        </WebsiteNavBanner>
        <WebsiteNavBanner v-if="showRebuildingMessage" class="bg-warning text-dark">
            <i class="fas fa-spinner fa-pulse fa-fw mr-1"></i> <b>Server rebuilding</b>: The server is rebuilding its data store. Some pages might not be accessible.
        </WebsiteNavBanner>

        <!--        <WebsiteNavBanner v-if="siteMode === 'live' || siteMode === 'production'" class="bg-primary text-white">-->
        <!--            <b><a href="https://github.com/slmnio/slmngg-sfc" class="text-light">Welcome to the new SLMN.GG!</a></b> Completely rewritten to be faster, cleaner and better. Please be patient with any teething problems from the big switch over.-->
        <!--        </WebsiteNavBanner>-->
        <WebsiteNavBanner v-if="siteMode === 'staging'" class="bg-warning text-dark">
            <b><a href="https://github.com/slmnio/slmngg-sfc" class="text-dark">Beta development version:</a></b> things may break. Use <a href="https://slmn.gg" class="text-dark fw-bold">slmn.gg</a> for the latest stable update.
        </WebsiteNavBanner>
        <WebsiteNavBanner v-if="siteMode === 'local'" class="" :class="{'bg-light text-primary fw-bold': reloadAfterRebuild, 'bg-primary text-light': !reloadAfterRebuild}" @click="reloadAfterRebuild = !reloadAfterRebuild">
            <i v-if="dataServerMode !== 'local'" class="fas fa-exclamation-triangle fa-fw mr-1"></i>
            SLMN.GG is running in local development mode<strong v-if="dataServerMode !== 'local'"> but not using a local data server</strong>.
            {{ reloadAfterRebuild ? 'Page will reload after data server rebuilds' : '' }}
        </WebsiteNavBanner>
        <!--       example: <WebsiteNavBanner class="bg-success" v-if="$socket.connected">Connected to the data server for live data updates!</WebsiteNavBanner>-->

        <b-navbar toggleable="lg" type="dark">
            <router-link class="navbar-brand " to="/">
                <img v-if="minisiteIcon" :src="minisiteIcon" alt="" class="navbar-image d-inline-block align-top mr-2">
                <span class="d-lg-inline d-none">{{ minisite ? (minisite.navbar_name || minisite.series_name || minisite.name) : "SLMN.GG" }}</span>
                <span class="d-inline d-lg-none">{{ minisite ? (minisite.short || minisite.series_name || minisite.name) : "SLMN.GG" }}</span>
            </router-link>

            <b-navbar-toggle v-b-color-mode="'dark'" class="toggler" target="nav-collapse" />

            <b-collapse id="nav-collapse" is-nav>
                <b-navbar-nav v-if="!minisite">
                    <router-link active-class="active" class="nav-link" to="/events">Events</router-link>
                    <router-link active-class="active" class="nav-link" to="/teams">Teams</router-link>
                    <router-link active-class="active" class="nav-link" to="/players">Players</router-link>
                    <router-link active-class="active" class="nav-link" to="/streams">{{ streamsTitle }}</router-link>
                    <router-link active-class="active" class="nav-link" to="/learn">Learn</router-link>
                    <router-link v-if="isAuthenticated" active-class="active" class="nav-link" to="/profile">Profile</router-link>
                    <router-link v-if="isProduction" active-class="active" class="nav-link" to="/dashboard">Dashboard</router-link>
                    <a v-if="productionClient?.key" target="_blank" class="nav-link" :href="`//dev.slmn.gg/client/${productionClient?.key}/tally-viewer`">Tally <i class="far fa-external-link ml-1"></i></a>
                    <!--                    <router-link active-class="active" class="nav-link" to="/news">News</router-link>-->
                </b-navbar-nav>
                <b-navbar-nav v-if="minisite" class="flex-wrap">
                    <router-link v-if="minisite.matches" active-class="active" class="nav-link" to="/schedule">Schedule</router-link>
                    <router-link v-if="minisite.brackets" active-class="active" class="nav-link" to="/bracket">{{ minisite.brackets.length === 1 ? 'Bracket' : 'Brackets' }}</router-link>
                    <router-link v-if="minisiteSettings && minisiteSettings.standings" active-class="active" class="nav-link" to="/standings">Standings</router-link>
                    <div v-if="navbarEvents.length" class="nav-divider"></div>

                    <router-link
                        v-for="event in navbarEvents"
                        :key="event.id"
                        active-class="active"
                        :class="{'active': event._original_data_id === activeEventID }"
                        class="nav-link"
                        :to="event._link"
                        :exact="event.__id === minisite.__id">
                        {{ event.navbar_short || event.short || event.series_subtitle || event.name }}
                    </router-link>
                    <!--                    <router-link :to="'/'" v-if="minisite.navbar_short" active-class="active" exact class="nav-link">{{ minisite.navbar_short }}</router-link>-->
                </b-navbar-nav>
                <b-navbar-nav class="flex-grow-1" />

                <b-navbar-nav>
                    <div v-b-modal.timezone-swapper-modal class="nav-link text-left justify-content-start">Timezone</div>
                    <!--                    <a target="_blank" class="nav-link" href="https://slmn.statuspage.io/?utm_source=slmngg_nav">Status</a>-->
                </b-navbar-nav>

                <b-navbar-nav v-if="minisite">
                    <a :href="slmnggURL('')" class="nav-link">SLMN.GG</a>
                </b-navbar-nav>
                <b-navbar-nav v-else>
                    <a v-if="$root.version" class="nav-link" target="_blank" href="https://github.com/slmnio/slmngg-sfc">SLMN.GG {{ $root.version }}</a>
                </b-navbar-nav>

                <b-navbar-nav>
                    <div v-if="siteMode && siteMode !== 'production' && !isRebuilding" v-b-modal.force-auth-modal class="nav-link text-left justify-content-start">Force Auth</div>

                    <router-link v-if="!user && !isRebuilding" class="nav-link" to="/login">Login</router-link>
                    <LoggedInUser v-if="user" />
                </b-navbar-nav>
            </b-collapse>
        </b-navbar>

        <div v-if="liveMatches.length" class="live-matches flex-wrap flex-center">
            <div class="live-matches-text">🔴 LIVE</div>
            <NavLiveMatch v-for="match in liveMatches" :key="match.id" :match="match" />
        </div>

        <b-modal
            v-if="siteMode !== 'production'"
            id="force-auth-modal"
            ref="force-auth-modal"
            title="Force auth token"
            hide-footer>
            <div class="d-flex flex-column gap-2">
                <div class="bg-warning p-2 rounded">
                    <i class="fas fa-exclamation-triangle mr-1"></i> <b>For development use only</b>
                </div>
                <div>Force authentication using an existing auth token from the data server.</div>
                <b-form @submit.prevent="forceToken(forceTokenInput)">
                    <b-form-group>
                        <div class="d-flex gap-2">
                            <b-form-input
                                v-model="forceTokenInput"
                                type="text"
                                class="fake-pw"
                                autocomplete="off"
                                placeholder="Token from data server" />
                            <b-button variant="success" type="submit">
                                Force
                            </b-button>
                        </div>
                    </b-form-group>
                </b-form>
                <div>Data server: <code>{{ getDataServerAddress() }}</code></div>

                <div class="bg-dark text-light rounded border rounded p-2">
                    <b>Loaded user data</b>
                    <pre class="mb-0  bg-dark text-light">{{ user || 'no valid data' }}</pre>
                </div>
            </div>
        </b-modal>

        <b-modal id="timezone-swapper-modal" ref="timezone-swapper-modal" title="Timezone swapper" hide-footer>
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
import { state } from "@/socket";
import store from "@/thing-store";
import NavLiveMatch from "@/components/website/NavLiveMatch";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import WebsiteNavBanner from "@/components/website/WebsiteNavBanner";
import { resizedImageNoWrap } from "@/utils/images";
import LoggedInUser from "@/components/website/LoggedInUser";
import TimezoneSwapper from "@/components/website/schedule/TimezoneSwapper";
import { getDataServerAddress, getMainDomain } from "@/utils/fetch";
import { mapState, mapWritableState } from "pinia";
import { useAuthStore } from "@/stores/authStore";
import { hydratedCommunityStreams } from "@/utils/content-utils";


export default {
    name: "WebsiteNav",
    components: {
        TimezoneSwapper,
        LoggedInUser,
        WebsiteNavBanner,
        NavLiveMatch
    },
    props: ["minisite", "activeEventID"],
    data: () => ({
        pageNoLongerNew: false,
        resizeObserver: null,
        height: 0,
        reloadAfterRebuild: false,
        forceTokenInput: null
    }),
    computed: {
        ...mapWritableState(useAuthStore, ["user"]),
        ...mapState(useAuthStore, ["isProduction", "isAuthenticated"]),
        isRebuilding() {
            return store.getters.hasWebsiteFlag("server_rebuilding");
        },
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
        maintenanceMessage() {
            return import.meta.env.VITE_MAINTENANCE_MESSAGE;
        },
        dataServerMode() {
            const dataServerURL = new URL(import.meta.env.VITE_DATA_SERVER || "http://localhost");
            return ["localhost", "127.0.0.1"].includes(dataServerURL.hostname) ? "local" : "remote";
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
            return this.pageNoLongerNew && !state.connected;
        },
        showRebuildingMessage() {
            if (this.showDisconnectedMessage) return false;
            return this.isRebuilding;
        },
        showHighErrorRateMessage() {
            if (this.showDisconnectedMessage || this.showRebuildingMessage) return false;
            return store.getters.hasWebsiteFlag("high_error_rate");
        },
        minisiteSettings() {
            if (!this.minisite?.blocks) return null;
            try {
                return JSON.parse(this.minisite.blocks);
            } catch {
                return null;
            }
        },
        productionClient() {
            if (!this.isProduction) return false;
            return ReactiveRoot(this.user.clients?.[0]);
        },
        communityStreams() {
            return hydratedCommunityStreams().value || [];
        },
        streamsTitle() {
            const liveMatches = ReactiveRoot("special:live-matches");
            const count = (liveMatches?.matches?.length || 0) + (this.communityStreams?.length || 0);
            if (!count) return "Streams";
            return `🔴 Streams (${count})`;
        }
    },
    methods: {
        getDataServerAddress,
        slmnggURL(page) {
            return `${this.slmnggDomain}/${page}`;
        },
        onResize() {
            this.height = this.$el.offsetHeight;
        },
        async forceToken(token) {
            if (!token) {
                this.$notyf.error("No token supplied. You can force a logout from the user dropdown.");
                return;
            }
            const auth = useAuthStore();
            const response = await auth.authenticateWithToken(token);
            console.log(response);
            if (response.error) {
                this.$notyf.error(response.errorMessage);
            } else {
                this.$notyf.success("New token authenticated and stored");
            }
        }
    },
    watch: {
        isRebuilding(rebuilding) {
            if (!rebuilding && this.reloadAfterRebuild) {
                document.location.reload();
            }
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
    beforeUnmount () {
        this.resizeObserver?.unobserve(this.$el);
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

@media (max-width: 767px) {
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
.website-nav:deep(.dropdown-item) {
    padding: 0.5rem 1.5rem;
}
.navbar[type="dark"] .navbar-nav .nav-link,
.navbar[type="dark"] .navbar-nav .nav-text,
.navbar[type="dark"] .navbar-nav .nav-item {
    color: #ffffff80
}
.navbar[type="dark"] .navbar-nav .nav-link:focus,
.navbar[type="dark"] .navbar-nav .nav-link:hover {
    color: #ffffffbf
}
.navbar[type="dark"] .navbar-nav .nav-link.active,
.navbar[type="dark"] .navbar-nav .nav-text.active,
.navbar[type="dark"] .navbar-nav .nav-item.active {
    color: #ffffff
}

.navbar-brand {
    color: white;
}
.nav-link {
    cursor: pointer;
}
.toggler.navbar-toggler {
    --bs-navbar-toggler-border-color: rgba(255,255,255,0.15);
}
.fake-pw {
    text-security: disc;
    -webkit-text-security: disc;
}
</style>

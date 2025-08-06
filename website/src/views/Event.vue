<template>
    <div v-if="event">
        <ThingTop :thing="event" type="event" :theme-u-r-l="subLink('theme')" />

        <SubPageNav class="my-2">
            <li class="nav-item ct-passive"><router-link class="nav-link" :to="subLink('')">Overview</router-link></li>
            <!--            <li class="nav-item"><router-link class="nav-link" :to="subLink('rosters')">Rosters</router-link></li>-->
            <li v-if="event.matches" class="nav-item ct-passive"><router-link class="nav-link" :to="subLink('schedule')">Schedule</router-link></li>
            <li v-if="brackets?.length" class="nav-item ct-passive"><router-link class="nav-link" :to="subLink('bracket')">{{ event.brackets.length === 1 ? 'Bracket' : 'Brackets' }}</router-link></li>
            <li v-if="showStandings" class="nav-item ct-passive"><router-link class="nav-link" :to="subLink('standings')">Standings</router-link></li>
            <li v-if="showFoldy" class="nav-item ct-passive"><router-link class="nav-link" :to="subLink('scenarios')">Foldy Sheet</router-link></li>
            <li v-if="showDraft" class="nav-item ct-passive"><router-link class="nav-link" :to="subLink('draft')">Draft</router-link></li>
            <li v-if="showAuction" class="nav-item ct-passive"><router-link class="nav-link" :to="subLink('auction')">Auction</router-link></li>
            <li v-if="event.accolades" class="nav-item ct-passive"><router-link class="nav-link" :to="subLink('accolades')">Accolades</router-link></li>
            <li v-if="showStaff" class="nav-item ct-passive"><router-link class="nav-link" :to="subLink('staff')">Staff</router-link></li>
            <li v-if="event.theme" class="nav-item ct-passive"><router-link class="nav-link" :to="subLink('theme')">Theme</router-link></li>
            <li v-if="event.about" class="nav-item ct-passive"><router-link class="nav-link" :to="subLink('about')">About</router-link></li>
            <!--            <li class="nav-item" v-if="team.matches"><router-link class="nav-link" :to="subLink('matches')">Matches</router-link></li>-->
            <li v-if="canEditEventSettings" class="nav-item ct-passive">
                <router-link class="nav-link" :to="subLink('settings')" active-class="rl-active">Settings</router-link>
            </li>
            <ul v-if="event.socials" class="socials d-flex">
                <li class="nav-item">
                    <Social v-for="social in event.socials" :key="social.id" class="ct-active" :social="social" />
                </li>
            </ul>

            <li v-if="shouldShowMinisitePrompt" class="nav-item mx-2 minisite-prompt default-thing" :style="themeBackground1(event)">
                <a :href="minisiteLink" class="nav-link no-link-style themed">See this page on the <b>{{ subdomain }}</b> minisite <i class="fas fa-chevron-right fa-fw ml-1"></i></a>
            </li>
        </SubPageNav>

        <router-view :event="event" :is-minisite="isMinisite" />
    </div>
</template>

<script>

import ThingTop from "@/components/website/ThingTop";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import SubPageNav from "@/components/website/SubPageNav";
import Social from "@/components/website/Social";
import { themeBackground1 } from "@/utils/theme-styles";
import { resizedImageNoWrap } from "@/utils/images";
import { cleanID } from "@/utils/content-utils";
import { isEventStaffOrHasRole } from "@/utils/client-action-permissions";
import { useAuthStore } from "@/stores/authStore";

export default {
    name: "Event",
    components: {
        ThingTop, SubPageNav, Social
    },
    beforeRouteLeave(to, from, next) {
        this.$emit("id_change", null);
        next();
    },
    props: ["id", "isMinisite"],
    computed: {
        event() {
            return ReactiveRoot(this.isMinisite ? this.$root.minisiteEvent.id : this.id, {
                theme: ReactiveThing("theme"),
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                }),
                staff: ReactiveArray("staff"),
                player_relationships: ReactiveArray("player_relationships", {
                    player: ReactiveThing("player")
                }),
                brand_designers: ReactiveArray("brand_designers"),
                casters: ReactiveArray("casters"),
                news_items: ReactiveArray("news_items", {
                    team: ReactiveThing("team", {
                        theme: ReactiveThing("theme")
                    })
                }),
                socials: ReactiveArray("socials"),
                matches: ReactiveArray("matches"),
                brackets: ReactiveArray("brackets")
            });
        },
        brackets() {
            return (this.event?.brackets || []).filter(e => e?.name && !e?.hide_bracket);
        },
        settings() {
            if (!this.event?.blocks) return null;
            try {
                return JSON.parse(this.event.blocks);
            } catch (e) {
                return null;
            }
        },
        showFoldy() {
            return this.settings?.foldy?.use || false;
        },
        showStandings() {
            return this.settings?.standings?.length || false;
        },
        showDraft() {
            return this.settings?.draft?.use || false;
        },
        showAuction() {
            return this.settings?.auction?.public || false;
        },
        showStaff() {
            return this.settings?.extendedStaffPage ||
                this.event?.player_relationships ||
                this.event?.staff ||
                this.event?.matches ||
                this.event?.casters;
        },
        subdomain() {
            return this.event?.subdomain || this.event?.partial_subdomain;
        },
        ownMinisiteStatus() {
            // need to check if it's on A) the primary event for the subdomain (ie BPL3)
            // or B) it's a valid secondary event (ie BPL1/BPL2)
            if (!this.subdomain) return "no-this-minisite";
            if (!this.$root?.minisiteEvent?.subdomain) return "no-root-minisite";
            const activeSubdomain = this.$root.minisiteEvent.subdomain;
            if (activeSubdomain === this.event.subdomain) return "on-main-subdomain";
            if (activeSubdomain === this.event.partial_subdomain) return "on-partial-subdomain";
            return "on-foreign-subdomain";
        },
        shouldShowMinisitePrompt() {
            return this.minisiteDomain && ["no-root-minisite", "on-foreign-subdomain"].includes(this.ownMinisiteStatus);
        },
        minisiteLink() {
            if (!this.event?.id || !this.minisiteDomain) return null;
            if (this.subdomain === this.event.partial_subdomain) {
                return `${this.minisiteDomain}/event/${this.event.id}`;
            } else {
                return this.minisiteDomain;
            }
        },
        minisiteDomain() {
            // TODO: make this change
            if (!this.event) return null;

            try {
                if ([import.meta.env.VITE_DEPLOY_MODE, import.meta.env.NODE_ENV].includes("staging")) return `https://${this.subdomain}.dev.slmn.gg`;
                if (import.meta.env.NODE_ENV === "development" || import.meta.env.VITE_DEPLOY_MODE === "local") return `http://${this.subdomain}.localhost:8080`;
                if ([import.meta.env.VITE_DEPLOY_MODE, import.meta.env.NODE_ENV].includes("production")) return `https://${this.subdomain}.slmn.gg`;
                return null;
            } catch (e) {
                return null;
            }
        },
        canEditEventSettings() {
            const { isAuthenticated, user } = useAuthStore();
            if (!isAuthenticated) return false;
            return isEventStaffOrHasRole(user, this.event,["Can edit any event"]);
        }
    },
    methods: {
        subLink(page) {
            if (this.isMinisite) {
                return `/${page}`;
            }
            return `/event/${this.event.id}/${page}`;
        },
        themeBackground1
    },
    watch: {
        id: {
            handler(id) {
                console.log("id change", cleanID(id));
                this.$emit("id_change", cleanID(id));
            },
            immediate: true
        }
    },
    mounted() {
        console.log("[event mount]", this.id, this.event, this.$root.minisiteEvent);
    },
    head() {
        return {
            titleTemplate: (chunk) => chunk ? `${chunk} | ${this.event.name} | SLMN.GG` : `${this.event.name} | SLMN.GG`,
            link: [{ rel: "icon", href: resizedImageNoWrap(this.event.theme, ["small_logo", "default_logo"], "s-128"), key: "favicon" }]
        };
    }
};

</script>

<style scoped>
    .socials {
        list-style: none;
        padding-left: 0;
        margin: 0 .5em;
    }
    .socials li a {
        padding: .25em .25em;
    }
    .minisite-prompt a:hover {
        color: inherit !important;
    }
</style>

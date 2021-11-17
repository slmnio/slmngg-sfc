<template>
    <div v-if="event">
        <ThingTop :thing="event" type="event"></ThingTop>

        <SubPageNav class="my-2">
            <li class="nav-item ct-passive"><router-link class="nav-link" :to="subLink('')">Overview</router-link></li>
<!--            <li class="nav-item"><router-link class="nav-link" :to="subLink('rosters')">Rosters</router-link></li>-->
            <li class="nav-item ct-passive" v-if="event.matches"><router-link class="nav-link" :to="subLink('schedule')">Schedule</router-link></li>
            <li class="nav-item ct-passive" v-if="showStandings"><router-link class="nav-link" :to="subLink('standings')">Standings</router-link></li>
            <li class="nav-item ct-passive" v-if="event.brackets"><router-link class="nav-link" :to="subLink('bracket')">{{ event.brackets.length === 1 ? 'Bracket' : 'Brackets' }}</router-link></li>
            <li class="nav-item ct-passive" v-if="showFoldy"><router-link class="nav-link" :to="subLink('scenarios')">Foldy Sheet</router-link></li>
            <li class="nav-item ct-passive" v-if="showDraft"><router-link class="nav-link" :to="subLink('draft')">Draft</router-link></li>
            <li class="nav-item ct-passive" v-if="useStaffPage"><router-link class="nav-link" :to="subLink('staff')">Staff</router-link></li>
            <li class="nav-item ct-passive" v-if="event.about"><router-link class="nav-link" :to="subLink('about')">About</router-link></li>
<!--            <li class="nav-item" v-if="team.matches"><router-link class="nav-link" :to="subLink('matches')">Matches</router-link></li>-->


            <ul class="socials d-flex" v-if="event.socials">
                <li class="nav-item">
                    <Social class="ct-active" :social="social" v-for="social in event.socials" v-bind:key="social.id"/>
                </li>
            </ul>

            <li class="nav-item mx-2 minisite-prompt default-thing" v-if="shouldShowMinisitePrompt" :style="themeBackground1(event)">
                <a :href="minisiteLink" class="nav-link no-link-style themed">See this page on the <b>{{ subdomain }}</b> minisite <i class="fas fa-chevron-right fa-fw ml-1"></i></a>
            </li>
        </SubPageNav>

        <router-view :event="event"></router-view>
    </div>
</template>

<script>

import ThingTop from "@/components/website/ThingTop";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { multiImage } from "@/utils/content-utils";
import SubPageNav from "@/components/website/SubPageNav";
import Social from "@/components/website/Social";
import { themeBackground1 } from "@/utils/theme-styles";

export default {
    name: "Event",
    props: ["id", "isMinisite"],
    components: {
        ThingTop, SubPageNav, Social
    },
    metaInfo() {
        return {
            title: this.event.name,
            meta: [
                { name: "description", content: "test description" },
                { name: "og:description", content: "test description" },
                { name: "og:title", content: this.event.name }
            ],
            link: [{ rel: "icon", href: multiImage(this.event.theme, ["small_logo", "default_logo"]) }]
        };
    },
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
                casters: ReactiveArray("casters"),
                news_items: ReactiveArray("news_items"),
                socials: ReactiveArray("socials")
            });
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
        useStaffPage() {
            return this.settings?.extendedStaffPage || false;
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
            return ["no-root-minisite", "on-foreign-subdomain"].includes(this.ownMinisiteStatus);
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
                if (process.env.NODE_ENV === "development") return `http://${this.subdomain}.localhost:8080`;
                if (process.env.VUE_APP_DEPLOY_MODE === "local") return `http://${this.subdomain}.localhost:8080`;
                if (process.env.VUE_APP_DEPLOY_MODE === "staging") return `https://${this.subdomain}.dev.slmn.gg`;
                if (process.env.NODE_ENV === "production") return `https://${this.subdomain}.slmn.gg`;
                if (process.env.VUE_APP_DEPLOY_MODE === "production") return `https://${this.subdomain}.slmn.gg`;
                return null;
            } catch (e) {
                return null;
            }
        }
    },
    mounted() {
        console.log("[event mount]", this.id, this.event, this.$root.minisiteEvent);
    },
    methods: {
        subLink(page) {
            if (this.isMinisite) {
                return `/${page}`;
            }
            return `/event/${this.event.id}/${page}`;
        },
        themeBackground1
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

<template>
    <div v-if="event">
        <ThingTop :thing="event" type="event"></ThingTop>

        <SubPageNav class="my-2">
            <li class="nav-item"><router-link class="nav-link" :to="subLink('')">Overview</router-link></li>
<!--            <li class="nav-item"><router-link class="nav-link" :to="subLink('rosters')">Rosters</router-link></li>-->
            <li class="nav-item" v-if="event.matches"><router-link class="nav-link" :to="subLink('schedule')">Schedule</router-link></li>
            <li class="nav-item" v-if="event.brackets"><router-link class="nav-link" :to="subLink('bracket')">{{ event.brackets.length === 1 ? 'Bracket' : 'Brackets' }}</router-link></li>
            <li class="nav-item" v-if="showFoldy"><router-link class="nav-link" :to="subLink('scenarios')">Foldy Sheet</router-link></li>
            <li class="nav-item" v-if="showDraft"><router-link class="nav-link" :to="subLink('draft')">Draft</router-link></li>
            <li class="nav-item" v-if="useStaffPage"><router-link class="nav-link" :to="subLink('staff')">Staff</router-link></li>
            <li class="nav-item" v-if="event.about"><router-link class="nav-link" :to="subLink('about')">About</router-link></li>
<!--            <li class="nav-item" v-if="team.matches"><router-link class="nav-link" :to="subLink('matches')">Matches</router-link></li>-->


            <ul class="socials d-flex" v-if="event.socials">
                <li class="nav-item">
                    <Social :social="social" v-for="social in event.socials" v-bind:key="social.id"/>
                </li>
            </ul>
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
        showDraft() {
            return this.settings?.draft?.use || false;
        },
        useStaffPage() {
            return this.settings?.extendedStaffPage || false;
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
        }
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
</style>

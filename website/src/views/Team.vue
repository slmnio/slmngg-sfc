<template>
    <div v-if="team">
        <ThingTop :thing="team" type="team"></ThingTop>
        <SubPageNav class="my-2">
            <li class="nav-item"><router-link class="nav-link" :to="subLink('')">Overview</router-link></li>
            <li class="nav-item" v-if="team.matches"><router-link class="nav-link" :to="subLink('matches')">Matches</router-link></li>
            <li class="nav-item" v-if="team.theme"><router-link class="nav-link" :to="subLink('theme')">Theme</router-link></li>
<!--            <li class="nav-item"><router-link class="nav-link" :to="subLink('details')">Details</router-link></li>-->

            <ul class="socials d-flex" v-if="team.socials">
                <li class="nav-item">
                    <Social class="ct-active" :social="social" v-for="social in team.socials" v-bind:key="social.id"/>
                </li>
            </ul>

        </SubPageNav>
        <router-view :team="team"></router-view>
    </div>
</template>

<script>
import ThingTop from "@/components/website/ThingTop";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import SubPageNav from "@/components/website/SubPageNav";
import { multiImage } from "@/utils/content-utils";
import Social from "@/components/website/Social";

export default {
    name: "Team",
    props: ["id"],
    components: {
        ThingTop, SubPageNav, Social
    },
    metaInfo() {
        return {
            title: this.team.name,
            meta: [
                { name: "description", content: "test description" },
                { name: "og:description", content: "test description" },
                { name: "og:title", content: this.team.name }
            ],
            link: [{ rel: "icon", href: multiImage(this.team.theme, ["small_logo", "default_logo"]) }]
        };
    },
    methods: {
        subLink(page) {
            return `/team/${this.team.id}/${page}`;
        }
    },
    computed: {
        team() {
            return ReactiveRoot(this.id, {
                owners: ReactiveArray("owners"),
                captains: ReactiveArray("captains"),
                players: ReactiveArray("players"),
                theme: ReactiveThing("theme"),
                brand_designers: ReactiveArray("brand_designers"),
                sister_teams: ReactiveArray("sister_teams", {
                    theme: ReactiveThing("theme")
                }),
                team_in_other_tournaments: ReactiveArray("team_in_other_tournaments", {
                    theme: ReactiveThing("theme"),
                    event: ReactiveThing("event")
                }),
                staff: ReactiveArray("staff"),
                event: ReactiveThing("event", {
                    theme: ReactiveThing("theme")
                }),
                accolades: ReactiveArray("accolades", {
                    event: ReactiveThing("event", {
                        theme: ReactiveThing("theme")
                    })
                }),
                socials: ReactiveArray("socials")
            });
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

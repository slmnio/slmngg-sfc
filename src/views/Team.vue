<template>
    <div v-if="team">
        <ThingTop :thing="team" type="team"></ThingTop>
        <SubPageNav class="my-2">
            <li class="nav-item"><router-link class="nav-link" :to="subLink('')">Overview</router-link></li>
            <li class="nav-item" v-if="team.matches"><router-link class="nav-link" :to="subLink('matches')">Matches</router-link></li>
        </SubPageNav>
        <router-view :team="team"></router-view>
    </div>
</template>

<script>
import ThingTop from "@/components/website/ThingTop";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import SubPageNav from "@/components/website/SubPageNav";
import { multiImage } from "@/utils/content-utils";

export default {
    name: "Team",
    props: ["id"],
    components: {
        ThingTop, SubPageNav
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
                captain: ReactiveThing("captain"),
                players: ReactiveArray("players"),
                theme: ReactiveThing("theme"),
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
                })
            });
        }
    }
};

</script>

<style scoped>

</style>

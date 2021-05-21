<template>
    <div v-if="event">
        <ThingTop :thing="event" type="event"></ThingTop>

        <SubPageNav class="my-2">
            <li class="nav-item"><router-link class="nav-link" :to="subLink('')">Overview</router-link></li>
<!--            <li class="nav-item"><router-link class="nav-link" :to="subLink('rosters')">Rosters</router-link></li>-->
            <li class="nav-item" v-if="event.brackets"><router-link class="nav-link" :to="subLink('bracket')">{{ event.brackets.length === 1 ? 'Bracket' : 'Brackets' }}</router-link></li>
<!--            <li class="nav-item" v-if="team.matches"><router-link class="nav-link" :to="subLink('matches')">Matches</router-link></li>-->
        </SubPageNav>

        <router-view :event="event"></router-view>
    </div>
</template>

<script>

import ThingTop from "@/components/website/ThingTop";
import ContentThing from "@/components/website/ContentThing";
import ContentRow from "@/components/website/ContentRow";
import { ReactiveRoot, ReactiveThing, ReactiveArray } from "@/utils/reactive";
import { multiImage } from "@/utils/content-utils";
import SubPageNav from "@/components/website/SubPageNav";

export default {
    name: "Event",
    props: ["id"],
    components: {
        ThingTop, SubPageNav
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
            return ReactiveRoot(this.id, {
                theme: ReactiveThing("theme"),
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                }),
                staff: ReactiveArray("staff"),
                player_relationships: ReactiveArray("player_relationships", {
                    player: ReactiveThing("player")
                })
            });
        }
    },
    methods: {
        subLink(page) {
            return `/event/${this.event.id}/${page}`;
        }
    }
};

</script>

<style scoped>

</style>

<template>
    <div v-if="team">
        <ThingTop :thing="team" type="team" :theme-u-r-l="subLink('theme')" />
        <SubPageNav class="my-2">
            <li class="nav-item"><router-link class="nav-link" :to="subLink('')">{{ showPublicTeamDetails === true ? 'Details' : 'Overview' }}</router-link></li>
            <li v-if="team.players?.length && useTeamCompositions" class="nav-item"><router-link class="nav-link" :to="subLink('details')">Details</router-link></li>
            <li v-if="team.matches" class="nav-item"><router-link class="nav-link" :to="subLink('matches')">Matches</router-link></li>
            <li v-if="team.theme" class="nav-item"><router-link class="nav-link" :to="subLink('theme')">Theme</router-link></li>
            <li v-if="team.players?.length" class="nav-item"><router-link class="nav-link" :to="subLink('previous')">Previous Teams</router-link></li>
            <li v-if="canEditEventSettings" class="nav-item"><router-link class="nav-link" :to="subLink('settings')">Settings</router-link></li>

            <ul v-if="team.socials" class="socials d-flex">
                <li class="nav-item">
                    <Social v-for="social in team.socials" :key="social.id" class="ct-active" :social="social" />
                </li>
            </ul>
        </SubPageNav>
        <router-view :team="team" />
    </div>
</template>

<script>
import ThingTop from "@/components/website/ThingTop";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import SubPageNav from "@/components/website/SubPageNav";
import Social from "@/components/website/Social";
import { resizedImageNoWrap } from "@/utils/images";
import { cleanID } from "@/utils/content-utils";
import { useAuthStore } from "@/stores/authStore";
import { isEventStaffOrHasRole } from "@/utils/client-action-permissions";

export default {
    name: "Team",
    components: {
        ThingTop, SubPageNav, Social
    },
    beforeRouteLeave(to, from, next) {
        this.$emit("id_change", null);
        next();
    },
    props: ["id"],
    computed: {
        team() {
            return ReactiveRoot(this.id, {
                owners: ReactiveArray("owners"),
                captains: ReactiveArray("captains"),
                players: ReactiveArray("players"),
                theme: ReactiveThing("theme"),
                red_theme: ReactiveThing("red_theme"),
                blue_theme: ReactiveThing("blue_theme"),
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
                    theme: ReactiveThing("theme"),
                    feeder_events: ReactiveArray("feeder_events")
                }),
                accolades: ReactiveArray("accolades", {
                    event: ReactiveThing("event", {
                        theme: ReactiveThing("theme")
                    })
                }),
                socials: ReactiveArray("socials"),
                news_items: ReactiveArray("news_items", {
                    event: ReactiveThing("event", {
                        theme: ReactiveThing("theme")
                    }),
                    team: ReactiveThing("team", {
                        theme: ReactiveThing("theme")
                    })
                })
            });
        },
        showPublicTeamDetails() {
            if (this.team.__loading || !this.team?.id) return null;
            if (this.team.event === undefined) return false;
            if (this.team.event?.__loading || !this.team.event?.id) return null;

            return this.team.event?.show_public_team_details || false;
        },
        eventID() {
            return this.team?.event?.id;
        },
        eventSettings() {
            if (!this.team?.event?.blocks) return null;
            try {
                return JSON.parse(this.team?.event.blocks);
            } catch (e) {
                return null;
            }
        },
        useTeamCompositions() {
            return this.eventSettings?.composition?.use;
        },
        canEditEventSettings() {
            const { isAuthenticated, user } = useAuthStore();
            if (!isAuthenticated || !this.team?.event) return false;
            return isEventStaffOrHasRole(user, this.team?.event, ["Can edit any event"]);
        }
    },
    methods: {
        subLink(page) {
            return `/team/${this.team.id}/${page}`;
        }
    },
    watch: {
        eventID: {
            handler(id) {
                console.log("team's event id change", cleanID(id));
                this.$emit("id_change", cleanID(id));
            },
            immediate: true
        }
    },
    head() {
        return {
            title: this.team.name,
            meta: [
                { name: "description", content: "test description" },
                { name: "og:description", content: "test description" },
                { name: "og:title", content: this.team.name }
            ],
            link: [{ rel: "icon", key: "favicon", href: resizedImageNoWrap(this.team.theme, ["small_logo", "default_logo"], "s-128") }]
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
</style>

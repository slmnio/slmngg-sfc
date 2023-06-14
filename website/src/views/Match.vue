<template>
    <div id="match" v-if="match">
        <MatchHero :match="match" />
        <div class="container mt-3 text-center" v-if="match.special_event ? [match.score_1, match.score_2].some(x => x) : true">
            <MatchScore :match="match" />
        </div>
        <div class="container mt-3 large-container">
            <div class="row">
                <div class="col-12 col-md-9 mb-3">
                    <router-view :match="match" />
                </div>
                <div class="col-12 col-md-3">
                    <ul class="match-sub-nav list-group mb-2" v-if="sidebarItems.length > 1"> <!-- only because it'd be the only one -->
                        <router-link v-if="sidebarItems.includes('vod')" class="list-group-item ct-passive" exact active-class="active ct-active" :to="subLink('')">VOD</router-link>
                        <router-link v-if="sidebarItems.includes('head-to-head')" class="list-group-item ct-passive" active-class="active ct-active" :to="subLink('history')">Head to head</router-link>
                        <router-link v-if="sidebarItems.includes('editor')" class="list-group-item ct-passive" active-class="active ct-active" :to="subLink('editor')">Match editor</router-link>
                    </ul>

                    <table class="match-details table-sm">
                        <thead>
                            <tr>
                                <td colspan="2" class="match-details-header">
                                    <router-link :to="`/detailed/${match.id}`" class="hidden-link">MATCH DETAILS</router-link>
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="match.start"><td colspan="2">{{ date }}</td></tr>
                            <tr v-if="match.event && match.event.name"><td colspan="2" class="default-thing" :style="eventStyle">
                                <b><router-link :to="url('event', match.event)" class="match-event-link">{{ match.event.name }}</router-link></b>
                            </td></tr>
                            <tr v-if="match.forfeit"><td colspan="2"><b><i>Match was forfeited</i></b><span v-if="match.forfeit_reason"><br>{{ match.forfeit_reason }}</span></td></tr>
                            <tr v-if="lowerText"><td colspan="2">{{ lowerText }}</td></tr>
                            <tr v-if="match.first_to">
                                <td>First to</td><td>{{ match.first_to }}</td>
                            </tr>
                            <tr v-if="match.casters">
                                <td>{{ match.casters.length === 1 ? 'Caster' : 'Casters' }}</td>
                                <td><LinkedPlayers :players="match.casters" /></td>
                            </tr>
                            <tr v-for="group in playerRelationshipGroups" :key="group.meta.singular_name">
                                <td>{{ group.items.length === 1 ? group.meta.singular_name : group.meta.plural_name }}</td>
                                <td><LinkedPlayers :players="group.items"/></td>
                            </tr>
                            <tr v-if="match.mvp">
                                <td>MVP</td>
                                <td><LinkedPlayers :players="[match.mvp]" /></td>
                            </tr>
                            <tr v-if="replayCodes">
                                <td>Replay codes</td>
                                <td>{{ replayCodes }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import MatchHero from "@/components/website/match/MatchHero";
import MatchScore from "@/components/website/match/MatchScore";
import LinkedPlayers from "@/components/website/LinkedPlayers";
import { cleanID, formatTime, getMatchContext, url } from "@/utils/content-utils";
import { resizedImageNoWrap } from "@/utils/images";
import { isAuthenticated } from "@/utils/auth";
import { canEditMatch } from "@/utils/client-action-permissions";

export default {
    name: "Match",
    props: ["id"],
    components: { MatchHero, MatchScore, LinkedPlayers },
    methods: {
        subLink(subLinkURL) {
            return `/match/${this.match.id}/${subLinkURL}`;
        },
        url
    },
    computed: {
        match() {
            return ReactiveRoot(this.id, {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                }),
                event: ReactiveThing("event", {
                    theme: ReactiveThing("theme"),
                    player_relationships: ReactiveArray("player_relationships"),
                    broadcasts: ReactiveThing("broadcasts")
                }),
                casters: ReactiveArray("casters"),
                player_relationships: ReactiveArray("player_relationships", {
                    player: ReactiveThing("player")
                }),
                mvp: ReactiveThing("mvp"),
                maps: ReactiveArray("maps", {
                    map: ReactiveThing("map"),
                    winner: ReactiveThing("winner", {
                        theme: ReactiveThing("theme")
                    }),
                    picker: ReactiveThing("picker", {
                        theme: ReactiveThing("theme")
                    }),
                    banner: ReactiveThing("banner", {
                        theme: ReactiveThing("theme")
                    })
                }),
                log_files: ReactiveThing("log_files")
            });
        },
        eventStyle() {
            if (!this.match.event || !this.match.event.theme) return {};
            return {
                backgroundColor: this.match.event.theme.color_logo_background || this.match.event.theme.color_theme,
                color: this.match.event.theme.color_text_on_logo_background || this.match.event.theme.color_text_on_theme
            };
        },
        lowerText() {
            return getMatchContext(this.match);
        },
        playerRelationshipGroups() {
            if (!this.match?.player_relationships) return [];
            const groups = {};

            this.match?.player_relationships.forEach(rel => {
                if (!groups[rel.singular_name]) {
                    groups[rel.singular_name] = {
                        meta: {
                            player_text: rel.player_text,
                            plural_name: rel.plural_name,
                            singular_name: rel.singular_name
                        },
                        items: []
                    };
                }
                groups[rel.singular_name].items = groups[rel.singular_name].items.concat(rel.player);
            });

            if (groups[undefined]) return [];

            return Object.values(groups);
        },
        date() {
            return formatTime(this.match.start, this.$store.state.timezone);
        },
        theme() {
            return this.match?.event?.theme;
        },
        showHeadToHead() {
            if (this.match?.special_event) return false;
            return this.match?.event?.map_pool;
        },
        showEditor() {
            if (!isAuthenticated(this.$root)) return false;
            // TODO: Make sure user is an admin or has perms here
            return canEditMatch(this.$root.auth?.user, { event: this.match?.event, match: this.match });
        },
        sidebarItems() {
            const items = ["vod"];

            if (this.showHeadToHead) items.push("head-to-head");
            if (this.showEditor) items.push("editor");

            return items;
        },
        replayCodes() {
            if (this.match?.log_files?.replay_codes) return this.match.log_files.replay_codes;
            if (!this.match?.maps?.some(map => map.replay_code)) return null;
            return this.match.maps.map(map => `${map.name?.[0]}: ${map.replay_code}`).join(", \n");
        },
        eventID() {
            return this.match?.event?.id;
        }
    },
    watch: {
        eventID: {
            handler(id) {
                console.log("match's event id change", cleanID(id));
                this.$emit("id_change", cleanID(id));
            },
            immediate: true
        }
    },
    beforeRouteLeave(to, from, next) {
        this.$emit("id_change", null);
        next();
    },
    metaInfo() {
        return {
            title: this.match.name,
            link: [{ rel: "icon", href: resizedImageNoWrap(this.match?.event?.theme, ["small_logo", "default_logo"], "s-128") }]
        };
    }
};
</script>

<style scoped>
    #match {
        margin-top: 0 !important;
    }
    .match-details {
        width: 100%;
    }
    .match-details-header {
        text-align: center;
        font-weight: bold;
        font-size: 1.25em;
    }
    .match-details td {
        background: #333;
        border: 2px solid #222;
    }
    .match-details td[colspan="2"] {
        text-align: center;
    }
    .match-details td:not([colspan]):first-child {
        line-height: 1.2em;
        text-align: center;
    }

    @media (min-width: 1450px) {
        #match .large-container {
            max-width: 1400px;
        }
    }
    .match-event-link, .match-event-link:hover {
        color: inherit;
    }


    .hidden-link, .hidden-link:hover {
        color: white;
        text-decoration: none;
        cursor: initial
    }

    .match-sub-nav .list-group-item {
        background-color: #282828;
        padding: 0.5em .75em;
        text-decoration: none;
        border-radius: 0;
    }

    .match-sub-nav .list-group-item.active {
        background-color: #333333;
        /*color: #fff !important;*/
        border-color: transparent;
    }

    td.default-thing {
        background-color: rgba(255, 255, 255, 0.185);
    }
</style>

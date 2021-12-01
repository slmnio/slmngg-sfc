<template>
    <div id="match" v-if="match">
        <MatchHero :match="match" />
        <div class="container mt-3 text-center">
            <MatchScore :match="match" />
        </div>
        <div class="container mt-3 large-container">
            <div class="row">
                <div class="col-12 col-md-9 mb-3">
                    <router-view :match="match" />
                </div>
                <div class="col-12 col-md-3">
                    <ul class="match-sub-nav list-group mb-2" v-if="showHeadToHead"> <!-- only because it'd be the only one -->
                        <router-link class="list-group-item ct-passive" exact active-class="active ct-active" :to="subLink('')">VOD</router-link>
                        <router-link v-if="showHeadToHead" class="list-group-item ct-passive" active-class="active ct-active" :to="subLink('history')">Head to head</router-link>
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
                            <tr v-if="match.forfeit"><td colspan="2"><i>Match was forfeited</i></td></tr>
                            <tr v-if="lowerText"><td colspan="2">{{ lowerText }}</td></tr>
                            <tr v-if="match.first_to">
                                <td>First to</td><td>{{ match.first_to }}</td>
                            </tr>
                            <tr v-if="match.casters">
                                <td>{{ match.casters.length === 1 ? 'Caster' : 'Casters' }}</td>
                                <td><LinkedPlayers :players="match.casters" /></td>
                            </tr>
                            <tr v-for="group in playerRelationshipGroups" v-bind:key="group.meta.singular_name">
                                <td>{{ group.items.length === 1 ? group.meta.singular_name : group.meta.plural_name }}</td>
                                <td><LinkedPlayers :players="group.items"/></td>
                            </tr>
                            <tr v-if="match.mvp">
                                <td>MVP</td>
                                <td><LinkedPlayers :players="[match.mvp]" /></td>
                            </tr>
                            <tr v-if="match.log_files && match.log_files.replay_codes">
                                <td>Replay codes</td>
                                <td>{{ match.log_files.replay_codes }}</td>
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
import { getMatchContext, multiImage, url } from "@/utils/content-utils";

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
                    theme: ReactiveThing("theme")
                }),
                casters: ReactiveArray("casters"),
                player_relationships: ReactiveArray("player_relationships", {
                    player: ReactiveThing("player")
                }),
                mvp: ReactiveThing("mvp"),
                maps: ReactiveArray("maps", {
                    winner: ReactiveThing("winner", {
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
            const date = new Date(this.match.start);

            let time = "";

            if (date.getHours() >= 12) {
                // pm
                if (date.getHours() % 12 === 0) { time += 12; } else { time += (date.getHours() % 12); }
                time += ":";
                time += date.getMinutes().toString().padStart(2, "0");
                time += "pm";
            } else {
                if (date.getHours() === 0) { time += 12; } else { time += (date.getHours() % 12); }
                time += ":";
                time += date.getMinutes().toString().padStart(2, "0");
                time += "am";
            }


            function z(n) {
                if (n.toString().slice(-1) === "1") return "st";
                if (n.toString().slice(-1) === "2") return "nd";
                if (n.toString().slice(-1) === "3") return "rd";
                return "th";
            }

            return `${date.getDate()}${z(date.getDate())} ${("Jan.Feb.Mar.Apr.May.Jun.Jul.Aug.Sep.Oct.Nov.Dec".split("."))[date.getMonth()]} ${date.getFullYear()} ${time}`;
        },
        theme() {
            return this.match?.event?.theme;
        },
        showHeadToHead() {
            return this.match?.event?.map_pool;
        }
    },
    metaInfo() {
        return {
            title: this.match.name,
            link: [{ rel: "icon", href: multiImage(this.match?.event?.theme, ["small_logo", "default_logo"]) }]
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

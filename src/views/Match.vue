<template>
    <div id="match" v-if="match">
        <MatchHero :match="match" />
        <div class="container mt-3 text-center">
            <MatchScore :match="match" />
        </div>
        <div class="container mt-3 large-container">
            <div class="row">
                <div class="col-12 col-md-9 mb-3">
                    <EmbeddedVideo :src="match.vod" v-if="match && match.vod" />
                </div>
                <div class="col-12 col-md-3">
                    <table class="match-details table-sm">
                        <thead>
                            <tr>
                                <td colspan="2" class="match-details-header">MATCH DETAILS</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="match.start"><td colspan="2">{{ date }}</td></tr>
                            <tr v-if="match.event && match.event.name"><td colspan="2"><b>{{ match.event.name }}</b></td></tr>
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
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import MatchHero from "@/components/MatchHero";
import MatchScore from "@/components/MatchScore";
import EmbeddedVideo from "@/components/EmbeddedVideo";
import LinkedPlayers from "@/components/LinkedPlayers";
import { getMatchContext } from "@/utils/content-utils";

export default {
    name: "Match",
    props: ["id"],
    components: { MatchHero, MatchScore, EmbeddedVideo, LinkedPlayers },
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
                mvp: ReactiveThing("mvp")
            });
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
        }
    },
    metaInfo() {
        return {
            title: this.match.name
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
    .embed {
        background: #171717;
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
</style>

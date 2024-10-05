<template>
    <div v-if="match" id="match">
        <MatchHero :match="match" />
        <div v-if="match.special_event ? [match.score_1, match.score_2].some(x => x) : true" class="container mt-3 text-center">
            <MatchScore :match="match" />
        </div>
        <div class="container mt-3 large-container">
            <div class="row">
                <div class="col-12 col-lg-9 mb-3">
                    <router-view :match="match" />
                </div>
                <div class="col-12 col-lg-3">
                    <ul v-if="sidebarItems.length > 1" class="match-sub-nav list-group mb-2">
                        <!-- only because it'd be the only one -->
                        <router-link v-if="sidebarItems.includes('vod')" class="list-group-item ct-passive" exact-active-class="active ct-active" :to="subLink('')">VOD</router-link>
                        <router-link v-if="sidebarItems.includes('head-to-head')" class="list-group-item ct-passive" active-class="active ct-active" :to="subLink('history')">Map stats</router-link>
                        <router-link v-if="sidebarItems.includes('score-reporting')" class="list-group-item ct-passive" active-class="active ct-active" :to="subLink('score-reporting')">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>Score reporting</div>

                                <div class="d-flex flex-wrap align-items-center justify-content-end gap-1">
                                    <div v-if="scoreReportingBadge" class="badge pill" :class="`bg-${scoreReportingBadge.variant}`" :title="scoreReportingBadge?.title">
                                        {{ scoreReportingBadge.text }}
                                    </div>


                                    <div v-if="!authenticated">
                                        <span v-b-tooltip="'Requires login'">
                                            <i class="fa fa-lock"></i>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </router-link>
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
                            <tr v-if="match.event && match.event.name">
                                <td colspan="2" class="default-thing" :style="eventStyle">
                                    <b><router-link :to="url('event', match.event)" class="match-event-link">{{ match.event.name }}</router-link></b>
                                </td>
                            </tr>
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
                                <td><LinkedPlayers :players="group.items" /></td>
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
import MatchHero from "@/components/website/match/MatchHero";
import MatchScore from "@/components/website/match/MatchScore";
import LinkedPlayers from "@/components/website/LinkedPlayers";
import { cleanID, formatTime, getMatchContext, getScoreReportingBadge, url } from "@/utils/content-utils";
import { resizedImageNoWrap } from "@/utils/images";
import { canEditMatch, isEventStaffOrHasRole } from "@/utils/client-action-permissions";
import { useSettingsStore } from "@/stores/settingsStore";
import { useAuthStore } from "@/stores/authStore";

export default {
    name: "Match",
    components: { MatchHero, MatchScore, LinkedPlayers },
    beforeRouteLeave(to, from, next) {
        this.$emit("id_change", null);
        next();
    },
    props: ["id"],
    computed: {
        match() {
            return ReactiveRoot(this.id, {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                }),
                event: ReactiveThing("event", {
                    theme: ReactiveThing("theme"),
                    player_relationships: ReactiveArray("player_relationships"),
                    broadcasts: ReactiveArray("broadcasts")
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
                    }),
                    team_1_picks: ReactiveArray("team_1_picks"),
                    team_1_bans: ReactiveArray("team_1_bans"),
                    team_2_picks: ReactiveArray("team_2_picks"),
                    team_2_bans: ReactiveArray("team_2_bans"),
                }),
                log_files: ReactiveThing("log_files")
            });
        },
        eventStyle() {
            if (!this.match.event?.theme) return {};
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
            return formatTime(this.match.start, {
                tz: useSettingsStore().timezone,
                use24HourTime: useSettingsStore().use24HourTime
            });
        },
        theme() {
            return this.match?.event?.theme;
        },
        showHeadToHead() {
            if (this.match?.special_event) return false;
            return this.match?.event?.map_pool;
        },
        showEditor() {
            const { isAuthenticated, player } = useAuthStore();
            if (!isAuthenticated) return false;
            return canEditMatch(player, { event: this.match?.event, match: this.match });
        },
        eventSettings() {
            if (!this.match?.event?.blocks) return null;
            return JSON.parse(this.match.event.blocks);
        },
        scoreReportingEnabled() {
            return this.eventSettings?.reporting?.score?.use;
        },
        authenticated() {
            const { isAuthenticated } = useAuthStore();
            return isAuthenticated;
        },
        matchComplete() {
            if (!this.match?.first_to) return false;
            return [this.match?.score_1 || 0, this.match?.score_2 || 0].some(x => x === this.match?.first_to);
        },
        sidebarItems() {
            const items = ["vod"];

            console.log("route", this.$route);

            if (this.showHeadToHead) items.push("head-to-head");
            if (this.showEditor) items.push("editor");
            if ((this.scoreReportingEnabled && !this.matchComplete) || (this.$route?.path?.endsWith("/score-reporting"))) items.push("score-reporting");


            return items;
        },
        replayCodes() {
            if (this.match?.log_files?.replay_codes) return this.match.log_files.replay_codes;
            if (!this.match?.maps?.some(map => map.replay_code)) return null;
            return this.match.maps.map(map => `${map.name?.[0]}: ${map.replay_code}`).join(", \n");
        },
        eventID() {
            return this.match?.event?.id;
        },
        controllableTeams() {
            const { isAuthenticated, player } = useAuthStore();
            if (!isAuthenticated) return [];

            return (this.match?.teams || []).filter(team => [
                ...team.players || [],
                ...team.captains || [],
                ...team.team_staff || [],
                ...team.owners || [],
            ].some(personID => cleanID(player?.id) === cleanID(personID)));
        },
        existingScoreReport() {
            return (ReactiveRoot(this.match?.id, {
                "reports": ReactiveArray("reports", {
                    "team": ReactiveThing("team"),
                    "player": ReactiveThing("player")
                })
            })?.reports || []).find(report => report.type === "Scores" && cleanID(report.match?.[0]) === cleanID(this.match?.id));
        },
        scoreReportingBadge() {
            const { user } = useAuthStore();
            const state = {
                "reports_enabled": this.scoreReportingEnabled,
                "existing_report": !!this.existingScoreReport?.id,
                "is_on_teams": !!this.controllableTeams?.length,
                "is_opponent": this.existingScoreReport?.team?.id ? this.controllableTeams.some(t => cleanID(t.id) !== cleanID(this.existingScoreReport?.team?.id)) : null,
                "is_submitter": this.existingScoreReport?.team?.id ? this.controllableTeams.some(t => cleanID(t.id) === cleanID(this.existingScoreReport?.team?.id)) : null,
                "is_staff": isEventStaffOrHasRole(user, { event: this.match?.event, websiteRoles: ["Can edit any match", "Can edit any event"] })
            };

            return getScoreReportingBadge(state, this.existingScoreReport, this.eventSettings);
        }
    },
    methods: {
        subLink(subLinkURL) {
            return `/match/${this.match.id}/${subLinkURL}`;
        },
        url
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
    head() {
        return {
            title: this.match.name,
            link: [{ rel: "icon", key: "favicon", href: resizedImageNoWrap(this.match?.event?.theme, ["small_logo", "default_logo"], "s-128") }]
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
        border: none;
    }

    .match-sub-nav .list-group-item.active {
        background-color: #333333;
        /*color: #fff !important;*/
        border-color: transparent;
    }

    td.default-thing {
        background-color: rgba(255, 255, 255, 0.185);
    }
    .list-group-item.ct-active {
        color: white;
    }
</style>

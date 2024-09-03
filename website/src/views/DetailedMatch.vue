<template>
    <div class="detailed-match container">
        <div class="main-content row">
            <div class="center-holder col-12 col-md-9 mb-4">
                <div v-if="match.maps && showMatchMaps" class="maps-holder mt-2">
                    <MapDisplay
                        v-for="(map, i) in match.maps"
                        :key="map.id"
                        :i="i"
                        :map="map"
                        :match="match"
                        :theme="_theme"
                        :show-banned-maps="showMapBans" />
                </div>

                <div v-if="match.special_event" class="special-event-notice">
                    <h2>Special event</h2>
                    This is a special event and doesn't have team information.
                </div>

                <div class="team-holder f-row">
                    <div v-for="team in match.teams" :key="team.id" class="team f-col w-50 mt-2">
                        <div :style="theme(team)" class="team-header flex-center f-col default-thing">
                            <div class="team-code">{{ team.code }}</div>
                            <div class="team-overlay-text">{{ team.small_overlay_text }}</div>
                            <div class="team-logo bg-center" :style="icon(team)"></div>
                            <router-link :to="url('team', team, match.event)" class="team-name">{{ team.name }}</router-link>
                        </div>
                        <div v-if="showRosters" class="team-players f-col p-1">
                            <div v-for="player in sortPlayers(showLimitedPlayers(team) ? team.limited_players : team.players)" :key="player.id" class="team-player">
                                <div class="player-info player-name flex-center">
                                    <div v-if="player.role" class="player-role-holder player-icon-holder flex-center">
                                        <div class="player-role" v-html="getRoleSVG(player.role)"></div>
                                    </div>
                                    <component :is="player.limited ? 'div' : 'router-link'" class="ct-active" :to="url('player', player)">{{ player.name }} </component>
                                    <span v-if="showCastingInfo && player.pronouns" class="player-pronouns ml-1 badge rounded-pill bg-light text-dark" :data-pronoun="player.pronouns">{{ player.pronouns }}</span>
                                </div>
                                <div v-if="showCastingInfo" class="player-info player-pronounce"><i class="fas fa-w fa-lips player-icon-holder"></i> {{ player.pronunciation }}</div>
                                <div v-if="showPlayerInfo" class="player-info player-dtag">
                                    <i class="fab fa-fw fa-discord player-icon-holder"></i> <CopyTextButton>{{ player.discord_tag }}</CopyTextButton>
                                </div>
                                <div v-if="showPlayerInfo" class="player-info player-btag">
                                    <i class="fab fa-fw fa-battle-net player-icon-holder"></i> <CopyTextButton>{{ player.battletag }}</CopyTextButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="showManagers" class="team-holder f-row">
                    <div v-for="team in match.teams" :key="team.id" class="team f-col w-50">
                        <div class="team-players team-managers f-col p-1">
                            <div v-for="player in getTeamStaff(team)" :key="player.id" class="team-player">
                                <div class="player-info player-name flex-center">
                                    <div class="player-role-holder player-icon-holder">
                                        <div
                                            v-for="role in player.is"
                                            :key="role"
                                            v-b-tooltip="role"
                                            class="player-role"
                                            v-html="getRoleSVG(role)"></div>
                                        <div v-if="!player.is.length" v-b-tooltip="'Team staff'" class="player-role" v-html="getRoleSVG('Staff')"></div>
                                    </div>
                                    <router-link class="ct-active" :to="url('player', player)">{{ player.name }} <i v-if="player.verified" class="fas fa-badge-check fa-fw" title="REAL"></i></router-link>
                                </div>
                                <div v-if="showPlayerInfo && player.discord_tag" class="player-info player-dtag">
                                    <i class="fab fa-fw fa-discord player-icon-holder"></i> <CopyTextButton>{{ player.discord_tag }}</CopyTextButton>
                                </div>
                                <div v-if="showPlayerInfo && player.battletag" class="player-info player-btag">
                                    <i class="fab fa-fw fa-battle-net player-icon-holder"></i> <CopyTextButton>{{ player.battletag }}</CopyTextButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="showMatchHistory" class="prev-matches-holder d-flex flex-column">
                    <!--                    <div class="team-prev-wrapper w-50" v-for="team in match.teams" :key="team.id">-->
                    <!--                        <PreviousMatch v-for="match in teamMatches(team)" :match="match" :team="team" :key="match.id" />-->
                    <!--                    </div>-->
                    <div v-for="([groupKey, group]) in teamsMatchGroups" :key="groupKey" class="match-group d-flex flex-column">
                        <div v-if="groupKey && groupKey !== 'undefined'" class="match-group-title mt-2 text-center fw-bold">{{ groupKey }}</div>
                        <div class="match-group-teams w-100 d-flex">
                            <div v-for="team in group.teams" :key="team.id" class="team-prev-wrapper w-50">
                                <div v-for="match in team.matches" :key="match.id" class="match-group">
                                    <PreviousMatch :key="match.id" :match="match" :team="team" :show-self-picks="true" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="showMapStats" class="map-stats mt-4">
                    <h2>Map stats</h2>
                    <MatchStats :match="match" :hide-map-display="true" />
                </div>

                <bracket-implications
                    v-if="showImplications && match.brackets"
                    class="bracket-implications mt-4"
                    :match="match"
                    link-to-detailed-match />

                <div v-if="showShowNotes && anyShowNotes" class="show-notes mt-2">
                    <h2 class="text-center">Show notes</h2>
                    <Markdown class="p-1 px-2 bg-dark rounded" :markdown="match.show_notes" />
                    <div v-if="teamShowNotes" class="team-notes d-flex gap-2 mt-2">
                        <div v-for="team in match.teams" :key="team.id" class="team-note w-50">
                            <div v-if="team.show_notes">
                                <h3 class="text-center">{{ team.name }}</h3>
                                <Markdown class="p-1 px-2 bg-dark rounded" :markdown="team.show_notes" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="right-holder col-12 col-md-3">
                <router-link v-if="match.event" :to="url('event', match.event)">
                    <ThemeLogo class="top-right-logo mb-2" logo-size="w-200" :theme="_theme" border-width="8" />
                </router-link>
                <div class="info-block gap-2 d-flex flex-column mb-2 mt-2">
                    <router-link
                        :to="`/match/${match.id}`"
                        class="btn btn-block border-transparent btn-primary text-dark-low"
                        :style="theme(match.event)">
                        <i class="fa-fw fas fa-external-link"></i>
                        See match page
                    </router-link>
                    <router-link
                        v-if="matchEditable"
                        :to="`/match/${match.id}/editor`"
                        class="btn btn-block border-transparent btn-primary text-dark-low"
                        :style="theme(match.event)">
                        <i class="fa-fw fas fa-pencil"></i>
                        Match editor
                    </router-link>

                    <div :class="`mt-2 btn btn-block btn-${showRosters ? 'light' : 'secondary'}`" @click="showRosters = !showRosters">
                        <i class="fa-fw fas fa-users"></i> Rosters
                    </div>
                    <div
                        :class="`mb-2 btn btn-block btn-${showManagers ? 'light' : 'secondary'}`"
                        @click="showManagers = !showManagers">
                        <i class="fa-fw fas fa-user-tie"></i>
                        Team staff
                    </div>
                    <div
                        v-if="showRosters || showManagers"
                        :class="`btn btn-block btn-${showCastingInfo ? 'light' : 'secondary'}`"
                        @click="showCastingInfo = !showCastingInfo">
                        <i class="fa-fw fas fa-headset"></i>
                        Casting info
                    </div>
                    <div
                        v-if="showRosters || showManagers"
                        :class="`mb-2 btn btn-block btn-${showPlayerInfo ? 'light' : 'secondary'}`"
                        @click="showPlayerInfo = !showPlayerInfo">
                        <i class="fa-fw far fa-id-card"></i>
                        Contacts
                    </div>
                    <div v-if="match.maps" :class="`btn btn-block btn-${showMatchMaps ? 'light' : 'secondary'}`" @click="showMatchMaps = !showMatchMaps">
                        <i class="fa-fw fas fa-map"></i> Match maps
                    </div>
                    <div v-if="match.maps && showMatchMaps" :class="`btn btn-block mb-2 btn-${showMapBans ? 'light' : 'secondary'}`" @click="showMapBans = !showMapBans">
                        <i class="fa-fw fas fa-ban"></i> Show map bans
                    </div>
                    <div :class="`btn btn-block btn-${showMapStats ? 'light' : 'secondary'}`" @click="showMapStats = !showMapStats">
                        <i class="fa-fw fas fa-abacus"></i> Map stats
                    </div>
                    <div v-if="match.brackets" :class="`btn btn-block btn-${showImplications ? 'light' : 'secondary'}`" @click="showImplications = !showImplications">
                        <i class="fa-fw fas fa-sitemap"></i> Bracket implications
                    </div>
                    <div
                        :class="`btn btn-block btn-${showMatchHistory ? 'light' : 'secondary'}`"
                        @click="showMatchHistory = !showMatchHistory">
                        <i class="fa-fw fas fa-history"></i>
                        Match history
                    </div>
                    <div
                        v-if="showMatchHistory"
                        :class="`btn btn-block btn-${showNonEventMatches ? 'light' : 'secondary'}`"
                        title="Show/hide past matches that aren't from this match's event"
                        @click="showNonEventMatches = !showNonEventMatches">
                        <i class="fa-fw far fa-calendar-alt"></i>
                        Show non-event matches
                    </div>
                    <div
                        v-if="anyShowNotes"
                        :class="`btn btn-block btn-${showShowNotes ? 'light' : 'secondary'}`"
                        @click="showShowNotes = !showShowNotes">
                        <i class="fa-fw far fa-file-video"></i>
                        Show notes
                    </div>
                    <!--                    <div :class="`btn btn-block btn-${showVod ? 'light' : 'secondary'}`" v-if="match.vod"-->
                    <!--                         v-on:click="showVod = !showVod">-->
                    <!--                        <i class="fa-fw far fa-desktop-alt"></i> Toggle VOD-->
                    <!--                    </div>-->
                    <!--
                    <div :class="`btn btn-block btn-secondary`" v-if="!mapData"
                         v-on:click="loadMapData(match.id)">
                        <i class="fa-fw far fa-sort-numeric-down"></i>
                        Load map data
                    </div>
                    -->
                </div>
                <div class="info-block">
                    <stat :match="match" data="custom_name">Custom match name</stat>
                    <stat :match="match" data="match_number">Match number</stat>
                    <stat :match="match" data="casters" :players="true">{{ match?.casters?.length === 1 ? 'Caster' : 'Casters' }}</stat>
                    <stat :match="match" data="sub_event">Sub Event</stat>
                    <stat :match="match" data="start" :time="true">Scheduled start time</stat>
                    <stat :match="match" data="vod" :external-link="true">VOD Link</stat>
                    <stat :match="match" data="clean_feed" :external-link="true">Clean Feed</stat>
                    <stat :match="match" data="first_to">First to</stat>
                    <stat
                        v-for="relGroup in playerRelationshipGroups"
                        :key="relGroup.meta.singular_name"
                        :override="relGroup.items"
                        :players="true"
                        :show-tally="relGroup.meta.singular_name === 'Observer'">
                        {{ relGroup.items.length === 1 ? relGroup.meta.singular_name : relGroup.meta.plural_name }}
                    </stat>
                    <stat :match="match" data="replay_codes" :raw="true" :format="(t) => t[0].replace(/\n/g, '<br>')">Replay codes</stat>
                    <stat :match="match">
                        Match Thumbnails
                        <template #content>
                            <a class="ct-active" :href="matchThumbnailURL(match, 720)" rel="nofollow" target="_blank">720p</a>,
                            <a class="ct-active" :href="matchThumbnailURL(match, 1080)" rel="nofollow" target="_blank">1080p</a>
                        </template>
                    </stat>
                    <CreditCreator :id="id" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import MapDisplay from "@/components/website/match/MapDisplay";
import { getRoleSVG, url } from "@/utils/content-utils";
import { logoBackground1 } from "@/utils/theme-styles";
import ThemeLogo from "@/components/website/ThemeLogo";
import PreviousMatch from "@/components/website/match/PreviousMatch";
import DetailedMatchStat from "@/components/website/match/DetailedMatchStat";
import Markdown from "@/components/website/Markdown";
import { resizedImage, resizedImageNoWrap } from "@/utils/images";
import CopyTextButton from "@/components/website/CopyTextButton";
import BracketImplications from "@/components/website/dashboard/BracketImplications.vue";
import { getDataServerAddress } from "@/utils/fetch";
import { canEditMatch } from "@/utils/client-action-permissions";
import MatchStats from "@/views/sub-views/MatchStats.vue";
import { useAuthStore } from "@/stores/authStore";
import CreditCreator from "@/components/website/CreditCreator.vue";

export default {
    name: "DetailedMatch",
    components: { CreditCreator, MatchStats, BracketImplications, CopyTextButton, Markdown, PreviousMatch, ThemeLogo, MapDisplay, stat: DetailedMatchStat },
    props: ["id"],
    data: () => ({
        showPlayerInfo: false,
        showCastingInfo: false,
        showMatchHistory: true,
        showNonEventMatches: false,
        showShowNotes: true,
        showRosters: true,
        showMatchMaps: true,
        showMapBans: true,
        showVod: false,
        showMapStats: false,

        showManagers: false,
        showImplications: true
    }),
    computed: {
        match () {
            return ReactiveRoot(this.id, {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme"),
                    players: ReactiveArray("players"),
                    captains: ReactiveArray("captains"),
                    owners: ReactiveArray("owners"),
                    matches: ReactiveArray("matches", {
                        event: ReactiveThing("event"),
                        teams: ReactiveArray("teams", {
                            theme: ReactiveThing("theme")
                        }),
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
                        })
                    }),
                    staff: ReactiveArray("staff")
                }),
                event: ReactiveThing("event", {
                    theme: ReactiveThing("theme")
                }),
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
                casters: ReactiveArray("casters"),
                player_relationships: ReactiveArray("player_relationships", {
                    player: ReactiveThing("player", {
                        clients: ReactiveArray("clients")
                    })
                })
            });
        },
        teamsMatchGroups() {
            const groups = {};
            (this.match?.teams || []).forEach((team, i) => {
                const matches = this.teamMatches(team);
                matches.forEach(match => {
                    if (!groups[match.sub_event]) {
                        groups[match.sub_event] = {
                            teams: [...this.match.teams].map(t => ({
                                code: t.code,
                                id: t.id,
                                theme: t.theme,
                                matches: []
                            })),
                            earliest: null
                        };
                    }
                    const group = groups[match.sub_event];
                    group.teams?.[i]?.matches.push(match);

                    if (!group.earliest) {
                        group.earliest = match.start;
                    } else if (match.start && new Date(group.earliest) > new Date(match.start)) {
                        group.earliest = match.start;
                    }
                });
            });
            return Object.entries(groups).sort(([aSubEvent, aData], [bSubEvent, bData]) => {
                return bData.earliest - aData.earliest;
            });
        },
        _theme() {
            return this.match?.event?.theme;
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
        matchEditable() {
            const { isAuthenticated, player } = useAuthStore();
            if (!isAuthenticated) return false;
            return canEditMatch(player, { event: this.match?.event, match: this.match });
        },
        anyShowNotes() {
            return !!this.match?.show_notes || this.teamShowNotes;
        },
        teamShowNotes() {
            return (this.match?.teams || []).some(t => !!t.show_notes);
        }
    },
    methods: {
        url,
        icon(team) {
            return resizedImage(team.theme, ["default_logo", "small_logo"], "h-60");
        },
        theme(team) {
            return logoBackground1(team);
        },
        getRoleSVG,
        teamMatches(team) {
            if (this.showNonEventMatches) return team?.matches || [];
            return (team?.matches || []).filter(m => {
                return m.event?.id === this.match?.event?.id;
            });
        },
        sortPlayers(players) {
            if (!players?.length) return [];
            return players.sort((a, b) => {
                if (a.role !== b.role) {
                    const order = ["Tank", "DPS", "Support"];
                    return order.indexOf(a.role) - order.indexOf(b.role);
                }
                return 0;
            });
        },
        teamMatchGroups(team) {
            const matches = this.teamMatches(team);
            const groups = {};
            matches.forEach(match => {
                if (!groups[match.sub_event]) {
                    groups[match.sub_event] = {
                        items: [],
                        earliest: null
                    };
                }
                const group = groups[match.sub_event];
                group.items.push(match);

                if (group.earliest < match.start) group.earliest = match.start;
            });
            return Object.entries(groups).sort(([aSubEvent, aData], [bSubEvent, bData]) => {
                return bData.earliest - aData.earliest;
            });
        },
        getTeamStaff(team) {
            const people = [
                ...(team.owners || []),
                ...(team.captains || []),
                ...(team.staff || [])
            ].filter((person, position, array) => array.findIndex(p => p.id === person.id) === position);
            console.log({ people });
            return people.map(person => {
                const roles = [];

                if ((team.owners || []).find(x => x.id === person.id)) roles.push("Owner");
                if ((team.captains || []).find(x => x.id === person.id)) roles.push("Captain");
                if ((team.staff || []).find(x => x.id === person.id) && person.staff_role) {
                    roles.push(person.staff_role);
                }

                return {
                    ...person,
                    is: roles
                };
            });
        },
        showLimitedPlayers(team) {
            return ((team.players || [])?.length === 0) && (team.limited_players || []).length !== 0;
        },
        matchThumbnailURL(match, size) {
            const dataServerURL = getDataServerAddress();
            return `${dataServerURL}/match.png?id=${match.id}&size=${size || "720"}&padding=30`;
        }
    },
    head() {
        return {
            title: this.match ? (this.match.custom_name || this.match.name) + " | Detailed view" : "Detailed match view",
            link: [{ rel: "icon", key: "favicon", href: resizedImageNoWrap(this._theme, ["small_logo", "default_logo"], "s-128") }]
        };
    }
};
</script>

<style scoped>
    .maps-holder {
        display: flex;
        justify-content: center;
    }


    .team-header {
        font-size: 20px;
        padding: 8px 4px;
        text-align: center;
        font-weight: bold;
        border-bottom-width: 4px;
        border-bottom-style: solid;
        position: relative;
    }
    .team-logo {
        width: 90%;
        height: 50px;
    }
    .team-code {
        position: absolute;
        right: 0;
        top: 0;
        padding: 2px 10px;
    }
    .team-overlay-text {
        position: absolute;
        left: 0;
        top: 0;
        padding: 2px 10px;
    }
    .team-player {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        flex-wrap: wrap;
    }
    .team:nth-of-type(2) .team-code { left: 0; right: auto; }
    .team:nth-of-type(2) .team-overlay-text { left: auto; right: 0; }

    .player-info.player-name {
        font-weight: bold;
    }

    .player-pronouns {
        background: #fff194 !important;
    }
    .player-pronouns[data-pronoun="he/him"] {
        background: #f8f9fa !important;
    }
    .player-pronouns[data-pronoun="they/them"] {
        background: #96ff94 !important;
    }
    .player-pronouns[data-pronoun="she/her"] {
        background: #ffbe80 !important;
    }
    .team-player {
        margin-bottom: 4px;
    }

    .info-block .btn {
        position: relative;
        padding-left: calc(.75rem + 14px);
    }
    .info-block i {
        position: absolute;
        left: 0;
        margin: 4px 7px;
    }
    .top-right-logo {
        width: 100%;
        height: 140px;
    }
    .team-name {
        color: inherit !important;
    }
    .maps-holder {
        align-items: flex-start;
    }
    .player-role {
        height: 1em;
        width: 1em;
        color: white;
        display: inline-flex;
    }

    .player-icon-holder {width: 1.5em;}
    .btn-primary.text-dark-low {
        color: #343a40
    }

    a.btn-primary.text-dark-low:focus, a.btn-primary.text-dark-low:hover {
        color: #121416
    }

    .bracket-implications {
        border: 1px solid #454d55;
    }
</style>

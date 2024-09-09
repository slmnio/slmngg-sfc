<template>
    <GenericOverlay
        class="roster-overlay"
        :title="title || 'Rosters'"
        body-color="transparent !important"
        no-bottom="true"
        no-bottom-animate="true">
        <div v-for="(team, i) in teams" :key="team.id" class="team">
            <ThemeTransition
                :border-width="0"
                :theme="team.theme"
                :active="animationActive"
                :left="i === 0"
                :starting-delay="200"
                :inner-delay="200"
                :duration="600"
                :one-color="true">
                <div class="team-inner" :style="{ borderColor: accentColor }">
                    <div class="team-top flex-center" :style="themeColor(team)">
                        <div class="team-name flex-center industry-align">{{ team.name }}</div>
                        <div class="team-icon-holder flex-center">
                            <div class="team-icon bg-center" :style="icon(team)"></div>
                        </div>
                    </div>
                    <div class="team-roster-holder flex-center flex-column overlay--bg w-100" :style="{ fontSize: rosterFontSize(team) }">
                        <div class="team-roster flex-center flex-column">
                            <div
                                v-for="player in teamPlayerGroups(team)[0]"
                                :key="player.id"
                                class="player">
                                <div
                                    v-if="showRoles === 'eligible'"
                                    class="flex-center player-eligible-roles">
                                    <div v-for="role in playerEligibleRoles(player)" :key="role" class="player-role flex-center" v-html="getRoleSVG(role)"></div>
                                </div>
                                <div
                                    v-else-if="showRoles && (player?.this_event_signup_data?.main_role || player.role)"
                                    class="player-role flex-center"
                                    v-html="getRoleSVG(player?.this_event_signup_data?.main_role || player.role)"></div>

                                <span class="player-name">{{ player.name }}</span>
                                <div v-if="showBadges && getHighlightEventTeam(player)" class="player-badge">
                                    <ThemeLogo class="badge-logo" :theme="getHighlightEventTeam(player) && getHighlightEventTeam(player).theme" icon-padding="0.2em" logo-size="w-100" />
                                </div>
                            </div>
                        </div>
                        <div v-if="teamPlayerGroups(team)[1] && teamPlayerGroups(team)[1].length" class="team-roster team-sub-roster flex-center flex-column">
                            <div
                                v-for="player in teamPlayerGroups(team)[1]"
                                :key="player.id"
                                class="player">
                                <div
                                    v-if="showRoles && player.role"
                                    class="player-role flex-center"
                                    v-html="getRoleSVG(player.role)"></div>
                                <span class="player-name">{{ player.name }}</span>
                                <div v-if="showBadges && getHighlightEventTeam(player)" class="player-badge">
                                    <ThemeLogo class="badge-logo" :theme="getHighlightEventTeam(player) && getHighlightEventTeam(player).theme" icon-padding="0.2em" logo-size="w-100" />
                                </div>
                            </div>
                        </div>
                        <div v-if="showStaff" class="team-roster team-staff-roster flex-center flex-column">
                            <div class="staff-text d-none">Staff</div>
                            <div
                                v-for="player in getTeamStaff(team)"
                                :key="player.id"
                                class="player">
                                <div v-if="player.staff_role || player.role" class="player-role flex-center" v-html="getRoleSVG(player.staff_role || player.role)"></div>
                                <span class="player-name">{{ player.name }}</span>
                                <div v-if="showBadges && getHighlightEventTeam(player)" class="player-badge">
                                    <ThemeLogo class="badge-logo" :theme="getHighlightEventTeam(player) && getHighlightEventTeam(player).theme" icon-padding="0.2em" logo-size="w-100" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ThemeTransition>
        </div>
    </GenericOverlay>
</template>

<script>
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { decoratePlayerWithDraftData, getRoleSVG } from "@/utils/content-utils";
import { resizedImage } from "@/utils/images";
import ThemeTransition from "@/components/broadcast/ThemeTransition";
import ThemeLogo from "@/components/website/ThemeLogo";
import { sortRoles } from "@/utils/sorts";

export default {
    name: "RosterOverlay",
    components: { ThemeTransition, GenericOverlay, ThemeLogo },
    props: ["broadcast", "title", "showRoles", "sort", "animationActive", "showStaff", "splitPlayers", "showBadges", "virtualMatch"],
    computed: {
        accentColor() {
            return this.$root?.broadcast?.event?.theme?.color_theme;
        },
        match() {
            if (this.virtualMatch) return this.virtualMatch;
            if (!this.broadcast?.live_match) return null;
            return ReactiveRoot(this.broadcast.live_match[0], {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme"),
                    players: ReactiveArray("players", {
                        "signup_data": ReactiveArray("signup_data")
                    }),
                    staff: ReactiveArray("staff")
                }),
                "event": ReactiveThing("event")
            });
        },
        teams() {
            if (!this.match) return [];
            return (this.match.teams || []).map(team => {
                team.showLimitedPlayers = ((team.players || [])?.length === 0) && (team.limited_players || []).length !== 0;
                team.showablePlayers = team.showLimitedPlayers ? team.limited_players : (team.players || []).map(p => decoratePlayerWithDraftData(p, this.match?.event?.id || this.$root?.broadcast?.event?.id));
                return team;
            });
        },
        highlight_event() {
            const eventID = this.broadcast?.highlight_event?.[0];
            if (!eventID) return null;
            return ReactiveRoot(eventID, {
                theme: ReactiveThing("theme"),
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme"),
                    players: ReactiveArray("players", {
                        "signup_data": ReactiveArray("signup_data")
                    }),
                    captains: ReactiveArray("captains")
                })
            });
        }
    },
    methods: {
        themeColor(team) {
            if (!team.theme) return {};
            return {
                backgroundColor: team.theme.color_logo_background || team.theme.color_theme,
                borderColor: team.theme.color_logo_accent || team.theme.color_accent,
                color: team.theme.color_text_on_logo_background || team.theme.color_text_on_theme
            };
        },
        icon(team) {
            if (!team.theme) return {};
            return resizedImage(team.theme, ["default_logo", "default_wordmark"], "h-250");
        },
        rosterFontSize(team) {
            const players = team?.showablePlayers?.length;
            if (!players) return "";

            function clamp(number, min, max) {
                return Math.max(min, Math.min(number, max));
            }
            return clamp(350 / players, 16, 64) + "px";
        },
        sortedTeamPlayers(team) {
            if (!team?.showablePlayers) return [];
            try {
                const order = ["Tank", "DPS", "Support", "Flex"];
                const players = [...team.showablePlayers];

                return players.sort((a, b) => {
                    const [oa, ob] = [a, b].map(x => order.indexOf(x.role));
                    if (oa === ob) return 0;
                    if (oa === -1) return 1;
                    if (ob === -1) return -1;
                    return oa - ob;
                });
            } catch (e) {
                return team.showablePlayers;
            }
        },
        teamPlayerGroups(team) {
            const players = (this.sort ? this.sortedTeamPlayers(team) : team.showablePlayers) || [];
            if (this.splitPlayers) {
                // group of 0 to splitPlayers
                // group of excess
                return [
                    players.slice(0, this.splitPlayers),
                    players.slice(this.splitPlayers)
                ];
            } else {
                return [players, []];
            }
        },
        getTeamStaff(team) {
            return team.staff;
        },
        getRoleSVG,
        getHighlightEventTeam(player) {
            if (!this.highlight_event?.teams?.length) return null;
            return this.highlight_event.teams.find(team => (team.players || []).find(p => p.id === player.id) || (team.captains || []).find(p => p.id === player.id));
        },
        playerEligibleRoles(player) {
            return (player?.this_event_signup_data?.eligible_roles || player.eligible_roles || []).sort(sortRoles);
        }
    },
    head() {
        return {
            title: `Rosters | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

<style scoped>
.team {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    /*background: #222;*/
}

.team:first-child {
    margin-right: 20px;
}

.team:last-child {
    margin-left: 20px;
}

.team-top {
    font-size: 64px;
    height: 3em;
    width: 100%;
    border-bottom: 8px solid transparent;
    flex-shrink: 0;
}
.team-name {
    line-height: 1;
    text-align: center;
    font-weight: bold;
    flex-grow: 1;
    z-index: 1;
    padding: 0 20px;
}

.team-roster, .team-roster-holder {
    flex-grow: 1;
}
.team-icon-holder {
    /*width: 2em;*/
    /*height: 2em;*/
    flex-shrink: 0;
    opacity: 0.2;
    top: 0;
    overflow: hidden;
}
.team-icon {
    --pad: 0px;
    width:  calc(100% - var(--pad));
    height: calc(100% - var(--pad));
    background-size: cover;
    filter: blur(6px)
}


.team-name, .team-icon-holder {
    position: absolute;
    width: 100%;
    height: 100%;
}

.team-top {
    position: relative;
}

.player {
    transform: var(--overlay-line-height-adjust, translate(0, -0.0925em));
}


.player-eligible-roles {
    height: 1em;
    margin-right: .2em;
}
.player-role {
    height: 1em;
    width: 1em;
    margin-right: .2em;
}
.player-eligible-roles .player-role {
    margin-right: 0;
}
.player-role:deep(i) {
     font-size: .75em;
 }

.player {
    display: flex;
    justify-content: center;
    align-items: center;
}
.team-inner {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: #222;
    color: white;
    border-bottom: 8px solid transparent;
}

.team-staff-roster {font-size: .75em;}

.player-badge .badge-logo {
    width: 1.2em;
    height: 1em;
    border-bottom-width: .15em !important;
    margin-left: .4em;
}
</style>

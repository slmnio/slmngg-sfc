<template>
    <div class="draft-overlay">
        <div class="draft d-flex w-100 h-100">
            <div v-if="roleColumns" class="available-players role-columns">
                <ThemeLogo
                    v-if="event && event.theme"
                    class="event-logo"
                    :theme="event.theme"
                    border-width="6px"
                    logo-size="w-500"
                    icon-padding="24px" />
                <div class="title" :style="background">{{ title || 'DRAFTABLE PLAYERS' }}</div>
                <div class="available-role-columns">
                    <div v-for="(players, i) in roleGroupedPlayers" :key="i" class="role-column">
                        <transition-group class="players-transition" name="draftable" tag="div">
                            <DraftPlayer
                                v-for="player in players"
                                :key="player.id"
                                :style="draftPlayerStyle"
                                :player="player"
                                :theme="event.theme"
                                :show-icon="icons"
                                :badge="useHighlightEventBadges && getHighlightEventTeam(player)" />
                        </transition-group>
                    </div>
                </div>
            </div>
            <div v-else class="available-players">
                <ThemeLogo
                    v-if="event && event.theme"
                    class="event-logo"
                    :theme="event.theme"
                    border-width="6px"
                    logo-size="w-500"
                    icon-padding="24px" />
                <div class="title" :style="background">{{ title || 'DRAFTABLE PLAYERS' }}</div>
                <!--<div class="player" v-for="player in availablePlayers" :key="player.id">
                    {{ player.name }}
                </div>-->
                <transition-group class="players-transition" name="draftable" tag="div">
                    <DraftPlayer
                        v-for="player in availablePlayers"
                        :key="player.id"
                        :style="draftPlayerStyle"
                        :player="player"
                        :theme="event.theme"
                        :show-icon="icons"
                        :badge="useHighlightEventBadges && getHighlightEventTeam(player)" />
                </transition-group>
            </div>
            <div class="teams d-flex">
                <div v-for="(row, rowI) in draftRows" :key="rowI" class="team-row">
                    <div v-for="team in row" :key="team.id" class="team flex-grow-1">
                        <DraftTeam class="team-top" :class="{'team-bottom-border': !showStaff}" :show-logo="showLogos" :team="team" />
                        <div v-if="showStaff" class="team-staff-list default-thing" :style="logoBackground1(team)">
                            <div v-for="staff in getTeamStaff(team)" :key="staff.id" class="team-staff">
                                {{ staff.name }}
                            </div>
                        </div>
                        <transition-group name="player" class="team-players" tag="div">
                            <DraftPlayer
                                v-for="(player, pI) in insertDummies(team.players)"
                                :key="player.id"
                                class="drafted-player"
                                :player="player"
                                :theme="event.theme"
                                :show-icon="icons"
                                :highlight="team.id === highlightPlace?.team && pI === highlightPlace?.player"
                                :data-team-id="team.id"
                                :data-pi="pI"
                                :badge="useHighlightEventBadges && getHighlightEventTeam(player)" />
                        </transition-group>
                    </div>
                </div>
            </div>
        </div>

        <div class="theme-bar" :style="{backgroundColor: accentColor}"></div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import DraftTeam from "@/components/broadcast/DraftTeam";
import DraftPlayer from "@/components/broadcast/DraftPlayer";
import { logoBackground, logoBackground1 } from "@/utils/theme-styles";
import ThemeLogo from "@/components/website/ThemeLogo";
import { decoratePlayerWithDraftData } from "@/utils/content-utils";
import { ROLE_ORDER } from "@/utils/sorts";

export default {
    name: "DraftOverlay",
    components: { ThemeLogo, DraftTeam, DraftPlayer },
    props: ["title", "broadcast", "bracketKey", "columns", "icons", "showStaff", "teamRows", "eachTeam", "showLogos", "category", "roleColumns", "highlightOrder"],
    data: () => ({
        dummy: false
    }),
    computed: {
        event() {
            if (!this.broadcast?.event) return null;
            return ReactiveRoot(this.broadcast.event.id, {
                theme: ReactiveThing("theme"),
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme"),
                    staff: ReactiveArray("staff"),
                    players: ReactiveArray("players", {
                        signup_data: ReactiveArray("signup_data")
                    }),
                    captains: ReactiveArray("captains")
                }),
                draftable_players: ReactiveArray("draftable_players", {
                    signup_data: ReactiveArray("signup_data")
                })
            });
        },
        highlight_event() {
            if (!this.broadcast?.highlight_event) return null;
            return ReactiveRoot(this.broadcast.highlight_event?.[0], {
                theme: ReactiveThing("theme"),
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme"),
                    players: ReactiveArray("players"),
                    captains: ReactiveArray("captains")
                })
            });
        },
        useHighlightEventBadges() {
            return (this.broadcast?.broadcast_settings || []).includes("Use highlight event team badges");
        },
        game() {
            return this.event?.game || "Overwatch";
        },
        background() {
            if (!this.event?.theme) return null;
            return logoBackground(this.event.theme);
        },
        accentColor() {
            if (!this.event?.theme) return null;
            return this.event.theme.color_theme;
        },
        availablePlayers() {
            if (!this.event?.draftable_players) return [];
            // if (this.dummy) {
            //     players.unshift({ name: "Solomon", id: "x" });
            // };
            return this.event.draftable_players.filter(player => {
                for (const team of (this.event?.teams || [])) {
                    if ((team.players || []).find(p => p.id === player.id)) {
                        return false;
                    }
                }
                if (!player.name) return false;
                return true;
            }).map(_p => {
                let player = decoratePlayerWithDraftData(_p, this.event?.id);
                // attempt to get SR
                if (this.useHighlightEventBadges) {
                    // get team from highlight event
                    player._highlight_team = this.getHighlightEventTeam(player) || null;
                }
                return player;
            }).sort((a, b) => {
                if (this.game === "Valorant") {
                    return this.sortValorant(a, b);
                }

                if (!a.role) return 1; if (!b.role) return -1;
                if (a.role !== b.role) {
                    const order = ROLE_ORDER;
                    return order.indexOf(a.role) - order.indexOf(b.role);
                }

                if (!a.rating) return 1; if (!b.rating) return -1;
                return b.rating.level - a.rating.level;
            });
        },
        roleGroupedPlayers() {
            if (!this.availablePlayers) return [];
            const groups = {};
            this.availablePlayers.forEach(player => {
                const role = player?._draftData?.role || player?.role;
                if (!groups[role]) groups[role] = [];
                groups[role].push(player);
            });
            console.log(groups);
            return Object.values(groups);
        },
        draftTeams() {
            if (!this.event?.teams) return [];
            let teams = this.event.teams.filter(team => team.draft_order !== undefined).sort((a, b) => a.draft_order - b.draft_order);
            if (this.category) teams = teams.filter(t => !this.category || (t.team_category?.includes(";") ? t.team_category.split(";")[1] : t.team_category) === this.category);
            return teams.map(t => {
                t.players = (t.players || []).map(p => decoratePlayerWithDraftData(p, this.event?.id));
                return t;
            });
        },
        draftRows() {
            if (!this.draftTeams) return [];
            const rows = [];

            const chunkSize = this.draftTeams.length / this.teamRows;

            this.draftTeams.forEach((team, i) => {
                const group = Math.ceil((i + 1) / chunkSize) - 1;
                if (!rows[group]) rows[group] = [];
                rows[group].push(team);
            });
            return rows;
        },
        draftPlayerStyle() {
            return {
                width: `calc(100% / ${this.columns})`
            };
        },
        highlightPlace() {
            if (!this.highlightOrder) return null;
            const teams = [...this.draftTeams];
            if (!teams.length) return null;

            if (this.highlightOrder === "straight") {
                let team = teams.sort((a,b) => (a.players || []).length - (b.players || []).length)?.[0];
                if (!team) return null;
                return {
                    team: team.id,
                    player: (team.players || []).length
                };
            }
            if (this.highlightOrder === "snake" || this.highlightOrder === "snake-offset") {
                let sortedTeams = teams.map((t, i) => ({ team: t, index: i })).sort((a,b) => {
                    if (a.team?.players?.length > b.team?.players?.length) return 1;
                    if (a.team?.players?.length < b.team?.players?.length) return 1;

                    if (a.index > b.index) return 1;
                    if (a.index < b.index) return 1;

                    return 0;
                }).map(t => t.team);

                const minPlayers = Math.min(...sortedTeams.map(t => (t.players || []).length));
                const teamsNotDraftedThisRound = sortedTeams.filter(t => (t.players || []).length === minPlayers);

                const forwards = this.highlightOrder === "snake" ? (minPlayers % 2 === 0) : (minPlayers % 2 === 1);

                const team = teamsNotDraftedThisRound?.[forwards ? 0 : (teamsNotDraftedThisRound.length - 1)];

                if (!team) return null;
                return {
                    team: team.id,
                    player: (team.players || []).length
                };
            }
            return { team: null, player: null };
        }
    },
    methods: {
        insertDummies(players = []) {
            if (!this.eachTeam) return players;
            const dummyRecord = { dummy: true };
            const dummiedPlayers = [];

            const nonSortedPlayers = players.filter(p => !p.draft_position);
            const sortedPlayers = players.filter(p => p.draft_position);
            for (let i = 1; i <= this.eachTeam; i++) {
                const playerAtIndex = sortedPlayers.find(p => p.draft_position === i);
                if (playerAtIndex) {
                    dummiedPlayers.push({ ...playerAtIndex, forceIndex: true });
                } else {
                    if (nonSortedPlayers.length) {
                        dummiedPlayers.push(nonSortedPlayers.shift());
                    } else {
                        dummiedPlayers.push({ ...dummyRecord, id: `dummy-${i}`, name: i });
                    }
                }
            }
            nonSortedPlayers.forEach(p => dummiedPlayers.push(p));
            // return this.team.players;
            return dummiedPlayers;
        },
        logoBackground1,
        getTeamStaff(team) {
            const staff = [];
            if (team.captains) {
                team.captains.forEach(person => {
                    console.log(staff, person);
                    if (!staff.find(s => s.id === person.id)) staff.push(person);
                });
            }
            if (team.staff) {
                team.staff.forEach(person => {
                    if (!staff.find(s => s.id === person.id)) staff.push(person);
                });
            }
            console.log(staff, team);
            return staff;
        },
        fixData(rank) {
            return (rank || "").replace("Plat ", "Platinum ").replace("Immortal+", "Immortal");
        },
        sortRankingSystem(ranks, aRank, bRank) {
            aRank = this.fixData(aRank).trim().split(" ");
            bRank = this.fixData(bRank).trim().split(" ");

            // lowest in system: [0] -> [1] -> ... -> highest in system
            let diff = ranks.indexOf(bRank[0]) - ranks.indexOf(aRank[0]);
            // console.log(aRank, bRank, diff);

            if (diff === 0 && aRank.length === 2 && bRank.length === 2) {
                // lowest in rank:  1 -> 2 -> 3  :highest in rank
                diff = parseInt(bRank[1]) - parseInt(aRank[1]);
            }
            return diff;
        },
        sortValorant(a, b) {
            const ranks = [
                "Unranked",
                "Iron",
                "Bronze",
                "Silver",
                "Gold",
                "Platinum",
                "Diamond",
                "Immortal",
                "Ascendant",
                "Radiant"
            ];
            // sort by highest, then break with current
            if (!a._draftData || !b._draftData) return 0;

            let diff = this.sortRankingSystem(ranks, a._draftData.highest_rank, b._draftData.highest_rank);
            if (diff === 0) {
                diff = this.sortRankingSystem(ranks, a._draftData.current_rank, b._draftData.current_rank);
            }
            // console.log(a.name, b.name, diff);
            return diff;
        },
        getHighlightEventTeam(player) {
            if (!this.highlight_event?.teams?.length) return null;
            return this.highlight_event.teams.find(team => (team.players || []).find(p => p.id === player.id) || (team.captains || []).find(p => p.id === player.id));
        }
    },
    mounted() {
        setInterval(() => {
            this.dummy = !this.dummy;
        }, 2500);
    },
    head() {
        return {
            title: `Draft | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

<style scoped>
    .draft-overlay {
        width: 100vw;
        height: 100vh;
        position: absolute;
        left: 0;
        top: 0;
        padding: 2em;
        padding-bottom: calc(2em + 12px);
        background: #111;
        color: #eee;
        font-family: "SLMN-Industry", "Industry", sans-serif;
        overflow: hidden;
        --players-width: 25%;
    }
    .available-players {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        height: 0;
        position: relative;
    }
    .players-transition {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        height: 0;
        /*display: inline-block;*/
    }
    .draft-player {
        width: 224px;
        max-height: 2em;
    }
    .available-players .title {
        border-bottom: 2px solid transparent;
        text-align: center;
        font-size: 32px;
        font-weight: bold;
        width: 100%;
        margin: 0 0 8px;
        padding: 2px 8px;
        width: calc(100%);
        text-transform: uppercase;
    }

    .team {
        width: 0;
        flex-grow: 1;
        flex-shrink: 0;
        margin-right: 2px;
    }
    .team + .team {
        border-left: 1px solid #333;
        padding-left: 2px;
    }


    .available-players {
        width: var(--players-width);
    }
    .teams {
        width: calc(100% - var(--players-width));
        margin-left: 2em;
    }
    .theme-bar {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 12px;
    }

    .team-staff-list {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 3em;
        margin-top: 4px;
        margin-bottom: 8px;
        flex-wrap: wrap;
        border-bottom-width: 4px;
        border-bottom-style: solid;
        align-content: center;
    }

    .team-staff {
        padding: 0 8px;
        font-weight: bold;
        line-height: 1;
    }
    .drafted-player {
        margin-bottom: 4px;
        font-size: 24px;
        padding: 6px 8px;
        width: 100%;
        max-height: 3em;
    }


    /* the messiest animations ever, fuck vue LOL */

    .draftable-enter-active, .draftable-leave-active {
        transition: all .5s ease;
        /*max-height: 2em;*/
    }

    .draftable-move {
        transition: transform .5s ease;
    }

    .draftable-enter-from {
        max-height: 0;
        padding: 0 8px !important;
        opacity: 0;
    }

    .draftable-leave-to {
        opacity: 0;
    }

    .draftable-leave-active {
        /*display: none;*/
        transition: all .5s ease;
        position: absolute;
        right: 0;
    }

    .player-enter-active, .player-leave-active, .player-move {
        transition: all .5s ease;
        /*transition: none !important;*/
    }
    .player-enter-from, .player-leave-to {
        max-height: 0;
        padding: 0 8px !important;
        opacity: 0;
        border-bottom-width: 0 !important;
        margin-bottom: 0 !important;
    }

    .draft-team-top.team-bottom-border {
        border-bottom: 4px solid transparent;
        margin-bottom: 8px;
    }

    .team-row {
        display: flex;
        width: 100%;
        height: 100%;
    }
    .teams {
        flex-direction: column;
    }
    .event-logo {
        margin-bottom: 8px;
        width: calc(100%) !important;
        height: 200px;
    }

    .available-players.role-columns .title {
        margin: 0 0 8px;
    }
    .available-role-columns {
        display: flex;
        flex-grow: 1;
        width: 100%;
        gap: 4px;
    }
    .role-column {
        flex-shrink: 0;
        flex-grow: 1;
    }

    .role-column .players-transition {
        flex-direction: column;
        flex-wrap: nowrap;
        height: auto !important;
    }

    .available-players.role-columns,
    .available-role-columns,
    .role-column .players-transition {
        height: 100%;
    }

    .role-column .draft-player {
        /*width: 196px;*/
        width: 100%;
        margin: 1px 0;
        font-size: 18px;
        padding: 0 8px;
    }

</style>

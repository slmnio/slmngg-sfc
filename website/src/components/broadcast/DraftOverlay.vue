<template>
    <div class="draft-overlay">
        <div class="draft d-flex w-100 h-100">
            <div class="available-players" :style="leftSize">
                <ThemeLogo class="top-event-logo" :theme="event && event.theme" />
                <div class="title" :style="background">{{ leftHeaderText }}</div>
<!--                <div class="player" v-for="player in availablePlayers" v-bind:key="player.id">-->
<!--                    {{ player.name }}-->
<!--                </div>-->
                <transition-group class="players-transition" name="draftable" :duration="6000">
                    <DraftPlayer v-for="player in availablePlayers" v-bind:key="player.id" :player="player" :theme="event && event.theme" />
                </transition-group>
            </div>
<!--            <div class="teams" :style="teamsLayout">-->
                <transition-group name="fade" class="teams teams-layout-holder" :style="teamsLayout">
                <div class="team" v-for="team in draftTeams" v-bind:key="team.id">
                    <DraftTeam class="team-top" :team="team" :each-team="eachTeam"></DraftTeam>
                    <!-- <div class="team-staff-list" :style="logoBackground1(team)">
                        <div class="team-staff" v-for="staff in team.staff" v-bind:key="staff.id">
                            {{ staff.name }}
                        </div>
                    </div> -->
<!--                    <transition-group name="player" class="team-players" :style="teamLayout">-->
<!--                        <DraftPlayer class="drafted-player" v-for="player in team.players" v-bind:key="player.id" :player="player" :theme="event.theme" />-->
<!--                    </transition-group>-->
                </div>
                </transition-group>
<!--            </div>-->
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


function getSR(player) {
    try {
        if (player.draft_data) {
            const draftData = JSON.parse(player.draft_data);
            try {
                const nextHighestSR = Object.entries(draftData.sr).filter(([role, sr]) => !(role.toLowerCase() === player.role.toLowerCase() || role === "role")).map(e => e[1]).sort((a, b) => b - a)[0];
                console.log(player.name, draftData.sr.role, nextHighestSR, (draftData.sr.role + nextHighestSR) / 2, Math.abs(draftData.sr.role - nextHighestSR));
                // && Math.abs(draftData.sr.role - nextHighestSR) < 500
                if (nextHighestSR && nextHighestSR > draftData.sr.role) return (draftData.sr.role + nextHighestSR) / 2;
            } catch (e) { console.error(e); }

            return draftData.sr.role;
        }
    } catch (e) {
        console.error(e);
        return null;
    }
}
export default {
    name: "DraftOverlay",
    components: { ThemeLogo, DraftTeam, DraftPlayer },
    props: ["broadcast", "bracketKey"],
    data: () => ({
        dummy: false
    }),
    methods: {
        logoBackground1
    },
    computed: {
        event() {
            if (!this.broadcast || !this.broadcast.event) return null;
            return ReactiveRoot(this.broadcast.event[0], {
                theme: ReactiveThing("theme"),
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme"),
                    staff: ReactiveArray("staff"),
                    players: ReactiveArray("players")
                }),
                draftable_players: ReactiveArray("draftable_players")
            });
        },
        background() {
            if (!this.event?.theme) return null;
            return logoBackground(this.event.theme);
        },
        accentColor() {
            if (!this.event || !this.event.theme) return null;
            return this.event.theme.color_theme;
        },
        availablePlayers() {
            if (!this.event?.draftable_players || !this.event?.teams) return [];
            // if (this.dummy) {
            //     players.unshift({ name: "Solomon", id: "x" });
            // };
            return this.event.draftable_players.filter(player => {
                for (const team of this.draftTeams) {
                    if ((team.players || []).find(p => p.id === player.id)) {
                        return false;
                    }
                }
                if (!player.name) return false;
                return true;
            }).map(player => {
                // attempt to get SR
                try {
                    const ow = JSON.parse(player.overwatch_data);

                    if (player.draft_data) {
                        const draftData = JSON.parse(player.draft_data);

                        if (ow && ow.ratings && player.role) {
                            const sr = ow.ratings.find(r => r.role === player.role.toLowerCase())?.level;
                            if (draftData.sr.role && sr) player.sr_err = sr - draftData.sr.role;
                        }
                        return { ...player, rating: { level: draftData.sr.role } };
                    }

                    if (ow && ow.ratings && player.role) {
                        let sr = ow.ratings.find(r => r.role === player.role.toLowerCase())?.level;
                        if (sr) return { ...player, rating: { level: sr, note: "Pulled from their Battletag" } };
                        sr = Math.floor(ow.ratings.reduce((p, c) => p + c.level, 0) / ow.ratings.length);
                        console.log(sr);
                        if (sr) return { ...player, rating: { level: sr, note: "Average of other roles" } };
                    }
                    if (player.manual_sr) {
                        return { ...player, rating: { level: parseInt(player.manual_sr), note: "Manually added" } };
                    }
                } catch (e) {
                    return player;
                }

                return player;
            }).sort((a, b) => {
                if (this.eventSettings?.draft?.left) {
                    if (this.eventSettings.draft.left === "top") {
                        if (!a.rating?.level) return 1; if (!b.rating?.level) return -1;
                        return b.rating.level - a.rating.level;
                    }
                }

                if (!a.role) return 1; if (!b.role) return -1;
                if (a.role !== b.role) {
                    const order = ["Tank", "DPS", "Support"];
                    return order.indexOf(a.role) - order.indexOf(b.role);
                }

                if (!a.rating) return 1; if (!b.rating) return -1;
                return b.rating.level - a.rating.level;
            });
        },
        topHigh() {
            return this.eventSettings?.draft?.left && this.eventSettings.draft.left === "top";
        },
        leftSize() {
            if (!this.topHigh) return {};
            return { width: "230px" };
        },
        eachTeam() {
            return this.eventSettings?.draft?.each_team || null;
        },
        leftHeaderText() {
            if (this.eventSettings?.draft?.left) {
                if (this.eventSettings.draft.left === "top") {
                    return "Top Players";
                }
            }
            return "Draftable Players";
        },
        draftTeams() {
            if (!this.event?.teams) return [];
            return this.event.teams.filter(team => team.draft_order !== undefined).map(team => {
                function teamSR(team) {
                    const SRs = team.players.map(getSR).filter(sr => !!sr).sort((a, b) => b - a).slice(0, 6);
                    const count = SRs.length;
                    console.log(SRs);
                    if (!count) return null;
                    const average = SRs.reduce((prev, current) => prev + current, 0) / count;
                    return Math.floor(average);
                }

                return { ...team, team_sr: teamSR(team) };
            })/* .sort((a, b) => a.draft_order - b.draft_order) */.sort((a, b) => b.team_sr - a.team_sr);
        },
        eventSettings() {
            if (!this.event?.blocks) return null;
            try {
                return JSON.parse(this.event.blocks);
            } catch (e) {
                return null;
            }
        },
        teamsLayout() {
            if (!this.eventSettings?.draft?.rows) return {};
            return {
                "grid-template-columns": `repeat(${Math.ceil(this.draftTeams.length / this.eventSettings.draft.rows)}, 1fr)`
            };
        },
        teamLayout() {
            if (!this.eventSettings?.draft?.rows) return {};
            return {
                "max-height": 100 / this.eventSettings.draft.rows + "%"
            };
        }
    },
    mounted() {
        setInterval(() => {
            this.dummy = !this.dummy;
        }, 2500);
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
        font-family: "Industry", "SLMN-Industry", sans-serif;
        overflow: hidden;
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
        /*width: 224px;*/
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
        /*width: calc(100% - 4px);*/
        text-transform: uppercase;
    }

    .team {
        width: 0;
        min-width: 0;
        min-height: 0;
        flex-grow: 1;
        flex-shrink: 0;
        margin-right: 2px;
    }
    .team + .team {
        /*border-left: 1px solid #333;*/
        /*padding-left: 2px;*/
    }


    .available-players {
        width: 25%;
        flex-shrink: 0;
    }
    .teams {
        width: 75%;
        margin-left: 2em;
    }
    .theme-bar {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 12px;
        background-image: linear-gradient(to right, #2644FF, #20FC8F);
    }

    .team-staff-list {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 3em;
        margin-top: 4px;
        margin-bottom: 8px;
        flex-wrap: wrap;
        border-bottom: 4px solid transparent;
    }

    .team-staff {
        padding: 0 8px;
        font-weight: bold;
        line-height: 1;
        border-bottom: 2px solid transparent;
    }
    .drafted-player {
        margin: 4px 0;
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

    .draftable-enter {
        max-height: 0;
        padding: 0 8px;
        opacity: 0;
    }

    .draftable-leave-to {
        opacity: 0;
    }

    .draftable-leave-active {
        /*display: none;*/
        transition: all .2s ease;
        position: absolute;
        right: 0;
    }

    .player-enter-active, .player-leave-active, .player-move {
        transition: all .5s ease;
    }
    .player-enter, .player-leave-to {
        max-height: 0;
        padding: 0 8px;
        opacity: 0;
    }


    /* new grid */
    .team {
        width: 100%;
        height: 100%;
    }
    .teams {
        display: grid;
        /*grid-template-rows: 1fr 1fr;*/
        /*grid-auto-columns: 1fr;*/
        /*grid-auto-flow: column;*/
        grid-gap: 8px;
        width: 100%;
        /*grid-auto-columns: 200px;*/
        /*grid-auto-columns: 1fr;*/
        /*grid-template-rows: 1fr 1fr;*/
        /*grid-auto-flow: row;*/

        /*grid-template-columns: repeat(9, 1fr);*/


        /*display: grid;*/
        /*grid-template-columns: repeat(3, 1fr);*/
        /*grid-auto-rows: 200px;*/
    }

    .top-event-logo {
        width: 100%;
        height: 200px;
        margin-bottom: 20px;
    }
</style>

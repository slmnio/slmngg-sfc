<template>
    <div class="draft-overlay">
        <div class="draft d-flex w-100 h-100">
            <div class="available-players">
                <div class="title" :style="background">DRAFTABLE PLAYERS</div>
                <!--<div class="player" v-for="player in availablePlayers" v-bind:key="player.id">
                    {{ player.name }}
                </div>-->
                <transition-group class="players-transition" name="draftable">
                    <DraftPlayer v-for="player in availablePlayers" v-bind:key="player.id" :player="player" :theme="event.theme" />
                </transition-group>
            </div>
            <div class="teams d-flex">
                <div class="team flex-grow-1" v-for="team in draftTeams" v-bind:key="team.id">
                    <DraftTeam class="team-top" :team="team"></DraftTeam>
                    <div class="team-staff-list default-thing" :style="logoBackground1(team)">
                        <div class="team-staff" v-for="staff in team.staff" v-bind:key="staff.id">
                            {{ staff.name }}
                        </div>
                    </div>
                    <transition-group name="player" class="team-players">
                        <DraftPlayer class="drafted-player" v-for="player in team.players" v-bind:key="player.id" :player="player" :theme="event.theme" />
                    </transition-group>
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

export default {
    name: "DraftOverlay",
    components: { DraftTeam, DraftPlayer },
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
            return ReactiveRoot(this.broadcast.event.id, {
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
                    if (ow && ow.ratings && player.role) {
                        let sr = ow.ratings.find(r => r.role === player.role.toLowerCase())?.level;
                        if (sr) return { ...player, rating: { level: sr, note: "Pulled from their Battletag" } };
                        sr = Math.floor(ow.ratings.reduce((p, c) => p + c.level, 0) / ow.ratings.length);
                        // console.log(sr);
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
                if (!a.role) return 1; if (!b.role) return -1;
                if (a.role !== b.role) {
                    const order = ["Tank", "DPS", "Support"];
                    return order.indexOf(a.role) - order.indexOf(b.role);
                }

                if (!a.rating) return 1; if (!b.rating) return -1;
                return b.rating.level - a.rating.level;
            });
        },
        draftTeams() {
            if (!this.event?.teams) return [];
            return this.event.teams.filter(team => team.draft_order !== undefined).sort((a, b) => a.draft_order - b.draft_order);
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
        width: 224px;
        max-height: 2em;
    }
    .available-players .title {
        border-bottom: 2px solid transparent;
        text-align: center;
        font-size: 32px;
        font-weight: bold;
        width: 100%;
        margin: 0 2px 8px;
        padding: 2px 8px;
        width: calc(100% - 4px);
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
        width: 25%;
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

</style>

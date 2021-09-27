<template>
    <div class="auction-overlay d-flex w-100 h-100 position-absolute">
        <div class="left flex-grow-1 d-flex flex-column overflow-hidden">
            <div class="event-top d-flex bg-dark flex-center">
                <div class="event-logo-holder flex-center">
                    <div class="logo-inner bg-center" :style="eventLogo"></div>
                </div>
                <div class="event-name flex-grow-1 flex-center d-flex flex-column">
                    <div class="industry-align">{{ _broadcast.event ? (_broadcast.event.short || _broadcast.event.name): '' }}</div>
                    <div class="industry-align">Player Auction</div>
                </div>
                <div class="event-stats flex-center"></div>
            </div>
            <div class="player-middle d-flex flex-grow-1">
                <div class="player-info w-100 h-100 flex-center flex-column">
                    <div v-if="player">
                        <div class="player-name">{{ player.name }}</div>
                        <div class="player-teams d-flex flex-wrap flex-center">
                            <PlayerTeamDisplay :team="team" v-for="team in playerTeams" v-bind:key="team.id" />
                        </div>
                    </div>
                </div>
                <div class="bids flex-column-reverse d-flex justify-content-end">
                    <div class="bid d-flex align-content-center" v-for="(bid, i) in bids" v-bind:key="i" :style="getTheme(bid.team.id)">
                        <div class="team-logo flex-center">
                            <div class="logo-inner bg-center" :style="getLogo(bid.team.id)"></div>
                        </div>
                        <div class="team-text flex-center ml-2">{{ money(bid.amount) }}</div>
                    </div>
                </div>
            </div>
<!--            <div class="left-bottom flex-center">bottom</div>-->
        </div>
        <div class="right bg-dark flex-shrink-0">
            <div class="team-lists" v-if="['teams-1', 'teams-2'].includes(rightDisplay)">
                <TeamPlayerList v-for="team in displayTeams" :team="team" v-bind:key="team.id" />
            </div>
            <div class="team-focus" v-if="rightDisplay === 'team-focus'">
                <SignedTeamList :team="signedTeam" :amount="signAmount" />
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import TeamPlayerList from "./TeamPlayerList";
import { cleanID, cssImage, money } from "@/utils/content-utils";
import PlayerTeamDisplay from "./PlayerTeamDisplay";
import { sortEvents } from "@/utils/sorts";
import SignedTeamList from "@/components/broadcast/auction/SignedTeamList";
import { logoBackground1 } from "@/utils/theme-styles";

export default {
    name: "AuctionOverlay",
    props: ["broadcast", "category"],
    components: { TeamPlayerList, PlayerTeamDisplay, SignedTeamList },
    data: () => ({
        tick: 0,
        socketPlayer: null,
        bids: [],
        justSigned: null,
        signedPlayer: null,
        signAmount: null
    }),
    computed: {
        broadcastPlayerID() {
            if (!this.broadcast?.highlight_player) return null;
            return this.broadcast?.highlight_player[0];
        },
        playerID() {
            if (this.socketPlayer) return this.socketPlayer.id;
            if (!this.broadcast?.highlight_player) return null;
            return this.broadcast?.highlight_player[0];
        },
        player() {
            if (!this.playerID) return null;
            return ReactiveRoot(this.playerID, {
                member_of: ReactiveArray("member_of", {
                    theme: ReactiveThing("theme"),
                    event: ReactiveThing("event", {
                        theme: ReactiveThing("theme")
                    })
                })
            });
        },
        playerTeams() {
            if (!this.player?.member_of) return [];
            return this.player.member_of.filter(t => {
                if (!t) return;
                if (!t.event) return;
                if (t.minor_team) return false;
                if (!t.ranking_sort) return false;
                return true;
            }).sort((a, b) => sortEvents(a.event, b.event));
        },
        eventLogo() {
            if (!this._broadcast?.event?.theme) return {};
            return cssImage("backgroundImage", this._broadcast.event.theme, ["default_logo", "default_wordmark"], 200);
        },
        _broadcast() {
            return ReactiveRoot(this.broadcast.id, {
                event: ReactiveThing("event", {
                    theme: ReactiveThing("theme"),
                    teams: ReactiveArray("teams", {
                        theme: ReactiveThing("theme"),
                        players: ReactiveArray("players"),
                        staff: ReactiveArray("staff"),
                        owners: ReactiveArray("owners"),
                        captains: ReactiveArray("captains")
                    })
                })
            });
        },
        rightDisplay() {
            if (this.justSigned) return "team-focus";
            if (this.tick % 2 === 0) return "teams-1";
            if (this.tick % 2 === 1) return "teams-2";
            return null;
        },
        teams() {
            if (!this._broadcast?.event?.teams?.length) return null;
            let teams = this._broadcast.event.teams;// .filter(t => t.players?.length);
            if (this.category) teams = teams.filter(t => t.team_category === this.category);

            return teams;
        },
        displayTeams() {
            let teams = this.teams;
            if (this.rightDisplay === "teams-1") teams = teams.slice(0, 8);
            if (this.rightDisplay === "teams-2") teams = teams.slice(8, 16);
            return teams;
        },
        signedTeam() {
            if (!this.justSigned?.id) return null;
            return ReactiveRoot(this.justSigned.id, {
                theme: ReactiveThing("theme"),
                players: ReactiveArray("players")
            });
        }
    },
    watch: {
        broadcastPlayerID() {
            if (!this.socketPlayer) return;
            if (this.broadcastPlayerID !== null && this.broadcastPlayerID === this.socketPlayer.id) {
                this.socketPlayer = null;
            }
        }
    },
    methods: {
        money,
        getLogo(teamID) {
            return cssImage("backgroundImage",
                this.teams.find(t => t.id === cleanID(teamID))?.theme,
                ["small_logo", "default_logo"],
                100);
        },
        getTheme(teamID) {
            console.log(cleanID(teamID), this.teams);
            return logoBackground1(this.teams.find(t => t.id === cleanID(teamID)));
        }
    },
    mounted() {
        setInterval(() => {
            this.tick++;
            if (this.tick >= 4) this.tick = 0;
        }, 5000);
    },
    sockets: {
        auction_start(player) {
            console.log("auction_start", player);
            this.socketPlayer = player;
            this.justSigned = null;
            this.bids = [];
        },
        auction_bids(bids) {
            console.log("auction_bids", bids);
            this.bids = bids;
        },
        auction_signed({ player, team, amount }) {
            console.log({ player, team, amount });
            this.justSigned = team;
            this.signAmount = amount;
            setTimeout(() => {
                // TODO: uncomment
                if (this.justSigned) {
                    this.justSigned = null;
                    this.signedPlayer = null;
                }
            }, 20 * 1000);
        }
    }
};
</script>

<style scoped>
    .auction-overlay {
        background-color: #222;
        font-family: "Industry", "SLMN-Industry", sans-serif;
        color: white;
        display: flex;
    }
    .team-lists {
        display: grid;
        grid-auto-flow: column;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr 1fr 1fr;
        gap: 0px 0px;
        grid-template-areas:
    ". ."
    ". ."
    ". ."
    ". .";

        height: 100%;
        margin: 0 -5px;
    }
    .right {
        width: 600px
    }
    .event-logo-holder, .event-stats {
        width: 300px;
    }
    .logo-inner {
        width: 90%; height: 90%;
    }
    .event-logo-holder {
        height: 200px;
    }
    .event-name {
        font-size: 64px;
        font-weight: bold;
        line-height: 1.1;
    }
    .event-top {
        height: 220px;
    }
    .player-name {
        font-size: 120px;
        text-transform: uppercase;
        font-weight: bold;
        text-align: center;
        line-height: 1;
        margin-bottom: 32px;
    }
    .bids {
        font-size: 36px;
        font-weight: bold;
        width: 400px;
        overflow: hidden;
        flex-shrink: 1;
        max-height: 860px;
    }

    .bid .team-logo {
        width: 80px;
        height: 80px;
    }
</style>

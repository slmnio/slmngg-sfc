<template>
    <div class="container event-auction">
        <div class="auction-section">
            <div class="bar bg-danger text-white text-center mb-2 p-2 rounded" v-if="pageNoLongerNew && auctionState === 'NOT_CONNECTED'">Not connected to auction server</div>
            <div class="admin-settings border-danger border p-2 rounded mb-2 d-flex align-items-center" v-if="isAdmin">
                <button class="btn btn-info mr-1" @click="sendToAuctionServer('auction:admin_set_state', {'state': 'READY'})">Set state: READY</button>
                <button class="btn btn-warning mr-1" @click="sendToAuctionServer('auction:admin_set_state', {'state': 'RESTRICTED'})">Set state: RESTRICTED</button>
                <div class="btn-text text-right flex-grow-1">{{ auctionState }}</div>
            </div>
            <AuctionCountdown class="auction-countdown mb-2" web :style="themeBackground1(event)" />

            <div class="row">
                <div class="active-player col-7 mb-5">
                    <div class="player-name" v-if="activePlayer">
                        <router-link class="no-link-style" :to="url('player', activePlayer)" target="_blank">{{ activePlayer?.name || '&nbsp;' }}</router-link>
                        <div class="player-role" v-if="activePlayer?.role" v-html="getRoleSVG(activePlayer.role)"></div>
                    </div>
<!--                    <h3 class="player-signed">SIGNED TO</h3>-->
                    <div class="player-info">{{ activePlayer?.draft_data }}</div>
                </div>
                <div class="bids col-5">
                    <div class="bid-list d-flex flex-column-reverse">
                        <AuctionBid v-bind="bid" class="bid" v-for="(bid, i) in topBids" :key="i" :winning="i === topBids.length - 1" :won="(i === topBids.length - 1) && auctionState === 'POST_AUCTION'" />
                    </div>
                </div>
            </div>
            <div class="row mt-2">
                <div class="col-12 col-lg-6 d-flex justify-content-end align-items-center control-box">
                    <div class="active-team-select">
                        <select v-model="actingTeamID">
                            <option :value="null" disabled>Choose a team to control</option>
                            <option v-for="team in teamsYouControl" :key="team.id" :value="team.id">{{ team.name }}</option>
                        </select>
                    </div>
                    <div class="active-team-balance">{{ money(balance) }}</div>
                </div>
                <div class="col-12 col-lg-6 text-center bid-buttons">
                    <div class="status-bar mb-1">
                        {{ biddingStatus }}
                    </div>
                    <div class="d-flex buttons">
                        <div class="d-flex buttons">
                            <button class="btn btn-success btn-lg text-nowrap"
                                    @click="sendBid((leadingBid?.amount ?? 0) + autoSettings.money.minimumBidIncrement)"
                                    :disabled="!canBid">+ {{ money(autoSettings.money.minimumBidIncrement) }}
                            </button>
                            <button class="btn btn-success btn-lg text-nowrap" v-if="autoSettings.money.minimumBidIncrement < 5"
                                    @click="sendBid((leadingBid?.amount ?? 0) + 5)" :disabled="!canBid">+ {{ money(5) }}
                            </button>
                            <button class="btn btn-success btn-lg text-nowrap" v-if="autoSettings.money.minimumBidIncrement < 10"
                                    @click="sendBid((leadingBid?.amount ?? 0) + 10)" :disabled="!canBid">+ {{
                                    money(10)
                                }}
                            </button>
                        </div>
                        <div class="flex-center">
                            <div class="button-group bid-input-group">
                                <input type="number" class="bid-amount-input" v-model.number="customBidAmount"
                                       :min="leadingBid ? leadingBid?.amount + autoSettings.money.minimumBidIncrement : 1"
                                       :max="leadingBid ? leadingBid?.amount + autoSettings.money.maximumBidIncrement : 200"
                                       @keydown.enter="sendBid(customBidAmount)"
                                />
                                <button class="btn btn-success btn-lg" @click="sendBid(customBidAmount)"
                                        :disabled="customBidError || !canBid" :data-tooltip="customBidError">Bid
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-5">
            <div class="col-4 teams-section">
                <h3 class="text-center" v-if="groupedTeams.active.length">Active teams</h3>
                <div class="team-group" v-for="team in groupedTeams.active" :key="team.id">
                    <div class="d-flex">
                        <ContentThing class="team-display d-inline-flex" type="team" :text="team.name" :theme="team.theme" :show-logo="true" :thing="team" />
                        <div class="text money">{{ money(team.balance) }}</div>
                        <div class="text player-count ml-2">({{ auctionSettings.each_team - (team.players?.length || 0) }} to draft)</div>
                    </div>
                    <ul>
                        <li v-for="player in team.players" :key="player.id">
                            <router-link :to="url('player', player)" target="_blank">{{ player?.name }}</router-link>
                            {{ money(player?.auction_price) }}
                        </li>
                    </ul>
                </div>
                <h3 class="text-center" v-if="groupedTeams.finished.length">Completed Teams</h3>
                <div class="team-group" v-for="team in groupedTeams.finished" :key="team.id">
                    <div class="d-flex">
                        <ContentThing class="team-display d-inline-flex" type="team" :text="team.name" :theme="team.theme" :show-logo="true" :thing="team" />
                        <div class="text money">{{ money(team.balance) }} left over</div>
                    </div>
                    <ul>
                        <li v-for="player in team.players" :key="player.id">
                            <router-link :to="url('player', player)" target="_blank">{{ player?.name }}</router-link>
                            • {{ money(player?.auction_price) }}
                        </li>
                    </ul>
                </div>

                <h3 class="text-center mt-5">Auction Settings</h3>
                <table class="table-dark table-bordered table-sm w-100 text-center">
                    <tr>
                        <td>Minimum increment: <b>{{ money(this.autoSettings.money.minimumBidIncrement) }}</b></td>
                    </tr>
                    <tr>
                        <td>Maximum increment: <b>{{ money(this.autoSettings.money.maximumBidIncrement) }}</b></td>
                    </tr>
                    <tr v-if="auctionSettings?.time?.beforeFirstBids">
                        <td>Pre-auction timer: <b>{{ auctionSettings?.time?.beforeFirstBids }} seconds</b></td>
                    </tr>
                    <tr v-if="auctionSettings?.time?.afterInitialBid">
                        <td>Auction timer after first bid: <b>{{ auctionSettings?.time?.afterInitialBid }} seconds</b></td>
                    </tr>
                    <tr v-if="auctionSettings?.time?.afterSubsequentBids">
                        <td>Auction timer after other bids: <b>{{ auctionSettings?.time?.afterSubsequentBids }} seconds</b></td>
                    </tr>
                </table>
            </div>
            <div class="col-8 players-section">
                <h3 class="text-center">Players</h3>

                <div class="admin-only mb-2" v-if="isAdmin">
                    <div class="text-center">Admin force team</div>
                    <select v-model="adminTeamID" class="w-100">
                        <option :value="null" disabled>Choose a team to control</option>
                        <option v-for="team in teams" :key="team.id" :value="team.id">{{ team.name }}</option>
                    </select>
                </div>

                <table class="table table-bordered table-dark table-sm w-100">
                    <tr class="player" v-for="(player, i) in undraftedPlayers" :key="player.id" :class="{'striped': i % 2 === 1, 'bg-primary': activePlayer?.id === player.id}">
                        <td class="player-name">
                            <div class="player-info-box d-flex align-items-center">
                                <div v-if="player.role" class="player-role" v-html="getRoleSVG(player.role)"></div>
                                <router-link :to="url('player', player)">{{ player.name }}</router-link>
                            </div>
                        </td>
                        <td class="draft-data">{{ player.draft_data }}</td>
                        <td class="player-buttons-cell">
                            <div class="buttons d-flex">
                                <button class="btn btn-info btn-sm" v-if="isAdmin" :disabled="!adminTeamID" @click="() => askStarting(player)">force</button>
                                <button class="btn btn-success btn-sm" :disabled="!canStartPlayer" @click="startPlayer(player)">start</button>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { isAuthenticated } from "@/utils/auth";
import { cleanID, dirtyID, getRoleSVG, money, url } from "@/utils/content-utils";
import { sortAlpha } from "@/utils/sorts";
import { isEventStaffOrHasRole } from "@/utils/client-action-permissions";
import AuctionCountdown from "@/components/broadcast/auction/AuctionCountdown.vue";
import AuctionBid from "@/components/website/AuctionBid.vue";
import { VBTooltip } from "bootstrap-vue";
import ContentThing from "@/components/website/ContentThing.vue";
import { themeBackground1 } from "@/utils/theme-styles";

export default {
    name: "EventAuction",
    components: { ContentThing, AuctionBid, AuctionCountdown },
    directives: { BTooltip: VBTooltip },
    props: {
        event: {}
    },
    data: () => ({
        auctionServerConnected: false,
        auctionState: "NOT_CONNECTED",
        activePlayerID: null,
        pageNoLongerNew: false,
        actingTeamID: null,
        bids: [],
        customBidAmount: 0,
        adminTeamID: null
    }),
    computed: {
        activePlayer() {
            if (!this.activePlayerID) return;
            return ReactiveRoot(this.activePlayerID, {
                member_of: ReactiveArray("member_of", {
                    theme: ReactiveThing("theme"),
                    event: ReactiveThing("event", {
                        theme: ReactiveThing("theme")
                    }),
                    accolades: ReactiveArray("accolades", {
                        event: ReactiveThing("event", {
                            theme: ReactiveThing("theme")
                        })
                    })
                }),
                accolades: ReactiveArray("accolades", {
                    event: ReactiveThing("event", {
                        theme: ReactiveThing("theme")
                    })
                }),
                favourite_hero: ReactiveThing("favourite_hero")
            });
        },
        eventSettings() {
            if (!this.event?.blocks) return null;
            try {
                const data = JSON.parse(this.event?.blocks);
                return data;
            } catch (e) {
                console.warn("Event block data parse error", e);
            }
            return null;
        },
        isAdmin() {
            return isEventStaffOrHasRole(this.$root.auth.user, { event: this.event, role: "Auction Admin", websiteRoles: ["Full broadcast permissions", "Can edit any auction"] });
        },
        auctionSettings() {
            return this.eventSettings?.auction;
        },
        topBids() {
            return this.bids.slice(-5);
        },
        leadingBid() {
            if (!this.bids?.length) return null;
            return this.bids[this.bids.length - 1];
        },
        isLeading() {
            return this.actingTeam?.id && (this.leadingBid?.teamID === this.actingTeam.id);
        },
        teamBids() {
            if (!this.actingTeam) return [];
            return this.bids.filter(t => t.teamID === this.actingTeam?.id);
        },
        latestTeamBid() {
            return this.teamBids[this.teamBids.length - 1];
        },
        canBid() {
            return this.actingTeam?.id && ["IN_ACTION"].includes(this.auctionState) && !this.isLeading;
        },
        biddingStatus() {
            if (this.auctionState === "PRE_AUCTION") {
                return "Bidding is about to open";
            } else if (this.auctionState === "POST_AUCTION") {
                return this.isLeading ? "You won the player!" : "Auction is over";
            } else if (this.auctionState === "IN_ACTION") {
                const bidError = this.customBidError;
                if (bidError) {
                    return this.customBidError;
                } else {
                    return `You can bid between ${money(this.leadingBid?.amount + this.autoSettings.money.minimumBidIncrement)} and ${money(Math.min(this.leadingBid?.amount + this.autoSettings.money.maximumBidIncrement, (this.balance || 0)))}`;
                }
            } else {
                return "Bidding is closed";
            }
        },
        autoSettings() {
            return {
                money: {
                    defaultStartingBid: this.auctionSettings?.money?.defaultStartingBid ?? 1,
                    minimumBidIncrement: this.auctionSettings?.money?.minimumBidIncrement ?? 1,
                    maximumBidIncrement: this.auctionSettings?.money?.maximumBidIncrement ?? 50,
                    unlockAfterSigning: this.auctionSettings?.money?.unlockAfterSigning ?? 10
                }
            };
        },
        teams() {
            if (!this.event?.teams?.length) return [];
            return ReactiveArray("teams", {
                theme: ReactiveThing("theme"),
                players: ReactiveArray("players")
            })(this.event).filter(team => team?.draft_order).sort((a, b) => a.draft_order - b.draft_order);
        },
        groupedTeams() {
            const groups = {
                active: [],
                finished: []
            };
            if (!this.teams?.length) return groups;
            (this.teams || []).forEach(team => {
                if (team.players?.length === this.auctionSettings?.each_team ?? 7) {
                    // Finished
                    groups.finished.push(team);
                } else {
                    groups.active.push(team);
                }
            });
            return groups;
        },
        actingTeam() {
            return (this.teams || []).find(t => t.id === this.actingTeamID);
        },
        adminTeam() {
            return (this.teams || []).find(t => t.id === this.adminTeamID);
        },
        balance() {
            return this.actingTeam?.balance;
        },
        customBidError() {
            if (!this.actingTeam) return "No team selected";
            if (this.isLeading) return "You're leading this bid";
            // if (this.customBidAmount >= this.balance) return `${this.actingTeam.name} doesn't have enough funds for this`;

            if (this.leadingBid) {
                if (this.leadingBid?.amount > (this.balance || 0)) return `${this.actingTeam.name} doesn't have enough funds for this`;
                const diff = this.customBidAmount - this.leadingBid?.amount;
                if (diff > this.autoSettings.money.maximumBidIncrement) return `${money(this.customBidAmount)} is over the maximum bid increment of ${money(this.autoSettings.money.maximumBidIncrement)}`;
                if (diff < this.autoSettings.money.minimumBidIncrement) {
                    if (parseInt(this.customBidAmount) === this.balance) return null;
                    return `${money(this.customBidAmount)} is below the minimum bid increment of ${money(this.autoSettings.money.minimumBidIncrement)}`;
                }
            }
            return null;
        },
        teamsYouControl() {
            if (!isAuthenticated(this.$root)) return [];
            let userAirtableID = this.$root.auth.user?.airtableID;
            if (!userAirtableID) return [];
            userAirtableID = "rec" + userAirtableID;
            return this.teams.filter(t =>
                (t.captains || []).includes(userAirtableID) ||
                (t.staff || []).includes(userAirtableID) ||
                (t.controllers || []).includes(userAirtableID)
            );
        },
        allPlayers() {
            if (!this.event?.draftable_players?.length) return [];
            return ReactiveArray("draftable_players", {
                teams: ReactiveArray("teams")
            })(this.event);
        },
        undraftedPlayers() {
            const draftingTeamIDs = this.teams.map(team => team?.id).filter(Boolean).map(id => dirtyID(id));
            if (!draftingTeamIDs?.length) return [];
            return this.allPlayers.filter(player => {
                return !(player?.member_of || []).some(teamID => draftingTeamIDs.includes(dirtyID(teamID)));
            }).sort((a, b) => b.manual_sr - a.manual_sr);
        },
        eventID() {
            return cleanID(this.event?._original_data_id);
        },
        canStartPlayer() {
            if (this.isAdmin) {
                if (this.auctionState === "RESTRICTED") return true;
            }
            return this.auctionState === "READY";
        }
    },
    methods: {
        themeBackground1,
        isAuthenticated,
        money,
        getRoleSVG,
        url,
        sendToAuctionServer(event, data) {
            // if (!isAuthenticated()) return console.error("Tried to send data while not authed", { event, data });
            console.log("[socket]", "sending", event, data);
            this.$socket.client.emit(event, {
                auctionID: this.eventID,
                ...data,
                _token: this.$root.auth.token
            });
        },
        startPlayer(player) {
            if (!this.actingTeam) return this.$notyf.error("You need to choose a team to control");
            this.sendToAuctionServer("auction:request_start_player", { playerID: player.id, teamID: this.actingTeam.id });
        },
        async askStarting(player) {
            console.log("ask starting", player, this.adminTeam);
            if (!this.isAdmin) return this.$notyf.error("You're not an admin");
            if (!this.adminTeamID) return this.$notyf.error("You need to select an admin team first");
            const starting = prompt(`What price should ${player.name} start at for ${this.adminTeam.name}?`, "1");
            this.sendToAuctionServer("auction:request_start_player", { playerID: player.id, teamID: this.adminTeam.id, startingBid: starting });
        },
        async sendBid(bidAmount) {
            if (!this.canBid) return this.$notyf.error("You can't bid");
            this.sendToAuctionServer("auction:bid", { teamID: this.actingTeam.id, amount: bidAmount });
        }
    },
    mounted() {
        setTimeout(() => {
            this.pageNoLongerNew = true;
        }, 3000);
    },
    watch: {
        eventID: {
            immediate: true,
            handler(eventID) {
                if (!eventID) return;
                console.log("Socket client subscribing", `auction:${eventID}`);
                this.sendToAuctionServer("auction:subscribe");
            }
        },
        teamsYouControl: {
            immediate: true,
            handler(teams) {
                if (!teams?.length) {
                    this.actingTeamID = null;
                } else if (teams.length === 1) {
                    this.actingTeamID = teams[0]?.id;
                }
            }
        },
        latestTeamBid: {
            immediate: true,
            handler(latestBid) {
                if (!latestBid?.amount) return;
                console.log("latest team bid", latestBid);
                // this.customBidAmount = latestBid.amount + (this.autoSettings.money.minimumBidIncrement * 2);
            }
        }
    },
    sockets: {
        auction_welcome({ auctionID, ready, state, activePlayerID }) {
            if (auctionID !== this.eventID) return console.warn("Auction welcome from unknown source", auctionID);
            this.auctionServerConnected = true;
            this.auctionState = state;
            if (state === "IN_ACTION" && activePlayerID) {
                this.activePlayerID = activePlayerID;
            }
            console.log("auction welcome", { auctionID, ready });
        },
        auction_state({ state, oldState, activePlayerID }) {
            this.auctionState = state;
            this.activePlayerID = activePlayerID;
        },
        auction_start({ activePlayerID }) {
            this.state = "IN_ACTION";
            this.activePlayerID = activePlayerID;
        },
        auction_pre_auction({ activePlayerID }) {
            this.state = "PRE_AUCTION";
            this.activePlayerID = activePlayerID;
        },
        auction_post_auction({ activePlayerID }) {
            this.state = "POST_AUCTION";
            this.activePlayerID = activePlayerID;
            this.customBidAmount = 0;
        },
        auction_error(error) {
            console.warn("auction_error", error);
            this.$notyf.error(error);
        },
        auction_bids(bids) {
            console.log("auction_bids", bids);
            this.bids = bids;
        }
    }
};
</script>

<style scoped>
    .auction-section {
        position: relative;
        width: 100%;
    }
    .auction-countdown {
        position: relative;
    }
    .bid-amount-input {
        font-size: 20px;
        width: 4em;
        border-top-left-radius: 4px;
        border-bottom-left-radius: 4px;
        border: 2px solid rgb(32 32 32 / 36%);
        text-align: center;
    }

    .bid-input-group {
        display: flex;
    }

    .buttons {
        gap: 0.75em;
        justify-content: center;
    }

    .bid-input-group .btn {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }
    .bids {
        min-height: 15em;
        background-color: rgba(0,0,0,0.1);
    }

    .player-role {
        width: 1.5em;
        height: 1.5em;
        display: inline-flex;
        margin-right: .2em;
    }

    td.player-name {font-size: 18px;}
    .active-team-balance {
        font-size: 32px;
        margin-left: .5em;
        display: inline-flex;
    }
    .control-box {
        padding-top: 26px;
    }
    .player-buttons-cell .buttons {
        gap: 4px;
    }
    .active-player .player-name {
        font-size: 3em;
        font-weight: bold;
        text-shadow:  0 0 8px rgba(255,255,255,0.4);
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .active-player .player-role {
        height: 1.25em;
        width: 1.25em;
    }
    .player-info {
        white-space: pre-wrap;
    }
    .team-group .text {
        line-height: 40px;
        margin-left: 4px;
        font-size: 18px;
    }
    .draft-data {
        white-space: pre-wrap;;
    }
</style>


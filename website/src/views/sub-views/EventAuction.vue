<template>
    <div class="container event-auction">
        <div class="auction-section">
            <div class="bar bg-danger text-white text-center mb-2 p-2 rounded" v-if="pageNoLongerNew && auctionState === 'NOT_CONNECTED'">Not connected to auction server</div>
            <div class="admin-settings border-danger border p-2 rounded mb-2 d-flex align-items-center" v-if="isAdmin">
                <button class="btn btn-info mr-1" @click="sendToAuctionServer('auction:admin_set_state', {'state': 'READY'})">Set state: READY</button>
                <button class="btn btn-warning mr-1" @click="sendToAuctionServer('auction:admin_set_state', {'state': 'RESTRICTED'})">Set state: RESTRICTED</button>
                <div class="btn-text text-end flex-grow-1">{{ auctionState }}</div>
            </div>
            <AuctionCountdown class="auction-countdown mb-2" web :style="themeBackground1(event)" show-time />

            <div class="action-row d-flex mb-3">
                <div class="active-player col-7">
                    <div class="last-started" v-if="lastStartedTeam && ['PRE_AUCTION', 'IN_ACTION'].includes(auctionState)">
                        <div class="badge badge-pill bg-secondary">Started by</div> <ThemeLogo :theme="lastStartedTeam?.theme" border-width="3px" icon-padding="4px" /> <router-link class="no-link-style" :to="url('team', lastStartedTeam)" target="_blank">{{ lastStartedTeam?.name || '&nbsp;' }}</router-link>
                    </div>
                    <div class="last-started" v-if="nextTeamToStart && ['READY', 'POST_AUCTION', 'RESTRICTED'].includes(auctionState)">
                        <div class="badge badge-pill bg-primary">Next to start</div> <ThemeLogo :theme="nextTeamToStart?.theme" border-width="3px" icon-padding="4px" /> <router-link class="no-link-style" :to="url('team', nextTeamToStart)" target="_blank">{{ nextTeamToStart?.name || ' ' }}</router-link>
                    </div>
                    <div class="player-name" v-if="activePlayer">
                        <router-link class="no-link-style" :to="url('player', activePlayer)" target="_blank">{{ activePlayer?.name || '&nbsp;' }}</router-link>
                        <div class="player-role" v-if="activePlayer?.role" v-html="getRoleSVG(activePlayer.role)" v-b-tooltip :title="`Main role: ${activePlayer.role}`"></div>
                    </div>
<!--                    <h3 class="player-signed">SIGNED TO</h3>-->
                    <div class="player-roles d-flex mb-1">
                        <div class="role" v-for="role in playerRoles(activePlayer?.eligible_roles)" :class="{'text-danger': !role.eligible, 'text-success': role.eligible}"
                             :key="role?.role" v-html="getRoleSVG(role?.role)" :title="role.eligible ? `Eligible for ${role.role}` : `Not eligible for ${role.role}`" v-b-tooltip
                        ></div>
                    </div>
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
                    <div class="mr-3">Team control</div>
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
                        <div class="d-flex team-help-text flex-wrap align-items-center">
                            <div class="text money">{{ money(team.balance) }}</div>
                            <div class="text player-count ml-2">({{ auctionSettings.each_team - (team.players?.length || 0) }} to draft)</div>
                        </div>
                    </div>
                    <div class="ml-2 badge badge-pill bg-secondary" v-if="lastStartedTeam?.id === team?.id">Started {{ ["PRE_AUCTION", "POST_AUCTION", "IN_ACTION"].includes(auctionState) ? "this" : "last" }} player</div>
                    <div class="ml-2 badge badge-pill bg-primary" v-if="nextTeamToStart?.id === team?.id">Next to start</div>
                    <div class="ml-2 badge badge-pill bg-info" v-if="actingTeam?.id === team?.id">Acting as this team</div>
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
                        <div class="d-flex team-help-text align-items-center">
                            <div class="text money">{{ money(team.balance) }} left over</div>
                        </div>
                    </div>
                    <div class="ml-2 badge badge-pill bg-secondary" v-if="lastStartedTeam?.id === team?.id">Started {{ ["PRE_AUCTION", "POST_AUCTION", "IN_ACTION"].includes(auctionState) ? "this" : "last" }} player</div>
                    <div class="ml-2 badge badge-pill bg-info" v-if="actingTeam?.id === team?.id">Acting as this team</div>
                    <ul>
                        <li v-for="player in team.players" :key="player.id">
                            <router-link :to="url('player', player)" target="_blank">{{ player?.name }}</router-link>
                            • {{ money(player?.auction_price) }}
                        </li>
                    </ul>
                </div>

                <h3 class="text-center mt-5">Auction Settings</h3>
                <table class="table-dark table-bordered table-sm w-100 text-center">
                    <tbody>
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
                            <td>Auction timer after first bid: <b>{{ auctionSettings?.time?.afterInitialBid }}
                                seconds</b></td>
                        </tr>
                        <tr v-if="auctionSettings?.time?.afterSubsequentBids">
                            <td>Auction timer after other bids: <b>{{ auctionSettings?.time?.afterSubsequentBids }}
                                seconds</b></td>
                        </tr>
                    </tbody>
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
                    <tbody>
                        <tr class="player" v-for="(player, i) in undraftedPlayers" :key="player.id"
                            :class="{'striped': i % 2 === 1, 'currently-active-player': activePlayer?.id === player.id}">
                            <td class="player-name">
                                <div class="player-info-box d-flex align-items-center">
                                    <div v-if="player.role" class="player-role" v-html="getRoleSVG(player.role)"></div>
                                    <router-link :to="url('player', player)">{{ player.name }}</router-link>
                                </div>
                                <div class="player-eligible-roles"
                                     :title="`Eligible for ${niceJoin(eligibleRoles(player.eligible_roles).map(r => r.role))}`"
                                     v-b-tooltip>
                                    <div class="role text-success" v-for="role in eligibleRoles(player.eligible_roles)"
                                         :key="role?.role" v-html="getRoleSVG(role?.role)"></div>
                                </div>
                            </td>
                            <td class="draft-data">{{ player.draft_data }}</td>
                            <td class="player-buttons-cell">
                                <div class="buttons d-flex">
                                    <button class="btn btn-info btn-sm" v-if="isAdmin" :disabled="!adminTeamID"
                                            @click="() => askStarting(player)">force
                                    </button>
                                    <button class="btn btn-success btn-sm" :disabled="!canStartPlayer"
                                            @click="startPlayer(player)">start
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import { socket } from "@/socket";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { cleanID, dirtyID, getRoleSVG, money, url } from "@/utils/content-utils";
import { isEventStaffOrHasRole } from "@/utils/client-action-permissions";
import AuctionCountdown from "@/components/broadcast/auction/AuctionCountdown.vue";
import AuctionBid from "@/components/website/AuctionBid.vue";
import ContentThing from "@/components/website/ContentThing.vue";
import { themeBackground1 } from "@/utils/theme-styles";
import ThemeLogo from "@/components/website/ThemeLogo.vue";
import { useAuthStore } from "@/stores/authStore";

export default {
    name: "EventAuction",
    components: { ThemeLogo, ContentThing, AuctionBid, AuctionCountdown },
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
        adminTeamID: null,
        lastStartedTeamID: null
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
        lastStartedTeam() {
            if (!this.lastStartedTeamID) return null;
            return this.teams.find(t => cleanID(t.id) === cleanID(this.lastStartedTeamID));
        },
        nextTeamToStart() {
            // || !["POST_AUCTION", "READY", "IN_ACTION"].includes(this.auctionState)
            if (!this.lastStartedTeamID) return null;
            const lastTeamIndex = this.teams.findIndex(t => cleanID(t.id) === cleanID(this.lastStartedTeamID));
            if (lastTeamIndex === -1) return null;

            const next = this.groupedTeams.active.find(t => {
                const orderIndex = this.teams.findIndex(s => cleanID(s.id) === cleanID(t.id));
                return orderIndex > lastTeamIndex;
            });
            if (next) return next;
            return this.groupedTeams.active[0];
            //
            // let nextTeamIndex = lastTeamIndex + 1;
            // if (lastTeamIndex >= this.groupedTeams.active?.length - 1) {
            //     nextTeamIndex = 0;
            // }
            // return this.groupedTeams.active[nextTeamIndex];
        },
        eventSettings() {
            if (!this.event?.blocks) return null;
            try {
                return JSON.parse(this.event?.blocks);
            } catch (e) {
                console.warn("Event block data parse error", e);
            }
            return null;
        },
        isAdmin() {
            const { user } = useAuthStore();
            return isEventStaffOrHasRole(user, { event: this.event, role: "Auction Admin", websiteRoles: ["Full broadcast permissions", "Can edit any auction"] });
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
            return this.allEventTeams.filter(team => team?.draft_order).sort((a, b) => a.draft_order - b.draft_order);
        },
        allEventTeams() {
            if (!this.event?.teams?.length) return [];
            return ReactiveArray("teams", {
                theme: ReactiveThing("theme"),
                players: ReactiveArray("players")
            })(this.event);
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
            const { isAuthenticated, user } = useAuthStore();
            if (!isAuthenticated) return [];
            let userAirtableID = user?.airtableID;
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
            const draftingTeamIDs = this.allEventTeams.map(team => team?.id).filter(Boolean).map(id => dirtyID(id));
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
        money,
        getRoleSVG,
        url,
        niceJoin(array) {
            if (array.length > 1) {
                const last = array.pop();
                return array.join(", ") + " and " + last;
            }
            return array[0];
        },
        playerRoles(roles) {
            const allRoles = ["DPS", "Tank", "Support"];
            const output = [];
            if (!roles?.length) return output;
            roles = roles.map(r => r === "Damage" ? "DPS" : r);
            allRoles.forEach(role => {
                if (roles.includes(role)) {
                    output.push({ role, eligible: true });
                } else {
                    output.push({ role, eligible: false });
                }
            });
            return output;
        },
        eligibleRoles(roles) {
            if (!roles?.length) return [];
            return this.playerRoles(roles).filter(role => role.eligible);
        },
        sendToAuctionServer(event, data) {
            const { isAuthenticated, token } = useAuthStore();
            if (!isAuthenticated) return console.error("Tried to send data while not authed", { event, data });
            console.log("[socket]", "sending", event, data);
            socket.emit(event, {
                auctionID: this.eventID,
                ...data,
                _token: token
            });
        },
        startPlayer(player) {
            if (!this.actingTeam) return this.$notyf.error("You need to choose a team to control");
            if (!confirm(`Start ${player?.name}?`)) return;
            if (this.nextTeamToStart?.id && this.actingTeam.id !== this.nextTeamToStart.id) {
                if (!confirm(`It doesn't look like you're the next team to start a player.\nStill continue with ${player.name}?`)) return;
            }
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
            deep: true,
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
        auction_welcome({ auctionID, ready, state, activePlayerID, lastStartedTeamID }) {
            if (auctionID !== this.eventID) return console.warn("Auction welcome from unknown source", auctionID);
            this.auctionServerConnected = true;
            this.auctionState = state;
            if (state === "IN_ACTION" && activePlayerID) {
                this.activePlayerID = activePlayerID;
            }
            this.lastStartedTeamID = lastStartedTeamID;
            console.log("auction welcome", { auctionID, ready });
        },
        auction_state({ state, oldState, activePlayerID, lastStartedTeamID }) {
            this.auctionState = state;
            this.activePlayerID = activePlayerID;
            this.lastStartedTeamID = lastStartedTeamID;
        },
        auction_start({ activePlayerID, startingTeamID }) {
            this.state = "IN_ACTION";
            this.activePlayerID = activePlayerID;
            this.lastStartedTeamID = startingTeamID;
        },
        auction_pre_auction({ activePlayerID, startingTeamID }) {
            this.state = "PRE_AUCTION";
            this.activePlayerID = activePlayerID;
            this.lastStartedTeamID = startingTeamID;
        },
        auction_post_auction({ activePlayerID, startingTeamID }) {
            this.state = "POST_AUCTION";
            this.activePlayerID = activePlayerID;
            this.customBidAmount = 0;
            this.lastStartedTeamID = startingTeamID;
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
    .active-player {
        background-color: rgba(0,0,0,0.1);
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
        /*line-height: 40px;*/
        margin-left: 4px;
        font-size: 18px;
    }
    .draft-data {
        white-space: pre-wrap;;
    }
    .last-started {
        display: flex;
        gap: .5em;
        align-items: center;
    }
    .last-started .icon-holder {
        height: 2em;
        width: 2em;
    }
    .last-started .badge {
        font-size: 1em;
    }
    .player-eligible-roles .role {
        width: 1em;
        height: 1em;
    }
    .player-eligible-roles {
        display: flex;
        width: fit-content;
    }
    .active-player .role {
        width: 2em;
        height: 2em;
    }
    .role.text-danger {
        opacity: 0.5;
    }
    .currently-active-player {
        background-color: var(--primary);
    }

    .currently-active-player:deep(a),
    .currently-active-player .role {
        color: white !important;
    }
    .team-help-text {
        line-height: 1;
    }

    .spacer-text {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 1.5em;
        opacity: 0.7;
    }
</style>


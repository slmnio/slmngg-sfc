<template>
    <div class="container event-auction">
        <div class="auction-section">
            <div v-if="pageNoLongerNew && auctionState === 'NOT_CONNECTED'" class="bar bg-danger text-white text-center mb-2 p-2 rounded">Not connected to auction server</div>
            <div v-if="isAdmin" class="admin-settings border-danger border p-2 rounded mb-2 d-flex align-items-center">
                <button class="btn btn-info mr-1" @click="sendToAuctionServer('auction:admin_set_state', {'state': 'READY'})">Set state: READY</button>
                <button class="btn btn-warning mr-1" @click="sendToAuctionServer('auction:admin_set_state', {'state': 'RESTRICTED'})">Set state: RESTRICTED</button>
                <div class="btn-text text-end flex-grow-1">{{ auctionState }}</div>
            </div>
            <AuctionCountdown class="auction-countdown mb-2" web :style="themeBackground1(event)" show-time />

            <div class="action-row d-flex mb-3 rounded" :class="{'complete': auctionState === 'POST_AUCTION'}">
                <div class="active-player col-7 p-2">
                    <div v-if="lastStartedTeam && ['PRE_AUCTION', 'IN_ACTION'].includes(auctionState)" class="last-started">
                        <div class="badge badge-pill bg-secondary">Started by</div>
                        <ThemeLogo :theme="lastStartedTeam?.theme" border-width="3px" icon-padding="4px" logo-size="w-100" />
                        <router-link class="no-link-style" :to="url('team', lastStartedTeam)" target="_blank">
                            {{ lastStartedTeam?.name || "&nbsp;" }}
                        </router-link>
                    </div>
                    <div v-if="nextTeamToStart && ['READY', 'POST_AUCTION', 'RESTRICTED'].includes(auctionState)" class="last-started">
                        <div class="badge badge-pill bg-primary">Next to start</div>
                        <ThemeLogo :theme="nextTeamToStart?.theme" border-width="3px" icon-padding="4px" logo-size="w-100" />
                        <router-link class="no-link-style" :to="url('team', nextTeamToStart)" target="_blank">
                            {{ nextTeamToStart?.name || " " }}
                        </router-link>
                    </div>
                    <div v-if="activePlayer" class="player-name">
                        <theme-logo
                            v-if="winningTeam"
                            :theme="winningTeam?.theme"
                            class="signed-team-badge"
                            logo-size="w-100"
                            border-width=".15em" />
                        <router-link class="no-link-style player-name-link" :to="url('player', activePlayer)" target="_blank">{{ activePlayer?.name || '&nbsp;' }}</router-link>
                        <div
                            v-if="activePlayer?._draftData?.role"
                            class="player-role"
                            :title="`Main role: ${activePlayer?._draftData.role}`"
                            v-html="getRoleSVG(activePlayer?._draftData.role)"></div>
                    </div>
                    <!--                    <h3 class="player-signed">SIGNED TO</h3>-->
                    <div class="player-roles d-flex mb-1">
                        <div
                            v-for="role in playerRoles(activePlayer?._draftData?.eligible_roles)"
                            :key="role?.role"
                            v-b-tooltip
                            class="role"
                            :class="{'text-danger': !role.eligible, 'text-success': role.eligible}"
                            :title="role.eligible ? `Eligible for ${role.role}` : `Not eligible for ${role.role}`"
                            v-html="getRoleSVG(role?.role)"
                        ></div>
                    </div>
                    <div class="player-bits d-flex gap-2 my-1">
                        <div v-if="activePlayer?.pronouns" class="px-2 bg-secondary rounded small">{{ activePlayer?.pronouns }}</div>
                        <div v-if="activePlayer?.pronunciation" class="px-2 bg-secondary rounded small"><i class="fas fa-lips fa-fw"></i> {{ activePlayer?.pronunciation }}</div>
                    </div>
                    <div v-if="activePlayer" class="player-info dark-scrollbar rounded">
                        {{ activePlayer?._draftData?.info_for_captains }}
                    </div>
                </div>
                <div class="bids col-5">
                    <div class="bid-list d-flex flex-column-reverse">
                        <AuctionBid
                            v-for="(bid, i) in topBids"
                            v-bind="bid"
                            :key="[i, bid.amount, bid.teamID].join('-')"
                            class="bid"
                            :winning="i === topBids.length - 1"
                            :won="(i === topBids.length - 1) && auctionState === 'POST_AUCTION'" />
                    </div>
                </div>
            </div>
            <div class="row mt-2">
                <div class="col-12 col-lg-6 d-flex justify-content-end align-items-center control-box">
                    <div class="mr-3">Team control</div>
                    <div class="active-team-select">
                        <b-form-select v-model="actingTeamID" :state="!!actingTeamID">
                            <option :value="null" disabled>Choose a team to control</option>
                            <option v-for="team in teamsYouControl" :key="team.id" :value="team.id">{{ team.name }}</option>
                        </b-form-select>
                    </div>
                    <div class="active-team-balance">{{ money(balance) }}</div>
                </div>
                <div class="col-12 col-lg-6 text-center bid-buttons">
                    <div v-if="!actingTeamID" class="status-bar fw-bold">
                        You cannot bid in this auction without a team selected.
                    </div>
                    <div class="status-bar mb-1">
                        {{ biddingStatus || "&middot;" }}
                    </div>
                    <div class="d-flex buttons">
                        <div class="d-flex buttons">
                            <button
                                class="btn btn-success btn-lg text-nowrap"
                                :disabled="!canBid"
                                @click="sendBid((leadingBid?.amount ?? 0) + autoSettings.money.minimumBidIncrement)">
                                + {{ money(autoSettings.money.minimumBidIncrement) }}
                            </button>
                            <button
                                v-if="autoSettings.money.minimumBidIncrement < 5"
                                class="btn btn-success btn-lg text-nowrap"
                                :disabled="!canBid"
                                @click="sendBid((leadingBid?.amount ?? 0) + 5)">
                                + {{ money(5) }}
                            </button>
                            <button
                                v-if="autoSettings.money.minimumBidIncrement < 10"
                                class="btn btn-success btn-lg text-nowrap"
                                :disabled="!canBid"
                                @click="sendBid((leadingBid?.amount ?? 0) + 10)">
                                + {{
                                    money(10)
                                }}
                            </button>
                        </div>
                        <div class="flex-center">
                            <div class="button-group bid-input-group">
                                <input
                                    v-model.number="customBidAmount"
                                    type="number"
                                    class="bid-amount-input"
                                    :min="leadingBid ? leadingBid?.amount + autoSettings.money.minimumBidIncrement : 1"
                                    :max="leadingBid ? leadingBid?.amount + autoSettings.money.maximumBidIncrement : 200"
                                    @keydown.enter="sendBid(customBidAmount)"
                                >
                                <button
                                    class="btn btn-success btn-lg"
                                    :disabled="customBidError || !canBid"
                                    :data-tooltip="customBidError"
                                    @click="sendBid(customBidAmount)">
                                    Bid
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-5">
            <div class="col-4 teams-section">
                <h3 v-if="groupedTeams.active.length" class="text-center">Active teams</h3>
                <div v-for="team in groupedTeams.active" :key="team.id" class="team-group">
                    <div class="d-flex">
                        <ContentThing
                            class="team-display d-inline-flex"
                            type="team"
                            :text="team.name"
                            :theme="team.theme"
                            :show-logo="true"
                            :thing="team" />
                        <div class="d-flex team-help-text flex-wrap align-items-center">
                            <div class="text money">{{ money(team.balance) }}</div>
                            <div class="text player-count ml-2">({{ auctionSettings?.each_team - ((team?.players || [])?.length || 0) }} to draft)</div>
                        </div>
                    </div>
                    <div v-if="lastStartedTeam?.id === team?.id" class="ml-2 badge badge-pill bg-secondary">Started {{ ["PRE_AUCTION", "POST_AUCTION", "IN_ACTION"].includes(auctionState) ? "this" : "last" }} player</div>
                    <div v-if="nextTeamToStart?.id === team?.id" class="ml-2 badge badge-pill bg-primary">Next to start</div>
                    <div v-if="actingTeam?.id === team?.id" class="ml-2 badge badge-pill bg-info">Acting as this team</div>
                    <ul>
                        <li v-for="player in (team?.players || [])" :key="player.id">
                            <router-link :to="url('player', player)" target="_blank">{{ player?.name }}</router-link>
                            {{ money(player?.auction_price) }}
                        </li>
                    </ul>
                </div>
                <h3 v-if="groupedTeams.finished.length" class="text-center">Completed Teams</h3>
                <div v-for="team in groupedTeams.finished" :key="team.id" class="team-group">
                    <div class="d-flex">
                        <ContentThing
                            class="team-display d-inline-flex"
                            type="team"
                            :text="team.name"
                            :theme="team.theme"
                            :show-logo="true"
                            :thing="team" />
                        <div class="d-flex team-help-text align-items-center">
                            <div class="text money">{{ money(team.balance) }} left over</div>
                        </div>
                    </div>
                    <div v-if="lastStartedTeam?.id === team?.id" class="ml-2 badge badge-pill bg-secondary">Started {{ ["PRE_AUCTION", "POST_AUCTION", "IN_ACTION"].includes(auctionState) ? "this" : "last" }} player</div>
                    <div v-if="actingTeam?.id === team?.id" class="ml-2 badge badge-pill bg-info">Acting as this team</div>
                    <ul>
                        <li v-for="player in (team?.players || [])" :key="player.id">
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
                            <td>
                                Auction timer after first bid: <b>{{ auctionSettings?.time?.afterInitialBid }}
                                    seconds</b>
                            </td>
                        </tr>
                        <tr v-if="auctionSettings?.time?.afterSubsequentBids">
                            <td>
                                Auction timer after other bids: <b>{{ auctionSettings?.time?.afterSubsequentBids }}
                                    seconds</b>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="col-8 players-section">
                <h3 class="text-center">Players</h3>

                <div v-if="isAdmin" class="admin-only mb-2">
                    <div class="text-center">Admin force team</div>
                    <select v-model="adminTeamID" class="w-100">
                        <option :value="null" disabled>Choose a team to control</option>
                        <option v-for="team in teams" :key="team.id" :value="team.id">{{ team.name }}</option>
                    </select>
                </div>

                <div class="mb-2 d-flex gap-2">
                    <b-form-input v-model="searchText" placeholder="Search for players" />
                    <b-button variant="danger" @click="searchText = ''"><i class="fas fa-times fa-fw"></i></b-button>
                </div>

                <table class="table table-bordered table-dark table-sm w-100">
                    <tbody>
                        <tr
                            v-for="(player, i) in searchedPlayers"
                            :key="player.id"
                            class="player"
                            :class="{'striped': i % 2 === 1, 'currently-active-player': activePlayer?.id === player.id}">
                            <td class="player-name">
                                <div class="player-info-box d-flex align-items-center">
                                    <div v-if="player._draftData.role" class="player-role" v-html="getRoleSVG(player._draftData.role)"></div>
                                    <router-link :to="url('player', player)">{{ player.name }}</router-link>
                                </div>
                                <div
                                    v-b-tooltip
                                    class="player-eligible-roles"
                                    :title="`Eligible for ${niceJoin(eligibleRoles(player._draftData.eligible_roles).map(r => r.role))}`">
                                    <div
                                        v-for="role in eligibleRoles(player._draftData.eligible_roles)"
                                        :key="role?.role"
                                        class="role text-success"
                                        v-html="getRoleSVG(role?.role)"></div>
                                </div>
                            </td>
                            <td class="draft-data">{{ player._draftData.info_for_captains }}</td>
                            <td class="player-buttons-cell">
                                <div class="buttons d-flex">
                                    <button
                                        v-if="isAdmin"
                                        class="btn btn-info btn-sm"
                                        :disabled="!adminTeamID"
                                        @click="() => askStarting(player)">
                                        force
                                    </button>
                                    <button
                                        class="btn btn-success btn-sm"
                                        :disabled="!canStartPlayer"
                                        @click="startPlayer(player)">
                                        start
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
import { cleanID, decoratePlayerWithDraftData, dirtyID, getRoleSVG, money, url } from "@/utils/content-utils";
import { isEventStaffOrHasRole } from "@/utils/client-action-permissions";
import AuctionCountdown from "@/components/broadcast/auction/AuctionCountdown.vue";
import AuctionBid from "@/components/website/AuctionBid.vue";
import ContentThing from "@/components/website/ContentThing.vue";
import { themeBackground1 } from "@/utils/theme-styles";
import ThemeLogo from "@/components/website/ThemeLogo.vue";
import { useAuthStore } from "@/stores/authStore";
import { searchInCollection } from "@/utils/search";

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
        lastStartedTeamID: null,
        searchText: ""
    }),
    computed: {
        activePlayer() {
            if (!this.activePlayerID) return;
            return decoratePlayerWithDraftData(ReactiveRoot(this.activePlayerID, {
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
                favourite_hero: ReactiveThing("favourite_hero"),
                "signup_data": ReactiveArray("signup_data")
            }), this.eventID);
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
            return isEventStaffOrHasRole(user,
                this.event,
                ["Full broadcast permissions", "Can edit any auction"],
                ["Auction Admin"]
            );
        },
        auctionSettings() {
            return this.eventSettings?.auction;
        },
        topBids() {
            return this.bids.slice(-8);
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
            return this.actingTeam?.id && ["IN_ACTION"].includes(this.auctionState) && !this.isLeading &&
                ((this.actingTeam?.players || [])?.length < (this.auctionSettings?.each_team ?? 7));
        },
        biddingStatus() {
            if (this.auctionState === "PRE_AUCTION") {
                return "Bidding is about to open";
            } else if (this.auctionState === "POST_AUCTION") {
                return this.isLeading ? "You won the player!" : "Auction is over";
            } else if (this.auctionState === "IN_ACTION") {
                if ((this.actingTeam?.players || [])?.length >= (this.auctionSettings?.each_team ?? 7)) {
                    return "Your team is complete - you cannot bid";
                }
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
                // eslint-disable-next-line no-constant-binary-expression
                if ((team?.players || [])?.length === this.auctionSettings?.each_team ?? 7) {
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
                    if (parseInt(this.customBidAmount) === 0) return null;
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
            return (ReactiveArray("draftable_players", {
                teams: ReactiveArray("teams"),
                "signup_data": ReactiveArray("signup_data")
            })(this.event) || []).map(player => {
                if (!player) return {};
                const thisSignupData = (player.signup_data || []).find(data => cleanID(data?.event?.[0]) === cleanID(this.event?._original_data_id || this.event?.id));
                const _draftData = thisSignupData ? {
                    // signup data
                    role: thisSignupData.main_role,
                    sr: thisSignupData.sr,
                    tank_sr: thisSignupData.tank_sr,
                    dps_sr: thisSignupData.dps_sr,
                    support_sr: thisSignupData.support_sr,
                    info_for_captains: thisSignupData.info_for_captains,
                    eligible_roles: thisSignupData.eligible_roles,
                    // auction_price: thisSignupData.auction_price,
                } : {
                    // basic
                    role: player.role,
                    sr: player.manual_sr,
                    tank_sr: player.composition_tank_sr,
                    dps_sr: player.composition_dps_sr,
                    support_sr: player.composition_support_sr,
                    info_for_captains: player.draft_data,
                    eligible_roles: player.eligible_roles,
                    // auction_price: player.auction_price,
                };
                return {
                    ...player,
                    this_event_signup_data: thisSignupData,
                    _draftData
                };
            });
        },
        undraftedPlayers() {
            const draftingTeamIDs = this.allEventTeams.map(team => team?.id).filter(Boolean).map(id => dirtyID(id));
            // if (!draftingTeamIDs?.length) return [];
            return this.allPlayers.filter(player => {
                return !(player?.member_of || []).some(teamID => draftingTeamIDs.includes(dirtyID(teamID)));
            }).sort((a, b) => b?._draftData?.sr - a?._draftData?.sr);
        },
        searchedPlayers() {
            if (!this.searchText) return this.undraftedPlayers;
            return searchInCollection(this.undraftedPlayers, this.searchText, "name");
        },
        eventID() {
            return cleanID(this.event?._original_data_id);
        },
        canStartPlayer() {
            if (this.isAdmin) {
                if (this.auctionState === "RESTRICTED") return true;
            }
            return this.auctionState === "READY";
        },
        winningTeam() {
            if (this.auctionState !== "POST_AUCTION") return null;
            return ReactiveRoot(this.leadingBid?.teamID, {
                "theme": ReactiveThing("theme")
            });
        },
        title() {
            if (this.winningTeam?.name && this.activePlayer?.name) return `Complete: ${this.activePlayer?.name}`;
            if (this.activePlayer?.name) return `🔴 Live: ${this.activePlayer?.name}`;
            if (this.nextTeamToStart?.name) {
                if (this.nextTeamToStart?.id === this.actingTeamID) {
                    return `🔴 Next: (You) ${this.nextTeamToStart?.name}`;
                } else {
                    return `Next: ${this.nextTeamToStart?.name}`;
                }
            }
            return "";
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
        },
        title(text) {
            console.log(text);
            // if (text) {
            //     document.title = `${text} | Auction | ${this.event?.name}`;
            //
            // } else {
            //     document.title = `Auction | ${this.event?.name}`;
            // }
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
    },
    mounted() {
        setTimeout(() => {
            this.pageNoLongerNew = true;
        }, 3000);
    },
    head() {
        return {
            title: `${this.title ? `${this.title} | ` : ""}Auction`
        };
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
    .action-row {
        background-color: rgba(0,0,0,0.1);
        transition: background-color 200ms ease;
    }
    .action-row.complete {
        background-color: rgba(255,255,255,0.1);
    }
    .bids {
        min-height: 15em;
        transition: background-color 200ms ease;
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
        gap: .2em;
        padding: .1em 0;
    }
    .active-player .player-name-link {
        flex-grow: 1;
    }
    .signed-team-badge {
        width: 1.75em;
        height: 1.5em;
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
        width: 2.5em;
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
    .currently-active-player,
    .currently-active-player td {
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


    .player-info {
        height: 10em;
        overflow-y: scroll;
        background-color: rgba(64,64,64,0.2);
        padding: .5em;
    }

    .active-player {
        min-height: 22em;
    }
</style>


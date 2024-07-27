<template>
    <div class="auction-overlay d-flex w-100 h-100 position-absolute">
        <div class="left flex-grow-1 d-flex flex-column overflow-hidden">
            <div class="event-top d-flex flex-center flex-shrink-0" :style="background">
                <div class="event-logo-holder flex-center">
                    <div class="logo-inner bg-center" :style="eventLogo"></div>
                </div>
                <div class="event-name flex-grow-1 flex-center d-flex flex-column">
                    <div class="industry-align text-center">{{ _broadcast.event ? (_broadcast.event.short || _broadcast.event.name): '' }}</div>
                    <div class="industry-align text-center">{{ title || 'Player Auction' }}</div>
                </div>
                <div class="event-stats flex-center d-flex flex-column" :class="{'w-0': wideRight}">
                    <div>{{ autoSettings?.drafted }} / {{ autoSettings?.totalSlots }} {{ autoSettings?.drafted === 1 ? 'player' : 'players' }} signed</div>
                    <div>{{ autoSettings?.slotsRemaining }} {{ autoSettings?.slotsRemaining === 1 ? 'slot' : 'slots' }} remaining</div>
                    <div>{{ autoSettings?.undraftedPlayerCount }} {{ autoSettings?.undraftedPlayerCount === 1 ? 'player' : 'players' }} in the pool</div>
                    <div class="small">({{ (autoSettings?.totalDraftablePlayerCount - autoSettings?.totalSlots) }} {{ autoSettings?.totalDraftablePlayerCount - autoSettings?.totalSlots === 1 ? 'player' : 'players' }} {{ undraftedText || "won't be drafted" }})</div>
                    <div v-if="stats && stats.allPlayers">{{ stats.remainingEligiblePlayers }} / {{ stats.allPlayers }} player{{ stats.remainingEligiblePlayers === 1 ? '' : 's' }} remaining</div>
                    <div v-if="stats && stats.remainingPlaces">{{ stats.remainingPlaces }} spot{{ stats.remainingPlaces === 1 ? '' : 's' }} remaining</div>
                    <div v-if="stats && stats.signedPlayers">{{ stats.signedPlayers }} player{{ stats.signedPlayers === 1 ? '' : 's' }} signed</div>
                </div>
            </div>
            <div class="player-middle d-flex flex-grow-1">
                <div class="player-info-holder w-100 flex-center flex-column position-relative">
                    <AuctionCountdown v-if="player" />
                    <transition name="color-block-fade">
                        <div v-if="blockColorCSS" class="color-block" :style="blockColorCSS"></div>
                    </transition>
                    <transition name="fade-right">
                        <RecoloredHero v-if="!showCaptainInfo && player && player.favourite_hero" :theme="heroColor" :hero="player.favourite_hero" />
                    </transition>
                    <transition name="fade-right" mode="out-in">
                        <div v-if="player" class="player-info">
                            <div v-if="playerHighlightEventTeams?.length" class="player-highlight-event-teams d-flex flex-center gap-2">
                                <div v-for="team in playerHighlightEventTeams" :key="team.id" class="player-highlight-team flex-center">
                                    <!--                                    <div class="player-highlight-team-logo bg-center" :style="resizedImage(team?.theme, ['default_logo', 'small_logo'], 'w-200')"></div>-->
                                    <theme-logo
                                        class="player-highlight-team-logo bg-center"
                                        :theme="team?.theme"
                                        logo-size="w-200"
                                        border-width=".3em"
                                        icon-padding=".5em" />
                                </div>
                            </div>
                            <div class="player-name">{{ player.name }}</div>
                            <div class="player-extras">
                                <div v-if="player.role && !player.eligible_roles" class="player-role" v-html="getRoleSVG(player.role)"></div>


                                <div class="player-eligible-roles d-flex">
                                    <div
                                        v-for="role in playerRoles(player?.eligible_roles)"
                                        :key="role?.role"
                                        class="role"
                                        :class="{'ineligible': !role.eligible, 'eligible': role.eligible, 'primary': role.role === player.role}"
                                        v-html="getRoleSVG(role?.role)"></div>
                                </div>
                                <div v-if="accolades.length" class="accolades">
                                    <ContentThing
                                        v-for="accolade in accolades"
                                        :key="accolade.id"
                                        :thing="accolade"
                                        type="event"
                                        :link-to="accolade.event"
                                        :theme="accolade.event && accolade.event.theme"
                                        :show-logo="true"
                                        :text="accolade.player_text" />
                                </div>
                                <div v-if="showCaptainInfo" class="player-captain-info">
                                    {{ player.pronouns }}
                                    <br>
                                    {{ player.draft_data }}
                                </div>
                                <div
                                    v-for="group in groupedTeams"
                                    :key="group.group"
                                    class="player-teams d-flex flex-wrap flex-center"
                                    :class="`group-${group.group}`">
                                    <PlayerTeamDisplay v-for="team in group.teams" :key="team.id" :team="team" />
                                </div>
                            </div>
                        </div>
                        <div v-else-if="hydratedRecentSignings?.length" class="recents w-100">
                            <div class="recents-title">Recent signings</div>
                            <div class="recents-list d-flex flex-column-reverse gap-3">
                                <div v-for="(signing, i) in hydratedRecentSignings" :key="i" class="recent flex-center">
                                    <ThemeLogo class="recent-logo" :theme="signing.team?.theme" logo-size="h-100" />
                                    <div class="recent-name">{{ signing.player?.name }}</div>
                                    <div class="recent-amount">{{ money(signing.amount) }}</div>
                                </div>
                            </div>
                        </div>
                    </transition>
                </div>
                <div class="bids flex-column-reverse d-flex justify-content-end" :class="{ 'has-bids': (player || bids.length) }">
                    <transition-group name="fade-down">
                        <div
                            v-for="(bid, i) in bids"
                            :key="i"
                            class="bid d-flex align-content-center"
                            :style="getTheme(bid.teamID)">
                            <div class="team-logo flex-center">
                                <div class="logo-inner bg-center" :style="getLogo(bid.teamID)"></div>
                            </div>
                            <div class="team-text flex-center ml-2">{{ money(bid.amount) }}</div>
                        </div>
                    </transition-group>
                </div>
            </div>
            <!--            <div class="left-bottom flex-center">bottom</div>-->
        </div>
        <div class="right flex-shrink-0 flex-center" :class="{'all-teams': wideRight}">
            <!--            <div class="team-list-holder" v-if="['teams', 'teams-1', 'teams-2'].includes(rightDisplay)" :key="rightDisplay">-->
            <!--                <transition-group tag="div" name="move" class="team-lists">-->
            <!--                    <TeamPlayerList v-for="team in displayTeams" :team="team" :key="team.id" :leading="leadingBid" :auction-settings="auctionSettings" />-->
            <!--                </transition-group>-->
            <!--            </div>-->
            <!--            <div class="team-lists" v-if="['teams', 'teams-1', 'teams-2'].includes(rightDisplay)">-->
            <!--                <TeamPlayerList v-for="team in displayTeams" :team="team" :key="team.id" :leading="leadingBid" :auction-settings="auctionSettings" />-->
            <!--            </div>-->
            <transition name="fade-left" mode="out-in">
                <transition-group
                    v-if="rightDisplay === 'teams-1' || rightDisplay === 'teams-2' || rightDisplay === 'teams'"
                    :style="background"
                    tag="div"
                    name="move"
                    class="team-rows-holder">
                    <div v-for="row in displayTeamRows" :key="row.i" class="team-row">
                        <TeamPlayerList
                            v-for="team in row.teams"
                            :key="team.id"
                            :team="team"
                            :auction-settings="auctionSettings" />
                    </div>
                </transition-group>
                <div v-else-if="rightDisplay === 'sign-focus'" key="signed-focus" :style="background" class="team-focus h-100">
                    <SignedTeamList :team="signedTeam" :amount="signAmount" :signed-player="socketPlayerID" :auction-settings="auctionSettings" />
                </div>
                <div v-else-if="rightDisplay === 'bid-focus'" key="bid-focus" :style="background" class="bid-focus flex-center h-100 w-100">
                    <BidFocus :teams="teams" :bids="bids" :auction-settings="auctionSettings" />
                </div>
                <div v-else-if="rightDisplay === 'team-focus'" key="team-focus" :style="background" class="team-focus">
                    <TeamFocus :team="highlightedTeam" :auction-settings="auctionSettings" />
                </div>
                <div v-else-if="rightDisplay === 'bidding-war'" key="bidding-war" :style="background" class="bidding-war">
                    <BiddingWar :teams="biddingWar" :leading="leadingBid" :auction-settings="auctionSettings" />
                </div>
                <AuctionLeaderboard
                    v-else-if="rightDisplay === 'leaderboard'"
                    key="leaderboard"
                    :players="signedPlayers"
                    :style="background"
                    class="leaderboard w-100 h-100 flex-center" />
                <AuctionTeamsOverview
                    v-else-if="rightDisplay === 'teams-overview'"
                    key="teams-overview"
                    :auction-settings="auctionSettings"
                    :teams="teams"
                    :style="background" />
            </transition>
        </div>
    </div>
</template>

<script>
import { socket } from "@/socket";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import TeamPlayerList from "./TeamPlayerList";
import { cleanID, getAuctionMax, getRoleSVG, money } from "@/utils/content-utils";
import PlayerTeamDisplay from "./PlayerTeamDisplay";
import { sortEvents } from "@/utils/sorts";
import SignedTeamList from "@/components/broadcast/auction/SignedTeamList";
import { logoBackground1, themeBackground1 } from "@/utils/theme-styles";
import BidFocus from "./BidFocus";
import TeamFocus from "@/components/broadcast/auction/TeamFocus";
import BiddingWar from "@/components/broadcast/auction/BiddingWar";
import { resizedImage } from "@/utils/images";
import AuctionCountdown from "@/components/broadcast/auction/AuctionCountdown";
import ContentThing from "@/components/website/ContentThing";
import RecoloredHero from "@/components/broadcast/RecoloredHero";
import AuctionLeaderboard from "@/components/broadcast/auction/AuctionLeaderboard.vue";
import AuctionTeamsOverview from "@/components/broadcast/auction/AuctionTeamsOverview.vue";
import ThemeLogo from "@/components/website/ThemeLogo.vue";

export default {
    name: "AuctionOverlay",
    components: { ThemeLogo, AuctionTeamsOverview, AuctionLeaderboard, RecoloredHero, TeamPlayerList, PlayerTeamDisplay, SignedTeamList, BidFocus, TeamFocus, BiddingWar, AuctionCountdown, ContentThing },
    props: ["broadcast", "category", "title", "showCaptainInfo", "undraftedText"],
    data: () => ({
        tick: 0,
        socketPlayer: null,
        socketPlayerID: null,
        bids: [],
        justSignedTeamID: null,
        signedPlayer: null,
        signAmount: null,
        biddingActive: false,
        stats: null,
        auctionServerConnected: true,
        auctionState: "NOT_CONNECTED",
        recentSignings: []
    }),
    computed: {
        hydratedRecentSignings() {
            return this.recentSignings.map(({ teamID, playerID, amount }) => ({
                amount,
                team: ReactiveRoot(teamID, {
                    "theme": ReactiveThing("theme")
                }),
                player: ReactiveRoot(playerID),
            }));
        },
        wideRight() {
            return this._broadcast?.auction_display === "All teams" && this.rightDisplay === "teams";
        },
        autoSettings() {
            let totalSlots = 0;
            let drafted = 0;
            let slotsRemaining = 0;
            const playersEachTeam = this.auctionSettings?.each_team ?? 7;

            (this.teams || []).forEach(team => {
                totalSlots += playersEachTeam;
                const playerCount = (team?.players || []).length ?? 0;
                drafted += playerCount;
                slotsRemaining += (playersEachTeam - playerCount);
            });

            const draftablePlayerIDs = this.broadcast?.event?.draftable_players || [];
            const preDraftedPlayerIDs = [];
            const draftedPlayerIDs = [];
            const undraftedPlayerIDs = [];

            draftablePlayerIDs.forEach(id => {
                if ((this.preDraftedTeams).some(team => team?.players?.some(p => cleanID(p.id) === cleanID(id)))) {
                    preDraftedPlayerIDs.push(id);
                } else if (this.teams.some(team => team?.players?.some(p => cleanID(p.id) === cleanID(id)))) {
                    draftedPlayerIDs.push(id);
                } else {
                    undraftedPlayerIDs.push(id);
                }
            });

            console.log("player IDs", {
                preDraftedPlayerIDs,
                draftedPlayerIDs,
                undraftedPlayerIDs
            });

            return {
                totalSlots,
                drafted,
                slotsRemaining,
                totalPreDraftedPlayerCount: preDraftedPlayerIDs.length,
                totalDraftablePlayerCount: draftablePlayerIDs.length - preDraftedPlayerIDs.length,
                undraftedPlayerCount: undraftedPlayerIDs.length
            };
        },
        // playersRemaining() {
        //     let num = 0;
        //     this.teams.forEach(team => {
        //         if (team.players.length >= 7) return;
        //         num += (7 - team.players.length);
        //     });
        //     return num;
        // },
        background() {
            return logoBackground1(this.broadcast?.event);
        },
        auctionSettings() {
            const json = this.broadcast?.event?.blocks;
            if (!json) return {};
            try {
                return JSON.parse(json)?.auction;
            } catch (e) {
                console.warn(e);
                return {};
            }
        },
        broadcastPlayerID() {
            if (!this.biddingActive) return null;
            if (!this.broadcast?.highlight_player) return null;
            return this.broadcast?.highlight_player[0];
        },
        playerID() {
            // if (!this.biddingActive && !this.justSigned) return null;
            if (this.socketPlayerID) return this.socketPlayerID;
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
        playerHighlightEventTeams() {
            if (!this._broadcast?.highlight_event?.length) return [];
            if (!this.player?.member_of?.length) return [];
            return this._broadcast.highlight_event.map(event => this.player.member_of.find(t => t.event?.id === event?.id)).filter(Boolean);
        },
        accolades() {
            if (!this.player) return [];

            return [
                // team things
                ...(this.player.member_of ? [].concat(...this.player.member_of.map(e => e.accolades).filter(e => e?.show_for_players)) : []),
                ...(this.player.accolades ? this.player.accolades : [])
            ];
        },
        highlightedTeamID() {
            if (!this.broadcast?.highlight_team) return null;
            return this.broadcast?.highlight_team[0];
        },
        highlightedTeam() {
            if (!this.highlightedTeamID) return;
            return ReactiveRoot(this.highlightedTeamID, {
                players: ReactiveArray("players"),
                theme: ReactiveThing("theme")
            });
        },
        playerTeams() {
            if (!this.player?.member_of) return [];
            return this.player.member_of.filter(t => {
                if (!t?.event) return false;
                if (t.minor_team) return false;
                if (!t.ranking_sort) return false;
                return true;
            }).sort((a, b) => sortEvents(a.event, b.event));
        },
        groupedTeams() {
            if (this.showCaptainInfo) return [];
            if (!this.broadcast?.event?.game) return [{ teams: this.playerTeams, group: "all" }];
            const sameGame = [];
            const diffGame = [];
            this.playerTeams.forEach(team => {
                if (team.game?.[0] === this.broadcast.event.game) {
                    sameGame.push(team);
                } else {
                    diffGame.push(team);
                }
            });
            return [
                { teams: sameGame, group: "same" },
                { teams: diffGame, group: "diff" }
            ];
        },
        eventLogo() {
            if (!this._broadcast?.event?.theme) return {};
            return resizedImage(this._broadcast.event.theme, ["default_logo", "default_wordmark"], "h-200");
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
                }),
                highlight_event: ReactiveArray("highlight_event")
            });
        },
        rightDisplay() {
            if (this.justSigned) return "sign-focus";
            if (this.biddingWar && !this.showCaptainInfo) return "bidding-war";
            if (this._broadcast?.auction_display === "Leaderboard") return "leaderboard";
            if (this._broadcast?.auction_display === "Team overview") return "teams-overview";
            if (this.highlightedTeam) return "team-focus";
            if (this.bids && this.biddingActive) {
                if (this.showCaptainInfo) return "bid-focus";
                if (this.bids.length >= 12) return "bid-focus";
                if (this.leadingBid && this.leadingBid.amount >= Math.min(this.average || 0, 200)) return "bid-focus";
            }
            // if (this.teams?.length <= 8) return "teams";
            if (this.teams?.length) return "teams";
            return null;
        },
        average() {
            if (!this.teams) return 175;
            const balances = this.teams.map(t => t.balance || 0);
            const sum = balances.reduce((a, b) => a + b, 0);
            const avg = (sum / balances.length) || 0;
            return avg;
        },
        preDraftedTeams() {
            if (!this._broadcast?.event?.teams?.length) return [];
            let teams = this._broadcast.event.teams;
            if (this.category) teams = teams.filter(t => !this.category || (t.team_category?.includes(";") ? t.team_category.split(";")[1] : t.team_category) !== this.category);
            return teams;
        },
        teams() {
            if (!this._broadcast?.event?.teams?.length) return null;
            let teams = this._broadcast.event.teams;// .filter(t => t.players?.length);
            if (this.category) teams = teams.filter(t => (t.team_category?.includes(";") ? t.team_category.split(";")[1] : t.team_category) === this.category);

            return teams.sort((a, b) => a.draft_order - b.draft_order);// .filter(t => t.players.length !== 7);
        },
        displayTeams() {
            if (!this.teams?.length) return [];
            const teams = this.teams;
            // return teams;

            return teams;
        },
        signedPlayers() {
            const players = [];
            (this.teams || []).forEach(team => {
                (team.players || []).forEach(player => {
                    if (player.auction_price) {
                        players.push({
                            ...player,
                            _this_event_team: team
                        });
                    }
                });
            });
            console.log(players);
            return players.sort((a, b) => b.auction_price - a.auction_price);
        },
        displayTeamRows() {
            if (!this.teams?.length) return [];
            const teams = this.teams.filter(team => {
                const isFull = (team?.players?.length >= (this.auctionSettings?.each_team || getAuctionMax()));
                if (this._broadcast?.auction_display === "Not full teams") {
                    return !isFull;
                } else if (this._broadcast?.auction_display === "Full teams") {
                    return isFull;
                }
                return true;
            });
            const maxRows = 4;
            const perRow = this._broadcast?.auction_display === "All teams" ? Math.ceil(teams.length / maxRows) : 2;

            console.log({ teams: teams.length, maxRows, perRow });

            const rowCount = (Math.ceil(teams.length / perRow));
            const rows = [...Array(rowCount).keys()];
            const start = this.tick % rowCount;


            // console.log({ start, tick: this.tick, rowCount, maxRows, rowSlides: (rowCount + (maxRows - 1)) });

            let displayRows = rows.slice(start, start + maxRows);

            if (teams.length <= perRow * maxRows) {
                displayRows = rows;
            }

            if (displayRows.length !== maxRows) {
                const diff = maxRows - displayRows.length;

                displayRows = [
                    ...displayRows,
                    ...rows.slice(0, diff)
                ];
            }


            const _rows = [];

            displayRows.forEach(row => {
                const newRow = {
                    i: row,
                    teams: []
                };

                for (let i = 0; i < perRow; i++) {
                    if (teams[(row * perRow) + i]) newRow.teams.push(teams[(row * perRow) + i]);
                }
                _rows.push(newRow);
            });

            return _rows;
            // if (this.rightDisplay === "teams-1") teams = teams.slice(0, 8);
            // if (this.rightDisplay === "teams-2") teams = teams.slice(8, 16);
        },
        signedTeam() {
            if (!this.justSignedTeamID) return null;
            return ReactiveRoot(this.justSignedTeamID, {
                theme: ReactiveThing("theme"),
                players: ReactiveArray("players")
            });
        },
        heroColor() {
            return this.signedTeam?.theme || this.broadcast?.event?.theme;
        },
        blockColorCSS() {
            if (!this.signedTeam?.theme?.color_theme) return null;
            return {
                backgroundImage: `linear-gradient(to top, ${this.signedTeam?.theme?.color_theme}, transparent)`
            };
        },
        leadingBid() {
            if (!this.bids) return null;
            return this.bids[this.bids.length - 1];
        },
        biddingWar() {
            // if (!this.biddingActive) return false;
            const count = 6;
            const latestBids = this.bids.slice(Math.max(this.bids.length - count, 0));
            if (latestBids.length !== count) return false;
            const teams = [];
            console.log("latest bids", latestBids);
            latestBids.forEach((bid) => {
                if (!teams.find(t => cleanID(t?.id) === cleanID(bid.teamID))) {
                    teams.push(this.teams.find(t => cleanID(t.id) === cleanID(bid.teamID)));
                }
            });
            console.log("bidding war teams", teams);
            if (teams.length === 2) return teams;
            return null;
        },
        eventID() {
            return cleanID(this._broadcast?.event?._original_data_id);
        },
        justSigned() {
            if (!this.justSignedTeamID) return null;
            return this.teams.find(t => t.id === this.justSignedTeamID);
        }
    },
    methods: {
        resizedImage,
        themeBackground1,
        money,
        getRoleSVG,
        getLogo(teamID) {
            return resizedImage(this.teams.find(t => t.id === cleanID(teamID))?.theme, ["small_logo", "default_logo"], "h-100");
        },
        getTheme(teamID) {
            // console.log(teamID, this.teams.find(t => t.id === cleanID(teamID)));
            return logoBackground1(this.teams.find(t => t.id === cleanID(teamID)));
        },
        sendToAuctionServer(event, data) {
            console.log("[socket]", "sending", event, data);
            socket.emit(event, {
                auctionID: this.eventID,
                ...data
            });
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
        }
    },
    watch: {
        broadcastPlayerID() {
            if (!this.socketPlayer) return;
            if (this.broadcastPlayerID !== null && this.broadcastPlayerID === this.socketPlayer.id) {
                this.socketPlayer = null;
            }
        },
        eventID: {
            immediate: true,
            handler(eventID) {
                console.log("eventID", eventID, this._broadcast);
                if (!eventID) return;
                console.log("Socket client subscribing", `auction:${eventID}`);
                this.sendToAuctionServer("auction:subscribe");
            }
        }
    },
    sockets: {
        auction_welcome({ auctionID, ready, state, activePlayerID }) {
            if (auctionID !== this.eventID) return console.warn("Auction welcome from unknown source", auctionID);
            this.auctionServerConnected = true;
            this.auctionState = state;
            if (state === "IN_ACTION" && activePlayerID) {
                this.socketPlayerID = activePlayerID;
            }
            console.log("auction welcome", { auctionID, ready, state });
        },
        auction_state({ state, oldState }) {
            this.auctionState = state;
            if (["RESTRICTED", "READY"].includes(state)) {
                this.socketPlayerID = null;
                this.justSignedTeamID = null;
                this.signAmount = null;
                this.bids = [];
            }
        },
        auction_error(error) {
            console.warn("Auction error", error);
        },


        auction_start({ activePlayerID }) {
            console.log("auction_start", activePlayerID);
            this.state = "IN_ACTION";
            this.socketPlayerID = activePlayerID;
            this.justSignedTeamID = null;
            this.biddingActive = true;
        },
        auction_pre_auction({ activePlayerID }) {
            this.state = "PRE_AUCTION";
            this.socketPlayerID = activePlayerID;
            this.justSignedTeamID = null;
            this.biddingActive = false;
        },
        auction_post_auction({ activePlayerID }) {
            this.state = "POST_AUCTION";
            this.justSignedTeamID = this.leadingBid?.teamID;
            this.signAmount = this.leadingBid?.amount;
            console.log("POST AUCTION SIGNED", this.leadingBid);


            this.recentSignings.push({ playerID: activePlayerID, teamID: this.leadingBid?.teamID, amount: this.leadingBid?.amount });
            if (this.recentSignings?.length > 6) {
                this.recentSignings.shift();
            }

            console.log("recent", this.recentSignings);
        },
        auction_bids(bids) {
            console.log("auction_bids", bids);
            this.bids = bids;
        },
        auction_signed({ player, team, amount }) {
            console.log("signed", { player, team, amount });
            this.signAmount = amount;
            this.biddingActive = false;
            this.signedPlayer = player;
            this.justSignedTeamID = team;
            // setTimeout(() => {
            //     // TODO: uncomment
            //     if (this.justSigned) {
            //         this.socketPlayer = null;
            //         this.justSigned = null;
            //         this.signedPlayer = null;
            //         this.bids = [];
            //     }
            // }, 20 * 1000);
        },
        auction_stats(stats) {
            console.log(stats);
            this.stats = stats;
        }
    },
    mounted() {
        socket.emit("subscribe", "auction");

        setInterval(() => {
            this.tick++;
            // if (this.tick >= 4) this.tick = 0;
        }, 6000);
    },
    head() {
        return {
            title: `Auction ${this.category || ""} | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

<style scoped>
    .auction-overlay {
        background-color: #222;
        font-family: "SLMN-Industry", "Industry", sans-serif;
        color: white;
        display: flex;
    }
    .team-lists {
        display: grid;
        /*grid-auto-flow: column;*/
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
        width: 600px;
        background-color: rgba(24,24,24);
        transition: width 250ms;
    }
    .right.all-teams {
        width: 900px;
    }
    .event-logo-holder  {
        width: 300px;
    }
    .event-stats {
        width: 350px;
        overflow: hidden;
        transition: width 250ms;
    }
    .event-stats.w-0 {
        width: 0;
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
        margin-bottom: 24px;
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

    .event-stats {
        font-size: 24px;
        text-align: center;
        font-weight: bold;
    }
    .event-stats div {
        margin: 2px 0;
    }
    .group-diff {
        transform: scale(0.75);
    }

    .team-lists {
        position: absolute;
        width: 100%;
        height: 100%;
    }
    .right {
        position: relative;
        /*overflow-x: hidden;*/
    }

    .scroll-enter-active, .scroll-leave-active {
        transition: all 500ms ease;
    }
    .scroll-enter-from { transform: translate(0%, 100%) }
    .scroll-leave-to { transform: translate(0%, -100%) }
    .scroll-enter-to,
    .scroll-leave-from {
        transform: translate(0,0)
    }


    .fade-scroll-enter-active, .fade-scroll-leave-active {
        transition: all 500ms ease;
    }
    .fade-scroll-enter-from {
        opacity: 0;
        transform: translate(0, 30px)
    }
    .fade-scroll-leave-to {
        opacity: 0;
        transform: translate(0, -30px)
    }
    .fade-scroll-enter-to,
    .fade-scroll-leave-from {
        transform: translate(0, 0%)
    }

    .move-enter-active,
    .move-leave-active,
    .move-move {
        transition: transform 800ms ease-in-out;
    }
    .move-enter-active,
    .move-leave-active {
        position: absolute;
        /*width: 50%;*/
        /*width: 270px;*/
        /*height: 260px;*/
    }
    .move-leave-to {
        transform: translate(0, -105%);
    }
    .move-enter-active {
        bottom: 0;
    }
    /*.move-enter-active:nth-of-type(10) {*/
    /*    right: 0;*/
    /*}*/
    /*.move-leave-active:nth-of-type(2) {*/
    /*    right: 0;*/
    /*}*/
    .move-enter-from {
        transform: translate(0, 105%);
    }
    .team-list-holder, .team-rows-holder {
        width: 100%;
        height: 100%;
        position: relative;
    }
    .team-row {
        display: flex;
        width: 100%;
        height: calc(25% - 10px);
        margin: 5px 0;
    }

    .team-rows-holder {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .team-player-list {
        width: calc(50% - 20px);
        height: 100%;
    }


    .fade-right-enter-active,
    .fade-right-leave-active {
        transition: opacity 500ms ease, transform 500ms ease;
    }
    .fade-right-enter-from, .fade-right-leave-to {
        transform: translate(-100%, 0);
        opacity: 0;
    }

    .fade-left-enter-active,
    .fade-left-leave-active {
        transition: opacity 500ms ease, transform 500ms ease;
    }
    .fade-left-enter-from, .fade-left-leave-to {
        transform: translate(100%, 0);
        opacity: 0;
    }
    .fade-up-enter-active,
    .fade-up-leave-active {
        transition: opacity 500ms ease, transform 500ms ease;
    }
    .fade-up-enter-from, .fade-up-leave-to {
        transform: translate(0, 100%);
        opacity: 0;
    }
    .fade-down-enter-active,
    .fade-down-leave-active {
        transition: opacity 500ms ease, transform 500ms ease;
    }
    .fade-down-enter-from, .fade-down-leave-to {
        transform: translate(0, -100%);
        opacity: 0;
    }
    .fade-down-leave-from, .fade-down-enter-to {
        transform: translate(0, 0);
        opacity: 1;
    }

    .bids {
        transition: background-color 500ms ease, width 500ms ease;
        background-color: rgba(0,0,0,0);
    }
    .bids.has-bids {
        background-color: rgba(0,0,0,0.15);
    }
    .bids:not(.has-bids) {
        width: 0;
        overflow: hidden;
    }
    .team-focus {
        height: 100%;
        width: 100%;
    }

    .right>div {
        box-shadow: 0px 0px 7px 0px rgba(0,0,0,0.6);
    }
    .event-top {
        box-shadow: 0px 0px 7px 0px rgba(0,0,0,0.6);
    }
    .player-middle {
        overflow: hidden;
    }

    .bidding-war {
        width: 100%;
        height: 100%;
    }

    .bids span {
        display: flex !important;
        flex-direction: column !important;
        flex-direction: column-reverse !important;
    }
    .accolades {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 22px;
        flex-wrap: wrap;
        margin-bottom: 32px;
        padding: 0 24px;
    }
    .player-captain-info {
        text-align: center;
        font-size: 32px;
        white-space: pre-wrap;
    }


    .auction-overlay .recolored-hero {
        position: absolute;
        left: -5vw !important;
        height: 100vh !important;
        bottom: -15vh !important;
        width: 58vw !important;
        z-index: 0;
        opacity: 0.7;
    }


    .auction-overlay .color-holder {
        width: 100% !important;
    }
    .auction-overlay .hero-image-base {
        background-size: contain !important;
    }
    .auction-overlay .color-holder,
    .auction-overlay .color-holder canvas {
        object-fit: contain !important;
    }

    .auction-overlay .player-info,
    .auction-overlay .countdown-holder {
        z-index: 2;
    }

    .auction-overlay .event-stats {
        display: none;
    }

    .auction-overlay .player-middle .player-name {
        text-shadow: 0 0 8px #222222, 0 0 2px #222222;
    }

    .team-row .player-list .player {
        font-size: 16px !important;
    }
    .player-info .player-role {
        height: 60px;
        margin-bottom: 20px;
    }
    .color-block {
        position: absolute;
        width: 100%;
        height: 100%;
        opacity: 0.5;
    }
    .color-block-fade-enter-active, .color-block-fade-leave-active { transition: opacity 750ms ease; }
    .color-block-fade-enter-from, .color-block-fade-leave-to { opacity: 0; }
    .color-block-fade-enter-to, .color-block-fade-leave-from { opacity: 0.5; }


    .player-extras {
        max-height: 630px;
    }

    .player-info-holder {
        padding-top: 48px;
    }

    .role.ineligible {
        opacity: 0.5;
        transform: scale(0.6)
    }
    .role.eligible:not(.primary) {
        transform: scale(0.8)
    }
    .player-eligible-roles {
        justify-content: center;
        margin-bottom: 20px;
    }
    .player-eligible-roles .role {
        width: 4em;
        position: relative;
    }
    .role.ineligible:after {
        content: "❌";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 2em;
        opacity: 0.8;
    }

    .recents {
        font-size: 2.5em;
        gap: .5em;
        margin-bottom: 1em;
        opacity: 0.8;
    }

    .recent {
        display: flex;
        gap: .5em;
    }

    .recents-title {
        font-weight: bold;
        text-transform: uppercase;
        text-align: center;
        font-size: 1.5em;
        margin-bottom: .25em;
    }

    .recent-logo {
        width: 2.5em;
        height: 2em;
    }

    .recent-name {
        min-width: 8em;
        font-weight: bold;
    }
    .recent-amount {
        min-width: 3em;
        text-align: right;
    }
    .player-highlight-event-teams {
        display: flex;
    }

    .player-highlight-team {
        width: 5em;
        height: 4em;
    }

    .player-highlight-team-logo {
        width: 90%;
        height: 90%;
    }
</style>

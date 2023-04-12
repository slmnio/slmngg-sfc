const Cache = require("./cache");
const { cleanID, dirtyID,
    updateRecord
} = require("./action-utils/action-utils");
const { isEventStaffOrHasRole } = require("./action-utils/action-permissions");

module.exports = class Auction {
    constructor(eventData, io, auctionData) {
        this.io = io;
        this.id = cleanID(eventData?.id);
        this.event = eventData;
        this.state = auctionData?.public ? "RESTRICTED": "INACTIVE";
        this.isRestricted = true;

        this.activePlayerID = null;

        this.wait = {
            beforeFirstBids: auctionData?.time?.beforeFirstBids ?? 5,
            afterInitialBid: auctionData?.time?.afterInitialBid ?? 20,
            afterSubsequentBids: auctionData?.time?.afterSubsequentBids ?? 15,
            afterSaleNextAutoPlayer: auctionData?.time?.afterSaleNextAutoPlayer ?? 10,
            preAuction: auctionData?.time?.preAuction ?? 5,
            postAuction: auctionData?.time?.preAuction ?? 10,
        };

        this.money = {
            defaultStartingBid: auctionData?.money?.defaultStartingBid ?? 1,
            minimumBidIncrement: auctionData?.money?.minimumBidIncrement ?? 1,
            maximumBidIncrement: auctionData?.money?.maximumBidIncrement ?? 50,
            unlockAfterSigning: auctionData?.money?.unlockAfterSigning ?? 10,
        };

        this.playerNumbers = {
            maximumPlayerCount: auctionData?.each_team ?? auctionData?.eachTeam ?? 7
        };

        this.bidData = [];
        this.timerTimeout = null;

        this.log("New auction", this.id);

        let existingSockets = [...(this.io.of("/").adapter.rooms.get(this.socketIdentifier) || [])];
        existingSockets.forEach(id => this.welcomeSocket(id));
    }

    welcomeSocket(socketID) {
        this.io.to(socketID).emit("auction_welcome", {
            auctionID: this.id,
            ready: true,
            state: this.state,
            activePlayerID: this.state === "IN_ACTION" && this.activePlayerID
        });
        this.io.to(socketID).emit("auction_bids", this.bidData);
    }

    update(data, auctionData) {
        if (!auctionData) return;
        // Data update from airtable/internal systems
        this.wait.beforeFirstBids = auctionData?.time?.beforeFirstBids ?? 5;
        this.wait.afterInitialBid = auctionData?.time?.afterInitialBid ?? 20;
        this.wait.afterSubsequentBids = auctionData?.time?.afterSubsequentBids ?? 15;
        this.wait.afterSaleNextAutoPlayer = auctionData?.time?.afterSaleNextAutoPlayer ?? 10;
        this.wait.preAuction = auctionData?.time?.preAuction ?? 5;
        this.wait.postAuction = auctionData?.time?.preAuction ?? 10;

        this.money.defaultStartingBid = auctionData?.money?.defaultStartingBid ?? 1;
        this.money.minimumBidIncrement = auctionData?.money?.minimumBidIncrement ?? 1;
        this.money.maximumBidIncrement = auctionData?.money?.maximumBidIncrement ?? 50;

        this.playerNumbers.maximumPlayerCount = auctionData?.each_team ?? auctionData?.eachTeam ?? 7;
        this.log("Auction data update", auctionData);
    }

    handleStateChange(oldState, newState) {
        this.log(`State change handler ${oldState} -> ${newState}`);

        if (oldState === "IN_ACTION" && this.activePlayerID) {
            this.log("Auction no longer in action, should remove active player");
        }
    }

    setState(state) {
        if (state === this.state) return this.log(`Attempted to re-set same state [${state}]`);
        this.log(`State: ${state}`);
        this.broadcastData("auction_state", {
            auctionID: this.id,
            state,
            oldState: this.state,
            activePlayerID: state === "IN_ACTION" && this.activePlayerID
        });
        this.handleStateChange(this.state, state);
        this.state = state;
    }

    broadcastData(event, data) {
        console.log("emit", { event, data });
        this.io.to(this.socketIdentifier).emit(event, data);
    }

    sendError(socket, error) {
        socket.emit("auction_error", error);
    }

    get socketIdentifier() { return `auction:${this.id}`; }
    log(...data) { console.log(`[Auction] [${this.socketIdentifier}]`, ...data); }

    /**
     * @param {Socket} socket
     * @param {string} socketEvent
     * @param {{ auctionID: string, user: UserData | null, [key: string]: any } } data
     */
    async handleSocketEvent(socket, socketEvent, data) {
        this.log(socketEvent, {...data, user: data.user ? data.user?.airtable?.name : null });

        if (socketEvent === "auction:subscribe") return this.events.subscribe(socket, data);
        if (socketEvent === "auction:admin_set_state") return this.events.adminSetState(socket, data);
        if (socketEvent === "auction:request_start_player") return this.events.requestStartPlayer(socket, data);
        if (socketEvent === "auction:bid") return this.events.bid(socket, data);
    }

    get events() {
        return {
            subscribe: (socket) => {
                socket.join(this.socketIdentifier);
                this.welcomeSocket(socket.id);
            },
            adminSetState: async (socket, data) => {
                if (!data.user) {
                    this.sendError(socket, "You need to be logged in to change auction state");
                    return this.log("Cannot set state without user data");
                }
                if (!(await this.userIsAdmin(data.user))) {
                    this.sendError(socket, "You don't have permission to edit auctions");
                    return this.log("User doesn't have auction permission");
                }
                if (data.state === "RESTRICTED") {
                    this.isRestricted = true;
                } else if (data.state === "READY") {
                    this.isRestricted = false;
                }
                this.setState(data.state);
            },
            requestStartPlayer: async (socket, data) => {
                if (!data.user) {
                    this.sendError(socket, "You need to be logged in to interact with auctions");
                    return this.log("Cannot start a player without user data");
                }

                const startingBidAmount = (data.startingBid && (await this.userIsAdmin(data.user))) ? parseInt(data.startingBid) : Math.max(this.money.defaultStartingBid, this.money.minimumBidIncrement);
                let startPlayerError = await this.errorStartingPlayer(data.user, data.teamID, data.playerID, startingBidAmount);
                if (startPlayerError) {
                    this.sendError(socket, startPlayerError);
                    return this.log("Start player error", startPlayerError);
                }

                this.startPlayer(data.playerID, { teamID: data.teamID, amount: startingBidAmount, starting: true });
            },
            bid: async (socket, data) => {
                if (!data.user) {
                    this.sendError(socket, "You need to be logged in to interact with auctions");
                    return this.log("Cannot bid without user data");
                }

                let team = await Cache.get(data.teamID);
                if (!team) return "Unknown team";

                let amount = parseInt(data.amount);
                if (!this.bids.isInRange(amount)) {
                    if (amount > (this.bids.getLeading()?.amount || 0) &&
                        (amount - this.bids.getLeading().amount <= this.money.maximumBidIncrement) &&
                        amount === (team.balance || 0)) {
                        this.log(`Letting team ${team.name} bid ${amount} since it's all their money ${team.balance}`);
                    } else {
                        return this.sendError(socket, `The bid $${amount} is out of range`);
                    }
                }
                let bidError = await this.errorBiddingForPlayer(data.user, data.teamID, this.activePlayerID, amount, { ignoreUser: false });
                if (bidError) {
                    this.sendError(socket, bidError);
                    return this.log("Bid error", bidError);
                }


                this.timer.proc();
                this.bids.push({
                    amount,
                    teamID: data.teamID
                });
            }
        };
    }


    async userIsAdmin(user) {
        return await isEventStaffOrHasRole(user, this.event, "Auction Admin", ["Full broadcast permissions", "Can edit any auction"]);
    }
    async userCanActForTeam(user, teamID) {
        let team = await Cache.get(teamID);
        if (!team?.draft_order) {
            this.log("Cannot act (draft)", team?.draft_order);
            return false;
        }
        if (team.event?.[0] !== dirtyID(this.event.id)) {
            this.log("Cannot act (event)", { teamEvent: team.event?.[0], auctionEvent: this.event.id });
            return false;
        }

        return ((team.captains || []).includes(dirtyID(user.airtable.id)) ||
                (team.staff || []).includes(dirtyID(user.airtable.id)) ||
                (team.controllers || []).includes(dirtyID(user.airtable.id)));
    }
    async errorStartingPlayer(user, teamID, playerID, startAmount) {
        const isAdmin = await this.userIsAdmin(user);
        if (!(this.state === "READY" || (isAdmin && this.state === "RESTRICTED"))) return "Players can't be started in this auction state";

        let team = await Cache.get(teamID);
        if (!team) return "Unknown team";

        if (!(isAdmin || await this.userCanActForTeam(user, teamID))) {
            this.log("No act permission (start)", {  canAct: await this.userCanActForTeam(user, teamID) });
            return `You can't act for ${team.name}`;
        }
        let errorBidding = await this.errorBiddingForPlayer(user, teamID, playerID, startAmount, { ignoreUser: true });
        if (errorBidding) return errorBidding;

        // TODO: check auction order & user teams

    }

    async errorBiddingForPlayer(user, teamID, playerID, bidAmount, { ignoreUser }) {
        if (!ignoreUser && this.state !== "IN_ACTION") return "Bids can't be processed in this auction state";
        let team = await Cache.get(teamID);
        if (!team) return "Unknown team";

        if (!ignoreUser && !(await this.userCanActForTeam(user, teamID))) {
            this.log("No act permission (bid)", { ignoreUser, canAct: await this.userCanActForTeam(user, teamID) });
            return `You can't act for ${team.name}`;
        }

        if (this.playerNumbers.maximumPlayerCount && team.players?.length >= this.playerNumbers.maximumPlayerCount)
            return `${team.name} already has the maximum player count (${this.playerNumbers.maximumPlayerCount})`;

        if ((team.balance || 0) < bidAmount) {
            return `${team.name} doesn't have enough funds to bid for player at $${bidAmount}`;
        }

        // TODO: check auction order & player teams - are they eligible?


        return; // TODO: TESTING ONLY, REMOVE
    }

    get bids() {
        return {
            push: (item) => {
                this.bidData.push(item);
                console.log(item, this.bidData);
                this.broadcastData("auction_bids", this.bidData);
            },
            empty: () => {
                this.bidData = [];
                this.broadcastData("auction_bids", this.bidData);
            },
            getLeading: () => {
                if (!this.bidData.length) return null;
                return this.bidData[this.bidData.length - 1];
            },
            isInRange: (amount) => {
                let leadingBid = this.bids.getLeading();
                if (!leadingBid) return false;
                let diff = amount - leadingBid.amount;
                return diff >= this.money.minimumBidIncrement && diff <= this.money.maximumBidIncrement;
            }
        };
    }

    startPlayer(playerID, startingBid) {
        this.log("start", playerID, startingBid);

        this.activePlayerID = playerID;
        this.bids.push(startingBid);

        if (this.wait.preAuction) {
            this.setState("PRE_AUCTION");
            this.broadcastData("auction_pre_auction", { activePlayerID: playerID });
            this.timer.start();
        } else {
            this.startAuction();
        }
    }

    startAuction() {
        this.setState("IN_ACTION");
        this.broadcastData("auction_start", { activePlayerID: this.activePlayerID });
        this.timer.start();
    }

    async autoCloseAuction() {
        this.log("auto closing");
        // check for auto auction

        this.signPlayer(this.activePlayerID, this.bids.getLeading());

        if (this.wait.postAuction) {
            this.setState("POST_AUCTION");
            this.broadcastData("auction_post_auction", { activePlayerID: this.activePlayerID });
            this.timer.start();
        } else {
            this.closeAuction();
        }
    }

    closeAuction() {
        this.setState(this.isRestricted ? "RESTRICTED" : "READY");
        this.bids.empty();
    }

    async signPlayer(playerID, bid) {
        let team = await Cache.get(bid.teamID);
        if (!team) return this.log("No team", bid);
        let player = await Cache.get(playerID);
        if (!player) return this.log("No player", playerID);
        let amount = bid.amount;

        const remainingSpots = (this.playerNumbers.maximumPlayerCount - ((team.players?.length || 0) + 1));

        await Promise.all([
            updateRecord(Cache, "Teams", team, {
                "Players": [
                    ...((team.players || []).map(id => dirtyID(id))),
                    dirtyID(playerID)
                ],
                "Balance": ((team.balance || 0) - amount) + (remainingSpots > 0 ? this.money.unlockAfterSigning : 0)
            }),
            updateRecord(Cache, "Players", player, {
                "Member Of": [
                    ...((player.member_of || []).map(id => dirtyID(id))),
                    dirtyID(team.id)
                ],
                "Auction Price": amount
            })
        ]);
    }

    get timer() {
        return {
            clear: () => {
                if (this.timerTimeout) clearTimeout(this.timerTimeout);
            },
            start: () => {
                this.timer.clear();

                if (this.state === "PRE_AUCTION") {
                    // NEXT -> "IN_ACTION"

                    this.broadcastData("auction_timer", {
                        duration: this.wait.preAuction * 1000
                    });
                    this.timerTimeout = setTimeout(() => this.startAuction(), this.wait.preAuction * 1000);


                } else if (this.state === "IN_ACTION" && this.wait.postAuction) {
                    // NEXT -> "POST_AUCTION"

                    this.broadcastData("auction_timer", {
                        duration: this.wait.afterInitialBid * 1000
                    });
                    this.timerTimeout = setTimeout(() => this.autoCloseAuction(), this.wait.afterInitialBid * 1000);


                } else if (this.state === "POST_AUCTION") {
                    // NEXT -> "RESTRICTED/READY"

                    this.broadcastData("auction_timer", {
                        duration: this.wait.postAuction * 1000
                    });
                    this.timerTimeout = setTimeout(() => this.closeAuction(), this.wait.postAuction * 1000);
                }

            },
            proc: () => {
                this.timer.clear();
                this.timerTimeout = setTimeout(() => this.autoCloseAuction(), this.wait.afterSubsequentBids * 1000);
                this.broadcastData("auction_timer", {
                    duration: this.wait.afterSubsequentBids * 1000
                });
            }
        };
    }

};

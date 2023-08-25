/*
 * Web auction system
 * Use old system interfaces but expose everything through sockets & Cache
 * Use event.blocks
 */

const { onUpdate,
    auth
} = require("./cache");
const Auction = require("./web_auction_class");

/**
 *
 * @type {Map<string, Auction>}
 */
const Auctions = new Map();

function getAuctionData(event) {
    if (!event?.id) return null;
    try {
        let settings = event?.blocks;
        if (!settings) return null;
        let data = JSON.parse(event.blocks);
        return data?.auction;
    } catch (e) {
        console.warn(`[Auction] Event data parse error for event ${event?.id}`, e);
    }
    return null;
}


module.exports = async ({ app, io }) => {
    console.log("Web auction system loading");


    onUpdate((id, { oldData, newData: data }) => {{
        if (!data?.__tableName) return;
        if (data.__tableName === "Events") {
            if (id.startsWith("subdomain-")) return;
            // console.log(id, data?.name);

            if (!Auctions.has(id)) {
                Auctions.set(id, new Auction(data, io, getAuctionData(data)));
            }
            Auctions.get(id).update(data, getAuctionData(data));
        }
    }});

    // io.of("/").adapter.on("join-room", (room, id) => {
    //     if (!room.startsWith("auction:")) return;
    //     [...Auctions.values()].forEach(/** @param {Auction} auction*/ auction => {
    //         if (auction.getSocketIdentifier() === room) {
    //             auction.welcomeSocket(id);
    //         }
    //     });
    // });

    io.on("connection", socket => {
        socket.onAny(async (eventName, data) => {
            if (!eventName.startsWith("auction:")) return;
            if (!data?.auctionID) return console.warn(`Not processing [${eventName}] event because it has no auctionID`);
            let auction = Auctions.get(data.auctionID);
            if (!auction) {
                if (eventName !== "auction:subscribe") {
                    socket.emit("auction_error", "No auction system was found with that ID");
                }
                return console.warn(`No auction system found for ID ${data.auctionID}`);
            }
            data = {
                ...data,
                _token: null,
                user: data._token ? (await auth.getData(data._token))?.user : null
            };

            return auction.handleSocketEvent(socket, eventName, data);
        });
    });
};

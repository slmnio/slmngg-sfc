const client = require("./client.js");
const Cache = require("../cache.js");
const { update, select } = require("../airtable-interface.js");
const Discord = require("discord.js");

let io;

function money(num) {
    return `$${num}k`;
}

function deAirtable(obj) {
    const data = {};
    if (!obj.fields) {
        console.error(obj);
    }
    Object.entries(obj.fields).forEach(([key, val]) => {
        data[key.replace(/ +/g, "_").replace(/[:()]/g, "_").replace(/_+/g,"_").toLowerCase()] = val;
    });
    data.id = obj.id;
    return data;
}

class AuctionBid {
    constructor(team, amount) {
        this.team = team;
        this.amount = amount;
    }
}

function getHex(team) {
    if (!team) return 0;
    if (!team.get("Theme Color")) return 0;
    return parseInt(team.get("Theme Color").toString().replace("#", ""), 16);
}

const Borpa = "https://cdn.discordapp.com/emojis/827000769253343242.gif";
function getImage(team) {
    if (!team) return Borpa;
    try {
        return team.get("Icon")[0].url;
    } catch (e) {
        return Borpa;
    }
}

function getBid(input) {
    if (!input) return null;
    if (input.includes(".")) return null;
    input = parseInt(input.replace("k", "").replace(",", ""));

    if (input > 1000) input = Math.floor(input / 1000);
    if (input <= 1 || input >= 1000) return null;
    return input;
}

const Auction = {
    startingAllowed: true,
    activePlayer: null,
    wait: {
        afterInitial: 20,
        afterBid: 10
    },
    timeouts: {},
    bids: [],
    bid: function(bid) {
        Auction.bids.push(bid);
        io.emit("auction_bids", Auction.bids.map(b => ({
            ...b,
            team: deAirtable(b.team)
        })));
    },
    Timer: {
        timeout: null,
        clear() {
            if (Auction.Timer.timeout) clearTimeout(Auction.Timer.timeout);
        },
        initial() {
            Auction.Timer.clear();
            Auction.Timer.timeout = setTimeout(Auction.checkAfterBid, Auction.wait.afterInitial * 1000);
        },
        proc() {
            Auction.Timer.clear();
            Auction.Timer.timeout = setTimeout(Auction.checkAfterBid, Auction.wait.afterBid * 1000);
        }
    },
    getLeadingBid: function() {
        if (!Auction.bids.length) return null;
        return Auction.bids[Auction.bids.length - 1];
    },
    autobid: true,
    cache: {},
    range: {
        min: 1,
        max: 50,
    },
    isBidInRange(bidAmount) {
        if (!Auction.getLeadingBid()) return false;

        let leadingAmount = Auction.getLeadingBid().amount;
        let diff = bidAmount - leadingAmount;

        return diff >= Auction.range.min && diff <= Auction.range.max;
    },
    getBidRangeText() {
        if (!Auction.getLeadingBid()) return false;
        let leadingAmount = Auction.getLeadingBid().amount;
        return `You must be between ${money(Auction.range.min)} and ${money(Auction.range.max)} above the last bid.\n In this case, you must bid **between ${money(leadingAmount + Auction.range.min)} and ${money(leadingAmount + Auction.range.max)}**.`;
        // TODO: update bid range text here
    },
    teamHasEnoughFor(team, bid) {
        if (!Auction.getLeadingBid()) return false;
        if (!team.get("Balance")) return false;

        // let max = 8;
        // let count = (team.get("Players") || []).length;
        // let remaining = max - count;
        // if (remaining < 0) remaining = 0;

        let balance = parseInt(team.get("Balance"));
        // let availableBalance = (balance - (10 * remaining));

        // console.log("have", count, "need", remaining);

        return bid <= balance;
    },
    getTeams: async function(bust) {
        if (Auction.cache.teams && !bust) return Auction.cache.teams;
        Auction.cache.teams = await select("Teams", {
            view: "Auction Teams"
        });
        return Auction.cache.teams;
    },
    getPlayers: async function(bust) {
        if (Auction.cache.players && !bust) return Auction.cache.players;
        Auction.cache.players = await select("Players", {
            view: "Auction Players"
        });
        return Auction.cache.players;
    },
    findPlayer: async function(prompt) {
        if (!prompt) return null;
        let players = await Auction.getPlayers(true);
        let teams = await Auction.getTeams(true);
        let teamIDs = teams.map(t => t.id);

        let eligiblePlayers = players.filter(t => {
            //        array of IDs
            return !(t.get("Member Of") || []).some(teamID => teamIDs.includes(teamID));
        });
        return eligiblePlayers.find(p => p.get("Name").toLowerCase() === prompt.toLowerCase());
    },
    getBroadcast: async function() {
        try {
            return await select("Broadcasts", {
                filterByFormula: "{Key} = \"st4\""
            });
        } catch (e) {
            console.error(e);
        }
    },
    setActivePlayer: async function(player) {
        io.emit("auction_start", deAirtable(player));

        let [broadcast] = await Auction.getBroadcast();
        if (!broadcast) return console.error("No broadcast found");
        try {
            await update("Broadcasts", broadcast.id, {
                "Highlight Player": [player.id]
            });
        } catch (e) {
            console.error(e);
        }

    },
    getTeam: async function(discordMember, bust) {
        let teams = await Auction.getTeams(bust);
        let team = teams.find(t => (t.get("Controller IDs") || "").split(",").some(tag => tag === discordMember.tag));
        return team;
    },
    start: async function(player, startingTeam) {
        if (Auction.activePlayer) return;
        if (!Auction.channel) return console.error("No auction channel setup");
        Auction.activePlayer = player;

        await Auction.setActivePlayer(player);

        Auction.Timer.initial();
        let embed = new Discord.MessageEmbed();
        embed.setTitle(`Auction started: ${player.get("Name")}`);
        embed.setColor(0x44D582);
        embed.setFooter(`Auction will close in ${Auction.wait.afterInitial} seconds if there are no further bids.`);


        Auction.bids = [];
        if (startingTeam) {
            Auction.bid(new AuctionBid(startingTeam, 1));

            embed.setDescription(`Started by ${startingTeam.get("Name")} at $1k.\nIf there are no further bids, ${player.get("Name")} will be signed to to ${startingTeam.get("Name")}`);
            embed.setThumbnail(getImage(startingTeam));

            if (startingTeam.get("Theme Color")) {
                embed.setColor(getHex(startingTeam));
            }
        }
        Auction.channel.send({ embeds: [embed] });
    },
    sign: async function (player, team, bid) {

        let embed = new Discord.MessageEmbed();
        embed.setTitle(`Signed! ${player.get("Name")} to ${team.get("Name")}`);
        embed.setColor(getHex(team));

        Auction.channel.send({embeds: [embed]});

        Auction.activePlayer = null;
        io.emit("auction_signed", {
            player: deAirtable(player),
            team: deAirtable(team),
            amount: bid.amount,
        });

        await update("Players", player.id, {
            "Member Of": [
                ...player.get("Member Of"),
                team.id
            ]
        });

        let max = 8;
        let count = (team.get("Players") || []).length;
        let remaining = max - count;
        if (remaining < 0) remaining = 0;

        await update("Teams", team.id, {
            "Balance": (parseInt(team.get("Balance")) - bid.amount) + (remaining ? 10 : 0)
        });

        // TODO: Update airtables
    },
    checkAfterBid() {
        console.log("check after");
        Auction.sign(Auction.activePlayer, Auction.getLeadingBid().team, Auction.getLeadingBid());
    }
};

client.once("ready", () => {
    try {
        Auction.guild = client.guilds.resolve("646065580000149514");
        console.log("[auction]", "loaded guild", Auction.guild.name);
        Auction.channel = Auction.guild.channels.resolve("648311334907281408");
        console.log("[auction]", "loaded channel", Auction.channel.name);
    } catch (e) {
        console.error(e);
    }
});

const embedMessage = (color, items) => {
    return {
        embeds: [{
            color,
            ...items
        }]
    };
};

const red = (items) => {
    return embedMessage("0xF22937", items);
};
const blue = (items) => {
    return embedMessage("0x4482D5", items);
};

client.on("messageCreate", async message => {
    if (!message.guild || message.guild.id !== "646065580000149514") return;
    if (!["746461094654247003", "648311334907281408"].includes(message.channel.id)) return;
    // console.log("[auction] message", message.content);

    let args = message.content.split(/ +/);
    let command = args.shift();

    let commands = [
        {
            aliases: [".stop"],
            execute: async (args, message) => {
                Auction.startingAllowed = false;
                Auction.activePlayer = null;
            }
        },
        {
            aliases: [".restart"],
            execute: async (args, message) => {
                Auction.startingAllowed = true;
                Auction.activePlayer = null;
            }
        },
        {
            aliases: [".team"],
            execute: async (args, message) => {
                if (Auction.activePlayer) { try { await message.delete(); } catch (e) { } return; }

                let team = await Auction.getTeam(message.author, true);
                if (!team) return message.reply(red({title: "Can't find a team that you can control.", footer: { text: "+ ratio" }}));

                let embed = new Discord.MessageEmbed();
                embed.setTitle(`Your team: ${team.get("Name")}`);
                embed.setColor(getHex(team));
                embed.setThumbnail(getImage(team));
                embed.setDescription(`${money(team.get("Balance"))}`);
                message.reply({ embeds: [embed] });
            }
        },
        {
            aliases: [".start"],
            execute: async (args, message) => {
                if (!Auction.startingAllowed) { try { await message.delete(); } catch (e) { } return; }
                if (Auction.activePlayer) { try { await message.delete(); } catch (e) { } return; }

                if (!args[0]) return message.reply(red({title: "usage: `.start <name>` eg `.start joshen`"}));
                await Auction.getTeams(true);
                let team = await Auction.getTeam(message.author, true);
                if (!team) return message.reply(red({title: "Can't find the team you represent"}));

                let player = await Auction.findPlayer(args[0]);
                if (!player) return message.reply(red({title: "idk who that is LOL"}));
                await Auction.start(player, (Auction.autobid ? team : null));

            }
        },
        {
            aliases: [".bid", ".b"],
            execute: async (args, message) => {
                if (!Auction.activePlayer) { try { await message.delete(); } catch (e) { } return; }
                let team = await Auction.getTeam(message.author);
                if (!team) return;

                let leadingBid = Auction.getLeadingBid();
                if (leadingBid && leadingBid.team.id === team.id) return message.reply(red({title: "You're already the leading bid"}));

                Auction.Timer.proc();
                let bid = getBid(args[0]);
                if (!bid) return message.reply(red({ title: "Invalid bid" }));
                if (!Auction.teamHasEnoughFor(team, bid)) return message.reply(red({ title: "Your team doesn't have enough funds", description: `${team.get("Name")} has ${money(team.get("Balance"))}, and the leading bid is ${money(Auction.getLeadingBid().amount)}`}));
                if (!Auction.isBidInRange(bid)) return message.reply(red({ title: "Bid out of range", description: Auction.getBidRangeText() }));


                let embed = new Discord.MessageEmbed();
                embed.setTitle(`New bid for ${Auction.activePlayer.get("Name")}: ${money(bid)}`);
                embed.setColor(getHex(team));
                embed.setThumbnail(getImage(team));

                Auction.channel.send({embeds: [embed]});

                Auction.bid(new AuctionBid(team, bid));
            }
        }
    ];
    let c = commands.find(c => c.aliases.some(a => a.toLowerCase() === command.toLowerCase()));
    if (c) c.execute(args, message);
});

module.exports = (_io) => {
    io = _io;
};

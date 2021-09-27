const creds = require("../config/creds.json");
const Airtable = require("airtable");
const Discord = require("discord.js");
const at = new Airtable({apiKey: creds.airtable.key});

const balances = {};

const airtable = {
    // bpl: at.base(creds.airtable.bpl_base),
    slmngg: at.base(creds.airtable.events_base)
};

const eventID = "recQ1g8oJuKTh7Jyk";

const discord = global.Modules.Discord.client;
const io = global.Modules.Socket.io;

async function getEvent() {
    let data = await airtable.slmngg("Events").find(eventID);
    return deAirtable(data);
}

async function getThemes() {
    let data = await airtable.slmngg("Themes").select({
        view: "Focused"
    }).all();
    return data.map(deAirtable);
}
async function getBPLTeams() {
    let data = await airtable.bpl("Captains").select({
        view: "Teams"
    }).all();
    return data.map(deAirtable);
}
async function getGGTeams() {
    let data = await airtable.slmngg("Teams").select({
        view: "Auction"
    }).all();
    return data.map(deAirtable);
}
async function getAllPlayers() {
    let data = await airtable.slmngg("Players").select({
        view: "Auction Players"
    }).all();
    return data.map(deAirtable);
}

discord.on("ready", () => {
    let g = discord.guilds.resolve("646065580000149514");
    Auction.channel = g.channels.resolve("746461094654247003");
});


let Auction = {
    //currencySign: "ᕈ",
    currencySign: "฿",
    wait: {
        noBid: 10,
        afterBid: 12,
        next: 3
    },
    timeouts: {
        noBid: null
    },
    maxStartingBid: 100000,
    minBidIncrement: 1000,
    maxBidIncrement: 50000,
    minStartingBid: 1000,
    currentBid: null,
    currentTeam: null,
    active: false,
    start(player) {
        if (Auction.active) return;

        // Auction.continue = true;
        Auction.active = player;
        Auction.noBid = true;
        Auction.currentBid = null;
        Auction.currentTeam = null;

        Auction.timeouts.noBid = setTimeout(Auction.checkNoBid, Auction.wait.noBid * 1000);

        // let _p = deAirtable(player)
        let _p = player;
        console.log(_p);
        io.sockets.emit("auction:start", _p);

        let _player = player;
        // let _player = deAirtable(player);
        console.log(_player);

        let embed = new Discord.MessageEmbed();
        embed.setTitle(`Auction started: ${_player.name}`);

        embed.setColor(0x44D582);
        embed.setFooter(`Auction will close in ${Auction.wait.noBid} seconds if there are no bids.`);

        if (_player.tank_sr) embed.addField("Tank SR", _player.tank_sr, true);
        if (_player.dps_sr) embed.addField("DPS SR", _player.dps_sr, true);
        if (_player.support_sr) embed.addField("Support SR", _player.support_sr, true);
        if (_player.pronouns) embed.addField("Pronouns", _player.pronouns, true);
        if (_player.best_heroes) embed.addField("Best Heroes", _player.best_heroes.join(", "), true);
        // if (_player.previous_teams) embed.addField('Previous teams', _player.previous_teams.replace(/, /g, '\n'));
        // if (_player.accolades && _player.accolades !== "\n") embed.addField('Accolades', _player.accolades.replace(/, /g, '\n'));
        if (_player.slmngg_id && _player.slmngg_id !== "-failed-") embed.addField("SLMN.GG page", `[${_player.name} on SLMN.gg](https://slmn.gg/player/${_player.slmngg_id})`);

        if (_player.info_for_captains) embed.setDescription(`__Note for captains__\n${_player.info_for_captains}`);

        console.log(embed);

        Auction.channel.send({ embed });


    },
    validateBid(amount, message, team) {

        console.log(amount, message, team);

        amount = (amount.replace(/[^\dk\.]/g, ""));

        if (amount.indexOf("k") !== -1) {
            amount = parseFloat(amount.replace("k", "")) * 1000;
        }

        amount = parseInt(amount);

        if (isNaN(amount)) return null;
        //if (isNaN(amount)) return null;

        async function sendErrorMessage(errorText) {
            return message.channel.send({
                embed: {
                    color: 0xF22937,
                    title: errorText
                }
            });
        }


        if (!Auction.active) {
            sendErrorMessage("no auction is active");
            return null;
        }


        console.log(amount, Auction.getAvailableBalance(team).availableBalance);
        if (Auction.currentTeam && team.id === Auction.currentTeam.id) {
            sendErrorMessage("you are already the leading bid");
            return null;
        }
        if (Auction.currentBid && amount - Auction.currentBid > Auction.maxBidIncrement) {
            Auction.procBidTimer();
            sendErrorMessage(`the bid amount exceeds the maximum bid increment (+${Auction.moneyFormat(Auction.maxBidIncrement)}), current leading bid is ${Auction.moneyFormat(Auction.currentBid)}`);
            return null;
        }
        if (Auction.currentBid && amount - Auction.currentBid < Auction.minBidIncrement) {
            Auction.procBidTimer();
            sendErrorMessage(`the bid amount is lower than the minimum bid increment (+${Auction.moneyFormat(Auction.minBidIncrement)}), current leading bid is ${Auction.moneyFormat(Auction.currentBid)}`);
            return null;
        }
        if (!Auction.currentBid && amount > Auction.maxStartingBid) {
            Auction.procBidTimer();
            sendErrorMessage(`the bid amount exceeds the maximum starting bid (${Auction.moneyFormat(Auction.maxStartingBid)})`);
            return null;
        }
        if (!Auction.currentBid && amount < Auction.minStartingBid) {
            Auction.procBidTimer();
            sendErrorMessage(`the bid amount is lower than the minimum starting bid (${Auction.moneyFormat(Auction.minStartingBid)})`);
            return null;
        }
        if (amount > Auction.getAvailableBalance(team).availableBalance) {
            Auction.procBidTimer();
            sendErrorMessage(`the bid amount exceeds your available balance (${Auction.moneyFormat(Auction.getAvailableBalance(team).availableBalance)})`);
            return null;
        }
        if ((team.players || []).length >= Auction.teamRequiredPlayers) {
            sendErrorMessage("you already have the required amount of players");
            return null;
        }

        return amount;
    },
    bid(team, amount) {
        if (Auction.noBid) {
            // Auction.channel.send('bidding started');
        }
        Auction.noBid = false;
        clearTimeout(Auction.timeouts.noBid);

        Auction.currentTeam = team;
        Auction.currentBid = amount;

        if (team.theme.length !== undefined) team.theme = themes.find(theme => team.theme[0] === theme.id);
        console.log("theme", team.theme);
        Auction.channel.send({
            embed: {
                color: 0x4482D5,
                title: `New leading bid for ${Auction.active.name} - ${Auction.moneyFormat(Auction.currentBid)}`,
                description: [
                    `**${team.name}** is now leading in the auction.`,
                    `Bid with ${Auction.moneyFormat(Auction.minBidIncrement)} more (**${Auction.moneyFormat(parseInt(Auction.minBidIncrement) + parseInt(Auction.currentBid))}** or higher) to take the lead.`,
                    `${team.name}'s current available balance: ${Auction.moneyFormat(Auction.getAvailableBalance(team).availableBalance)}`
                ].join("\n"),
                thumbnail: {
                    url: (team.theme.default_wordmark || team.theme.default_logo)[0].url
                },
                footer: {
                    text: `Auction will close in ${Auction.wait.afterBid} seconds if there are no further bids.`
                }
            }
        });

        io.sockets.emit("auction:bid", {
            team, amount
        });


        Auction.procBidTimer();
        //Auction.channel.send(`current leading bid: ${Auction.currentBid} for team ${Auction.currentTeam.team_name}`);
    },
    procBidTimer() {
        if (Auction.timeouts.afterBid) clearTimeout(Auction.timeouts.afterBid);
        Auction.timeouts.afterBid = setTimeout(Auction.checkAfterBid, Auction.wait.afterBid * 1000);
    },
    end(msg) {
        Auction.active = null;
        console.log(`hi auction is finished: ${msg}`);

        if (Auction.continue) {
            setTimeout(async () => {
                let player = await getRandomAuctionPlayer();
                Auction.start(player);
            }, Auction.wait.next * 1000);
        }
    },
    noBidEnd() {
        if (!Auction.active) return;
        Auction.channel.send({embed: {
            color: 0xF22937,
            title: `Auction cancelled: ${Auction.active.name} - no bids`,
            footer: { text: Auction.continue ? `A new auction will start in ${Auction.wait.next} seconds.` : "A new auction can be manually started."}
        }});

        // TODO: Update airtable with not-signed flag

        // airtable.bpl('Players').update(Auction.active.id, {
        //     'Auction Failed': true
        // });
        io.sockets.emit("auction:failed");

        //Auction.channel.guild.members.resolve(Auction.active.('Discord ID')).roles.add()
    },
    checkNoBid() {
        if (Auction.noBid) {
            // end bidding
            Auction.noBidEnd();
            Auction.end("no bids");
        } else {
            // continue with bidding
        }
    },
    /***
     *
     * @param {AirtableRecord} player
     * @param {object} team
     */
    async sign(player, team, amount) {
        console.log("signing", player, team, team.balance);
        if (team.theme.length !== undefined) team.theme = themes.find(theme => team.theme[0] === theme.id);

        let avb = Auction.getAvailableBalance({...team, players: [...(team.players || []), "dummy"], balance: (team.balance || balances[team.id]) - Auction.currentBid});

        console.log(avb);
        io.sockets.emit("auction:signing", player, team, amount);

        console.log("sign team theme", team.theme);

        Auction.channel.send({embed:{
            color: parseInt(team.theme.color_theme.replace("#",""), 16),
            title: `Auction complete: ${player.name} signed to ${team.name}`,
            thumbnail: {
                url: (team.theme.default_wordmark || team.theme.default_logo)[0].url
            },
            description: [
                `**${player.name}** was signed for **${Auction.moneyFormat(amount)}**.`,
                `**${team.name}** now have **${Auction.moneyFormat(avb.availableBalance)}**.`,
                ...(avb.toDraft === 0 ? ["They have now completed their roster."] : [`They have **${avb.toDraft}** player${avb.toDraft === 1? "" : "s"} left to sign (${Auction.moneyFormat(avb.cap)} locked for later signings).`])
            ].join("\n"),
            footer: { text: Auction.continue ? `A new auction will start in ${Auction.wait.next} seconds.` : "A new auction can be manually started."}
        }});


        /*
        * update bpl airtable
        * send to socket with winning team + player
        * update discord roles
        * update slmngg airtable if possible
        * */

        console.log(`!! Signing ${player.name} to ${team.name} for ${amount}`);
        console.log(player.member_of, team.id);
        await airtable.slmngg("Players").update(player.id, {
            "Member Of": [...(player.member_of || []), team.id]
        });
        balances[team.id] = team.balance - amount;

        // await airtable.bpl('Players').update(player.id, {
        //     'Team': [team.id],
        //     'Signing Time': new Date(),
        //     'Signing Price': amount
        // });
        await airtable.slmngg("Teams").update(team.id, {
            "Balance": balances[team.id]
        });
        player.team = team;
    },
    checkAfterBid() {
        if (Auction.currentTeam && Auction.currentBid) {
            Auction.sign(Auction.active, Auction.currentTeam, Auction.currentBid);
            Auction.end(`bidding timer ran out: ${Auction.currentTeam.name} won :)`);
        } else {
            Auction.noBidEnd();
            Auction.end("no bids after proc");
        }
    },
    teamRequiredPlayers: 8,
    teamMax: 8 * 100000,
    teamMinPerPlayer: 10000,
    getAvailableBalance(team) {
        let playerCount = (team.players || []).length;
        let cap = (Auction.teamRequiredPlayers - playerCount - 1) * Auction.teamMinPerPlayer;
        if (cap < 0) cap = 0;

        let balance = team.balance;// || balances[team.id];

        console.log("[balance]", balance, cap, Auction.teamRequiredPlayers);
        return {
            balance: balance,
            availableBalance: (balance - cap),
            cap: cap,
            toDraft: Auction.teamRequiredPlayers - playerCount
        };
    },
    moneyFormat(num) {
        let str = num.toLocaleString("en-US", {
            style: "currency", currency: "USD", maximumFractionDigits: 0, minimumFractionDigits: 0
        }).replace("$", Auction.currencySign);
        console.log(str);
        if (num % 1000 === 0) {
            str = str.replace(",000", "k");
        }
        console.log(str);

        return str;
    }
};

function deAirtable(obj) {
    const data = {};
    Object.entries(obj.fields).forEach(([key, val]) => {
        data[key.replace(/[:@'\(\)]+/g,"").replace(/ +/g, "_").toLowerCase()] = val;
    });
    data.id = obj.id;
    return data;
}
let themes = [];
async function setup() {
    themes = await getThemes();
    // let BPLteams = await getBPLTeams();
    let GGteams = await getGGTeams();

    let players = await getAllPlayers();

    Auction.teams = GGteams.slice().map(team => {
        team.theme = themes.find(theme => theme.id === team.theme[0]);

        return team;
    });

    Auction.teams.forEach(team => {
        balances[team.id] = team.balance || Auction.teamMax;
    });

    // Auction.teams = BPLteams.map(team => {
    //     team.theme = themes.find(theme => theme.description.toLowerCase().includes(team.name.toLowerCase()));
    //     let ggTeam = GGteams.find(ggt => team.theme ? ggt.theme[0] === team.theme.id : false) || {}
    //     return {
    //         ...ggTeam,
    //         ...team,
    //         players: (team.players||[]).map(pID => players.find(p => p.id === pID))
    //     };
    // })
    Auction.playerCounts = {
        failed: players.filter(p => p.auction_failed).length,
        signed: players.filter(p => !!p.team).length,
        waiting: players.filter(p => !(p.auction_failed || p.team)).length,
    };
}

// TODO: UNCOMMENT
setup();
setInterval(setup, 60 * 1000);

io.on("connection", (socket) => {
    socket.on("auction:initial", async () => {
        // console.log("initial", Auction.teams, Auction.playerCounts)

        let players = await getAllPlayers();

        socket.emit("auction:initial", {
            teams: Auction.teams ? Auction.teams.map(t => {
                return {
                    ...t,
                    players: t.players.slice(id => players.find(p => p.id === id)),
                    balance: balances[t.id]
                };
            }) : [],
            playerCounts: Auction.playerCounts
        });
    });
});


const random = (array) => array[Math.floor(array.length * Math.random())];

async function getNewAuctionPlayer() {

}

async function getRandomAuctionPlayer() {
    // let players = await airtable.bpl('Players').select({
    //     maxRecords: 200,
    //     view: 'Auction Random'
    // }).all();

    let players = await getAllPlayers();

    let player = random(players);
    return player;
}

async function getRandomTieredPlayer(minSR) {
    let players = await airtable.bpl("Players").select({
        maxRecords: 200,
        view: "Auction Random",
        filterByFormula: `{Highest SR} >= ${minSR}`
    }).all();

    return {
        player: random(players),
        count: players.length
    };
}


let airtableteams = [];

async function updateAirtableTeams() {
    airtableteams = await getGGTeams();
    return;
    airtableteams = await airtable.bpl("Captains").select({
        maxRecords: 100,
        view: "Teams",
    }).all();
}

// TODO: UNCOMMENT
updateAirtableTeams();
setInterval(updateAirtableTeams, 20 * 1000);

async function getTeam(bidder) {
    let teams = airtableteams;//.map(deAirtable);

    return teams.map(t => {

        if (typeof t.bidders === "object") {

        } else {
            if (t.bidders) {
                t.bidders = t.bidders.split(",");
            } else if (t.control_ids) {
                t.bidders = t.control_ids.split(",");
            } else {
                t.bidders = [];
            }
        }
        return t;
    }).find(team => team.bidders.includes(bidder.id) || team.discord_tag === bidder.tag);
}

discord.on("message", async message => {
    if (!message.guild) return;
    if (message.channel.id !== "746461094654247003") return;
    // if (!message.member.roles.cache.has("647580381532520518")) return;

    let args = message.content.split(/ +/);
    let command = args.shift();

    if (command === ".random") {
        Auction.continue = false;
        let player = await getRandomAuctionPlayer();
        //message.channel.send(`Randomly chosen: <@${player.get("Discord ID")}> ${player.get('SLMNgg ID') && player.get('SLMNgg ID') !== '-failed-' ? `\nhttps://slmn.gg/player/${player.get('SLMNgg ID')}` : ''}`);
        Auction.start(player);
    }
    if (command === ".tiered") {
        let {player, count} = await getRandomTieredPlayer(parseInt(args[0]));
        //message.channel.send(`Randomly chosen: <@${player.get("Discord ID")}> (out of ${count})`);
    }
    if (command === ".stop") {
        Auction.continue = false;
        message.channel.send("Auction will pause after this bid is finished. **Auction for this player is still active!!**");
        //message.react("🛑")
    }
    if (command === ".start") {
        Auction.continue = false;

        let players = await getAllPlayers();
        let player = players.find(p => p.name.toLowerCase() === args[0].toLowerCase());
        if (!player) player = players.find(p => p.name.slice(0, args[0].length).toLowerCase() === args[0].toLowerCase());

        if (!player) return Auction.channel.send({
            embed: {
                color: 0xF22937,
                title: "Couldn't find that player."
            }
        });

        if (player.team) {
            return Auction.channel.send("hmm sorry i think that player has a team already :face_with_raised_eyebrow:");
        }

        let team = await getTeam(message.author);
        console.log(team);
        if (team) {
            // start and instabid
            Auction.start(player);
            Auction.bid(team, 1000);
        } else {
            // start only
            Auction.start(player);
            Auction.channel.send(":warning: *No team detected for starting bid*");
        }

        // check to see what team they're on

        // message.channel.send(`Auction will pause after this bid is finished. **Auction for this player is still active!!**`);
        //message.react("🛑")
    }
});
discord.on("message", async message => {
    if (!message.guild) return;
    if (message.channel.id !== "746461094654247003") return;

    let args = message.content.toLowerCase().split(/ +/);
    let command = args.shift();

    if (["bid", ".b", ".bid", ",b", "b.", "b"].includes(command) && args[0]) {
        let team = await getTeam(message.author);
        if (!team) return message.channel.send("who");
        let amount = Auction.validateBid(args[0], message, team);
        if (amount === null) return;// message.channel.send('invalid bid oops');
        Auction.bid(team, amount);
        //message.channel.send(`hi you're on team ${team.name}\n${JSON.stringify(Auction.getAvailableBalance(team))}`);
    }
    if (command === ".team") {
        let team = await getTeam(message.author);
        if (!team) return message.channel.send("who");
        // team.theme = JSON.parse(team.theme_json);
        if (team.theme.length !== undefined) team.theme = themes.find(theme => team.theme[0] === theme.id);

        let avb = Auction.getAvailableBalance(team);

        console.log(message.author.username, team.theme);


        message.channel.send({embed:{
            color: parseInt(team.theme.color_theme.replace("#",""), 16),
            title: `${team.name}`,
            thumbnail: {
                url: (team.theme.default_wordmark || team.theme.default_logo)[0].url
            },
            description: [
                `Available balance: **${Auction.moneyFormat(avb.availableBalance)}** (${Auction.moneyFormat(avb.cap)} is locked for later signings)`,
                `Total balance: **${Auction.moneyFormat(avb.balance)}**`,
                `Players signed: **${(team.players || []).length}**.\n**${Auction.teamRequiredPlayers - (team.players || []).length}** left to sign.`,
                `Bidders: ${(team.bidders || []).map(e => `<@${e}>`).join(" ")}`
            ].join("\n")
        }});
    }
});

const { Client, GatewayIntentBits } = require("discord.js");

const {joinVoiceChannel, EndBehaviorType} = require("@discordjs/voice");

const { onUpdate, auth: { getBots, getPlayer }, get } = require("../cache.js");
const { MapObject } = require("./managers");

let io;

function cleanID(id) {
    if (!id) return null;
    if (typeof id !== "string") return id.id || null; // no real id oops
    if (id.startsWith("rec") && id.length === 17) id = id.slice(3);
    return id;
}

// hivemind time

/**
 * this is not jsdoc``````
 *
 * - get all tokens from airtable "Discord Bots".token
 * - connect them all to Discord and track them
 * - keep them in a pool and send them to join voice channels when requested***
 * - Send out events when players start/stop talking -> show who is talking using team cams position data
 *
 * [requested] - what triggers the bots to join?
 * - Run Airtable query every few seconds that checks for any broadcast with the flag "Enable Teams comms"?
 *  (we can probably hook into the updating signals that are sent out to socket.io)
 *
 */


/* watch for:
    - broadcasts with certain settings
    - those broadcasts changing their matches
 */

let broadcastIDs = [];
let watchIDs = [];

async function killTeamComms(broadcastKey) {
    manager.jobs.filter(job => job.broadcastKey === broadcastKey && ["team1", "team2"].includes(job.taskKey))
        .forEach(job => {
            if (!job.client) return;
            job.client.endJob();
        });
    manager.jobs = manager.jobs.filter(job => !(job.broadcastKey === broadcastKey && ["team1", "team2"].includes(job.taskKey)));
}


async function checkBroadcast(id, broadcast) {
    if (!broadcast) broadcast = await get(id);
    if (!broadcast?.key || !broadcast?.active || !broadcast.broadcast_settings?.length) return;
    let broadcastKey = broadcast.key;

    if (broadcast.broadcast_settings.includes("Connect for caster voice")) {
        let taskKey = "casters";
        if (!broadcast.discord_control) return console.warn(`[Voice] Couldn't connect for caster voice because ${broadcast.name} has no discord_control set.`);
        let channelIDs = new MapObject(broadcast.discord_control);
        if (!channelIDs.get("live")) return console.warn(`[Voice] Couldn't connect for caster voice because ${broadcast.name} has no discord_control.live set.`);
        console.log("Creating a new caster job", broadcastKey, channelIDs.get("live"));
        manager.getOrCreateJob(channelIDs.get("live"), broadcastKey, taskKey);
    } else {
        // if there's a job that's bpl4/casters kill it
        manager.jobs.filter(job => job.broadcastKey === broadcastKey && job.taskKey === "casters")
            .forEach(job => {
                if (!job.client) return;
                job.client.endJob();
            });
        manager.jobs = manager.jobs.filter(job => !(job.broadcastKey === broadcastKey && job.taskKey === "casters"));
    }

    if (broadcast.broadcast_settings.includes("Connect for team comms")) {
        if (!broadcast.live_match) {
            killTeamComms(broadcastKey);
            return console.warn(`[Voice] Couldn't connect for team comms because ${broadcast.name} has no live_match.`);
        }
        let matchID = cleanID(broadcast?.live_match?.[0]);
        watchIDs.push(matchID);
        let match = await get(matchID);
        if ((match.teams || []).length !== 2) {
            killTeamComms(broadcastKey);
            return console.warn(`[Voice] Couldn't connect for team comms because the ${broadcast.name} live match doesn't have 2 teams.`);
        }
        let teamIDs = match.teams.map(team => cleanID(team));
        watchIDs = [...watchIDs, ...teamIDs];
        let teams = await Promise.all(teamIDs.map(id => get(id)));

        teams.forEach((team, i) => {
            let taskKey = `team${i+1}`;
            let voiceChannels = new MapObject(team.discord_control);
            let voiceChannelID = voiceChannels.get("voice_channel_id");
            if (!voiceChannelID) return console.warn(`[Voice] Couldn't connect for team ${team.name} on ${broadcast.name} because they have no voice channel ID listed.`);
            manager.getOrCreateJob(voiceChannelID, broadcastKey, taskKey, team.name);

        });
    } else {
        killTeamComms(broadcastKey);

    }
}

if (!process.env.DISCORD_RUN_VOICE_BOTS) {
    console.log("Discord voice bots won't run because DISCORD_RUN_VOICE_BOTS is not set.");
} else {
    onUpdate(async(id, { newData }) => {
        setTimeout(async () => {
            if (id === "Broadcasts") {
                broadcastIDs = newData.ids.map(id => cleanID(id));
                // check all broadcasts
                broadcastIDs.map(id => checkBroadcast(id));
            }

            if (broadcastIDs.includes(cleanID(id))) {
                checkBroadcast(id, newData);
                // check broadcast ID
            }
            if (watchIDs.includes(cleanID(id))) {
                broadcastIDs.map(id => checkBroadcast(id));
            }

            if (id === "Discord Bots") {
                let botData = await getBots(); // update manager?
                manager.setTokens(botData.filter(d => d?.token).map(d => d.token));

                // manager.createJob("996236081819303936", "bpl4", "assistance");
            }
        }, 100);
    });
}


/**
 * @typedef Job
 * @param channelID {Snowflake}
 * @param status {("unfulfilled"|"working")}
 * @param client {DiscordBot}
 */

class Job {
    constructor({ channelID, broadcastKey, taskKey, team}) {
        this.channelID = channelID;
        this.broadcastKey = broadcastKey;
        this.taskKey = taskKey;
        this.team = team;
        this.teamName = team?.name;

        this.client = null;
        this.status = "unfulfilled";
    }

    sync(customSocket) {
        if (!io) return;
        let audioRoom = `${this.broadcastKey}/${this.taskKey}`;
        let destination = customSocket || io.to(audioRoom);
        destination.emit("audio_job_status", audioRoom, this.serialize());
    }

    serialize() {
        return ({
            status: this.status,
            channelID: this.channelID,
            broadcastKey: this.broadcastKey,
            taskKey: this.taskKey,
            teamID: this.team?.id
        });
    }
}


/***
 * @property jobs {Job[]}
 * @property clients {DiscordBot[]}
 */
class BotManager {
    constructor() {
        this.clients = [];
        this.jobs = [];

        // setInterval(() => this.printStatus(), 15 * 1000);
    }

    setTokens(tokens) {
        tokens.forEach(token => {
            this.createClient(token);
        });
        // not join vc just connect to discord
        // possibly also check to see if they
    }

    createClient(token) {
        if (this.clients.some(client => client.token === token)) return;
        this.clients.push(new DiscordBot({ botToken: token, manager: this }));
    }

    createJob(channelID, broadcastKey, taskKey, team) {
        console.log(`[BotManager] New job [${broadcastKey}/${taskKey}] created for channel ${channelID}`);
        let job = new Job({
            channelID,
            broadcastKey,
            taskKey,
            team
        });
        this.jobs.push(job);
        this.assignJobs();
        job.sync();
        return job;
    }

    getOrCreateJob(channelID, broadcastKey, taskKey, team) {
        let job = this.jobs.find(job => job.broadcastKey === broadcastKey && job.taskKey === taskKey);
        if (job) {
            if (job.status === "unfulfilled" || !job.client) return job;

            if (job.channelID === channelID) {
                // requested job is same channel
                return job;
            } else {
                // requested job is different channel
                job.client.endJob(); // ?  TODO: maybe?
            }
        }
        return this.createJob(channelID, broadcastKey, taskKey, team);
    }

    getClient(taskKey, broadcastKey) {
        return this.clients.find(client => client?.job?.broadcastKey === broadcastKey && client?.job?.taskKey === taskKey);
    }
    getJob(taskKey, broadcastKey) {
        return this.jobs.find(job => job?.broadcastKey === broadcastKey && job?.taskKey === taskKey);
    }

    printStatus() {
        // return;
        console.log("jobs", this.jobs.map(job => ({
            status: job.status,
            channelID: job.channelID
        })));
        console.log("clients", this.clients.map(client => ({
            token: client.token.slice(-6),
            status: client.status,
            tag: client.discord.tag,
            job: client.job && {
                status: client.job.status,
                channelID: client.job.channelID,
                broadcastKey: client.job.broadcastKey,
                taskKey: client.job.taskKey
            }
        })));
    }

    assignJobs() {
        // this.printStatus();

        this.jobs.filter(job => job.status === "unfulfilled").forEach(job => {
            let client = this.clients.find(client => client.status === "ready");
            if (!client) return console.log("[BotManager] No client available for job", job);
            client.setJob(job);
            job.status = "attempting";
            job.client = client;
            job.sync();
            // this.printStatus();
        });
    }

    setWorkerJobStatus(worker, status) {
        let job = this.jobs.find(job => job.client?.token === worker.token);
        if (!job) return console.warn(`[BotManager] No job for this worker ${worker.id}`);
        job.status = status;
        job.sync();
        // this.printStatus();
    }

    deleteWorkerJob(worker) {
        let job = this.jobs.find(job => job.client?.token === worker.token);
        // job.prepareForDeletion();
        if (!job) return console.error("Tried to delete a worker's job but couldn't find it");
        this.jobs = this.jobs.filter(job => !(job.client.token === worker.token));
    }

}

const manager = new BotManager();

class DiscordBot {
    constructor({ botToken, manager }) {
        this.manager = manager;
        this.token = botToken;
        this.id = this.token.slice(-6);
        this.status = "connecting";

        this.log("New bot setting up");

        this.channel = null;
        this.discord = {
            tag: null,
            id: null
        };
        this.connection = null;
        this.audios = [];

        this.memberList = new MemberList(this);

        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildVoiceStates
            ]
        });

        this.client.once("ready", async () => {
            this.discord = {
                tag: this.client.user.tag,
                id: this.client.user.id
            };
            this.setStatus("ready");
            this.log(`Connected new bot as ${this.client.user.tag}`);
        });

        this.client.on("voiceStateUpdate", async (oldState, newState) => {

            if (newState.member.user.id === this.discord.id) {
                return this.checkJob(newState.channelId);
            }

            if (!this.job?.channelID || !this.connection) return;
            if (oldState.channelId === this.job?.channelID || newState.channelId === this.job?.channelID) {
                this.memberList.updateMembers(this.channel.members);
            }
            if (newState.channelId === this.job?.channelID) {
                this.subscribeUserAudio(newState.member);
            }
        });

        this.client.on("debug", (m) => {
            // this.log(m);
        });

        this.client.login(botToken);
    }

    log(...str) {
        console.log(`[Bot-${this.id}] [${this.status}${this.socketRoom ? ":" + this.socketRoom : ""}] ${this.discord?.tag || ""} ${str.join(" ")}`);
    }

    setStatus(status) {
        this.status = status;
        switch (status) {
        case "working":
            this.client.user.setPresence({ activities: [{ name: `${this.job?.teamName ? `${this.job?.teamName}'s` : "player"} comms`, type: "LISTENING" }], status: "online" });
            break;
        case "lost":
            this.client.user.setPresence({ activities: [{ name: "in the wrong channel", type: "COMPETING" }], status: "idle" });
            break;
        case "attempting":
            this.client.user.setPresence({ activities: [{ name: "in joining the correct channel", type: "COMPETING" }], status: "online" });
            break;
        case "ready":
        case "disconnected":
        default:
            this.client.user.setPresence({ activities: [{ name: "for new tasks", type: "WATCHING" }], status: "idle" });
            break;
        }

        this.manager.assignJobs();
    }

    setJob(job) {
        this.status = "attempting";
        this.job = job;
        this.socketRoom = `${this.job.broadcastKey}/${this.job.taskKey}`;
        this.log(`Taking new job in channel ${this.job.channelID}`);
        this.connect();
    }

    endJob() {
        this.log("Ending job.");
        this.status = "ending";
        this.manager.setWorkerJobStatus(this, "ending");
        this.disconnect();
    }

    checkJob(currentChannelID) {
        console.log("checking job", this.job);
        if (!this.job) return this.log(`No job but currently in channel ${currentChannelID}`);

        this.log(`Current job is ${this.socketRoom} ${this.job.broadcastKey}/${this.job.taskKey} ${this.job.channelID}`);

        if (this.job.channelID === currentChannelID) {
            this.setStatus("working");
            this.log(`Found the right channel and is working ${currentChannelID}`);
            this.manager.setWorkerJobStatus(this, "working");
        } else if (this.job.channelID && currentChannelID) {
            this.setStatus("lost");
            this.log(`In the wrong channel (should be ${this.job.channelID} but is in ${currentChannelID})`);
            this.connect(); // this might cause some bugs so use carefully
        } else {
            // this.setStatus("disconnected");
            this.log("No longer in a channel");
            // this.connect();
            // this.disconnect();
        }
    }


    async connect() {
        this.channel = await this.client.channels.resolve(this.job.channelID);
        if (!this.channel) {
            this.setStatus("errored");
            return this.log("Can't find channel associated with job");
        }
        this.log("Connecting to", this.job.channelID, this.channel.name, this.channel.id);
        if (this.connection && this.connection.state.status !== "destroyed") this.connection.destroy();

        this.connection = joinVoiceChannel({
            channelId: this.job.channelID,
            guildId: this.channel.guild.id,
            adapterCreator: this.channel.guild.voiceAdapterCreator,
            selfDeaf: false,
            group: this.client.user.id
        });

        this.connection.receiver.speaking.on("start", (userId) => {
            this.memberList.setSpeaking(userId, true);
        });
        this.connection.receiver.speaking.on("end", (userId) => {
            this.memberList.setSpeaking(userId, false);
        });
        this.channel.members.forEach(member => this.subscribeUserAudio(member));
        this.checkJob();
        this.memberList.updateMembers(this.channel.members);
        this.memberList.sync();
    }

    async subscribeUserAudio(member) {
        if (member.user.id === this.client.user.id) return;

        if (this.audios[member.user.id]) {
            // console.log("Already subscribed for this user", this.audios[member.user.id]);
            return;
        }

        console.log(`Subscribing to audio from [${member.user.id}] ${member.user.username}`);

        const audio = this.connection.receiver.subscribe(member.user.id, {end: {behavior: EndBehaviorType.Manual}});

        audio.on("data", (data) => {
            // TODO: checks before transmitting data
            // TODO: How do we manage sockets
            // console.log("emitting", this.socketRoom, member.user.id);
            io.to(this.socketRoom).emit("audio", this.socketRoom, {data, user: member.user.id});
        });

        ["close", "end", "error", "pause"].forEach(eventType => {
            audio.on(eventType, (...data) => console.log("[Stream]", eventType, member.user.id, data));
            // TODO: if this Readable pipe is closed then we can unset this.audios[member.user.id] so it reconnects the user
        });

        this.audios[member.user.id] = audio;
    }

    async disconnect() {
        // TODO: implement
        this.connection.disconnect();
        this.setStatus("ready");
        this.manager.deleteWorkerJob(this);
    }
    async destroy() {
        // TODO: implement
        this.connection.disconnect();
        this.connection.destroy();
        this.client.destroy();
    }
}

class MemberList {
    constructor(bot) {
        this.bot = bot;
        this.speaking = new Map();
        this.members = [];
    }

    async getList() {
        return await Promise.all(this.members.map(async member => ({
            ...member,
            speaking: this.speaking.get(member.id) || false,
            airtableID: (await getPlayer(member.id))?.id || null
        })));
    }

    setSpeaking(userID, state) {
        this.speaking.set(userID, state);
        this.sync();
    }

    updateMembers(discordMembers) {
        this.members = discordMembers.filter(m => !m.user.bot).map(member => ({
            name: member.name,
            id: member.id,
            tag: member.tag
        }));
        this.sync();
    }

    async sync(customSocket) {
        let destination = customSocket || io.to(this.bot.socketRoom);
        // this.bot.log("updating member list");
        destination.emit("audio_member_list", this.bot.socketRoom, await this.getList());
    }
}

module.exports = {
    setup(_io) {
        io = _io;

        io.on("connect", socket => {
            socket.on("audio_subscribe", ({ taskKey, broadcastKey }) => {
                console.log("[audio] sub", taskKey, broadcastKey);
                let audioRoom = `${broadcastKey}/${taskKey}`;
                // if (socket._audioRoom) socket.leave(socket._audioRoom);
                // socket._audioRoom = `${broadcastKey}/${taskKey}`;
                socket.join(audioRoom);

                let client = manager.getClient(taskKey, broadcastKey);
                if (client) {
                    client.memberList.sync(socket);
                }
                let job = manager.getJob(taskKey, broadcastKey);
                if (job) {
                    job.sync(socket);
                } else {
                    socket.emit("audio_job_status", audioRoom, null);
                }
            });
        });
    }
};

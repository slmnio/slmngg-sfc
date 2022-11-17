const {Client, Intents} = require("discord.js");
const {joinVoiceChannel, EndBehaviorType} = require("@discordjs/voice");

const { onUpdate, auth: { getBots } } = require("../cache.js");


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


onUpdate((id, { newData, oldData }) => {
    if (id !== "Discord Bots") return;
    setTimeout(async () => {
        let botData = await getBots(); // update manager?
        manager.setTokens(botData.map(d => d.token).filter(d => d));

        manager.createJob("996236081819303936");
    }, 100);
});


/**
 * @typedef Job
 * @param channelID {Snowflake}
 * @param status {("unfulfilled"|"working")}
 * @param client {DiscordBot}
 */

/***
 * @property jobs {Job[]}
 * @property clients {DiscordBot[]}
 */
class BotManager {
    constructor() {
        this.clients = [];
        this.jobs = [];
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

    createJob(channelID) {
        console.log(`[BotManager] New job created for channel ${channelID}`);
        this.jobs.push({
            status: "unfulfilled",
            client: null,
            channelID
        });
    }

    printStatus() {
        return;
        console.log("jobs", this.jobs.map(job => ({ status: job.status, channelID: job.channelID })));
        console.log("clients", this.clients.map(client => ({ token: client.token.slice(-6), status: client.status, tag: client.discord.tag })));
    }

    assignJobs() {
        this.printStatus();

        this.jobs.filter(job => job.status === "unfulfilled").forEach(job => {
            let client = this.clients.find(client => client.status === "ready");
            if (!client) return console.log("[BotManager] No client available for job", job);
            client.setJob(job);
            job.status = "attempting";
            job.client = client;
            this.printStatus();
        });
    }

    setWorkerJobStatus(worker, status) {
        let job = this.jobs.find(job => job.client.token === worker.token);
        job.status = status;
        this.printStatus();
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

        this.client = new Client({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_VOICE_STATES
            ]
        });

        this.client.once("ready", async () => {
            this.setStatus("ready");
            this.log(`Connected new bot as ${this.client.user.tag}`);
            this.discord = {
                tag: this.client.user.tag,
                id: this.client.user.id
            };
        });

        this.client.on("voiceStateUpdate", async (oldState, newState) => {

            if (newState.member.id === this.discord.id) {
                return this.checkJob(newState.channelId);
            }

            if (!this.job?.channelID || !this.connection) return;
            if (newState.channelId === this.job?.channelID) {
                await this.subscribeUserAudio(newState.member);
            }
        });

        this.client.on("debug", (m) => {
            // this.log(m);
        });

        this.client.login(botToken);
    }

    log(...str) {
        console.log(`[Bot-${this.id}] [${this.status}] ${this.discord?.tag || ""} ${str.join(" ")}`);
    }

    setStatus(status) {
        this.status = status;
        this.manager.assignJobs();
    }

    setJob(job) {
        this.status = "attempting";
        this.job = job;
        this.connect();
    }

    checkJob(currentChannelID) {
        if (!this.job) return this.log(`No job but currently in channel ${currentChannelID}`);

        if (this.job.channelID === currentChannelID) {
            this.setStatus("working");
            this.log(`Found the right channel and is working ${currentChannelID}`);
            this.manager.setWorkerJobStatus(this, "working");
        } else if (this.job.channelID && currentChannelID) {
            this.setStatus("lost");
            this.log(`In the wrong channel (should be ${this.job.channelID} but is in ${currentChannelID})`);
            this.connect(); // this might cause some bugs so use carefully
        } else {
            this.setStatus("disconnected");
            this.log("No longer in a channel");
        }
    }


    async connect() {
        this.channel = await this.client.channels.resolve(this.job.channelID);
        this.log("Connecting to", this.job.channelID, this.channel.name, this.channel.id);
        if (this.connection) this.connection.destroy();

        this.connection = joinVoiceChannel({
            channelId: this.job.channelID,
            guildId: this.channel.guild.id,
            adapterCreator: this.channel.guild.voiceAdapterCreator,
            selfDeaf: false
        });
    }

    async subscribeUserAudio(member) {
        if (this.audios[member.user.id]) {
            // console.log("Already subscribed for this user", this.audios[member.user.id]);
            return;
        }

        console.log(`Subscribing to audio from [${member.user.id}] ${member.user.username}`);

        const audio = this.connection.receiver.subscribe(member.user.id, {end: {behavior: EndBehaviorType.Manual}});
        audio.on("data", (data) => {
            // TODO: checks before transmitting data
            // TODO: How do we manage sockets
            // io.emit("audio", {data, user: member.user.id});
        });

        ["close", "end", "error", "pause"].forEach(eventType => {
            audio.on(eventType, (...data) => console.log("[Stream]", eventType, member.user.id, data));
            // TODO: if this Readable pipe is closed then we can unset this.audios[member.user.id] so it reconnects the user
        });

        this.audios[member.user.id] = audio;
    }

    async destroy() {
        // TODO: implement
        this.connection.disconnect();
        this.connection.destroy();
    }
}


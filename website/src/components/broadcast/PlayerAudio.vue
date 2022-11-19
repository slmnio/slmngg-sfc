<template>
    <div class="player-audio" @click="muted = !muted">
        <div class="member-list" v-if="showMemberList">
            <div class="member" v-for="member in decoratedMemberList" :key="member.id" :class="{'speaking': member.speaking}">
                {{ member.airtable && member.airtable.name }} {{ member.name }} {{ member.id }} {{ member.speaking }}
            </div>
        </div>
    </div>
</template>

<script>
import PCMPlayer from "@/utils/pcmplayer";
import { OpusDecoderWebWorker } from "opus-decoder";
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import { cleanID } from "@/utils/content-utils";

export default {
    name: "PlayerAudio",
    props: ["broadcast", "taskKey", "buffer"],
    sockets: {
        async audio(room, { data, user }) {
            if (room !== this.roomKey) return;
            setTimeout(async () => {
                if (this.muted) return;
                this.lastPacketTime[user] = Date.now();

                if (!this.players[user]) {
                    this.players[user] = new PCMPlayer({
                        encoding: "32bitFloat",
                        channels: 2,
                        sampleRate: 48000,
                        flushingTime: 1000
                    });
                }

                if (!this.decoders[user]) {
                    this.decoders[user] = new OpusDecoderWebWorker({ channels: 2 });
                }

                await this.decoders[user].ready;

                const { channelData, samplesDecoded } = await this.decoders[user].decodeFrame(data);
                if (channelData) {
                    this.players[user].feed({ channelData, length: samplesDecoded });
                }
            }, this.buffer || 0);
        },
        audio_member_list(room, memberList) {
            if (room !== this.roomKey) return;
            setTimeout(() => {
                this.memberList = memberList;
            }, this.buffer || 0);
        },
        audio_job_status(room, status) {
            if (room !== this.roomKey) return;
            setTimeout(() => {
                console.log("status", this.taskKey, status);
                this.status = status;
            }, this.buffer || 0);
        }
    },
    data: () => ({
        noStinger: true,
        players: {},
        decoders: {},
        lastPacketTime: {},
        memberList: [],
        muted: true,
        status: null,
        showMemberList: false
    }),
    computed: {
        broadcastKey() {
            return this.broadcast.key;
        },
        decoratedMemberList() {
            const airtableData = ReactiveArray("members", {
                live_guests: ReactiveThing("live_guests")
            })({ members: this.memberList.map(m => m.airtableID).filter(m => m) });

            return this.memberList.map(member => ({
                ...member,
                airtable: airtableData.find(m => cleanID(m.id) === cleanID(member.airtableID))
            }));
        },
        roomKey() {
            return `${this.broadcastKey}/${this.taskKey}`;
        }
    },
    methods: {
        async garbageCollect() {
            for (const [user, time] of Object.entries(this.lastPacketTime)) {
                if (Date.now() - time > 10000) {
                    console.log("garbage collecting", user);
                    this.players[user].destroy();
                    delete this.players[user];
                    this.decoders[user].free();
                    delete this.decoders[user];
                    delete this.lastPacketTime[user];
                }
            }
        },
        audioSub(key) {
            if (!this.broadcastKey) return;
            this.$socket.client.emit("audio_subscribe", {
                taskKey: key || this.taskKey,
                broadcastKey: this.broadcastKey
            });
        },
        enable() {
            this.muted = false;
        },
        disable() {
            this.muted = true;
        }
    },
    watch: {
        taskKey() {
            this.audioSub();
        },
        broadcastKey() {
            this.audioSub();
        }
    },
    mounted() {
        setInterval(this.garbageCollect, 1000);
        this.audioSub();
    }
};
</script>

<style scoped>

</style>

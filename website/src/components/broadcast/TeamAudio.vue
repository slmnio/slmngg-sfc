<template>
    <div class="player-audio" @click="isMuted = !isMuted">
        <div class="member-list" v-if="!isMuted">
            <div class="member" v-for="member in sortedMemberList" :key="member.id" :class="{'speaking': member.speaking}">
<!--                {{ member.airtable && member.airtable.name }} {{ member.name }} {{ member.id }} {{ member.speaking }}-->
            </div>
        </div>
    </div>
</template>

<script>
import { socket } from "@/socket";
import PCMPlayer from "@/utils/pcmplayer";
import { OpusDecoderWebWorker } from "opus-decoder";
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import { cleanID } from "@/utils/content-utils";

export default {
    name: "TeamAudio",
    props: ["broadcast", "taskKey", "buffer", "alwaysUnmuted", "team"],
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
        isMuted: true,
        status: null,
        showMemberList: false
    }),
    computed: {
        muted() {
            return this.alwaysUnmuted ? false : this.isMuted;
        },
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
        sortedMemberList() {
            const players = (this.team?.players || this.team?.limited_players || []);
            console.log(players, this.team);
            if (!players.length) {
                return [...this.decoratedMemberList].sort((a, b) => {
                    if (a.name > b.name) return 1;
                    if (a.name < b.name) return -1;
                    return 0;
                });
            }

            const p = players.map(player => {
                return this.decoratedMemberList.find(member => {
                    if (player.id === member.airtableID || player.discord_id === member.id) return member;
                    return false;
                });
            }).filter(p => !!p);
            console.log("sorted member list", p);
            return p;
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
                    // TODO: fix these
                    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                    delete this.players[user];
                    this.decoders[user].free();
                    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                    delete this.decoders[user];
                    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                    delete this.lastPacketTime[user];
                }
            }
        },
        audioSub(key) {
            if (!this.broadcastKey) return;
            socket.emit("audio_subscribe", {
                taskKey: key || this.taskKey,
                broadcastKey: this.broadcastKey
            });
        },
        enable() {
            this.isMuted = false;
        },
        disable() {
            this.isMuted = true;
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

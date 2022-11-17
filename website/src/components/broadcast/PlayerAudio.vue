<template>
    <div class="player-audio"></div>
</template>

<script>
import PCMPlayer from "@/utils/pcmplayer";
import { OpusDecoderWebWorker } from "opus-decoder";

export default {
    name: "PlayerAudio",
    sockets: {
        async audio({ data, user }) {
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
        }
    },
    data: () => ({
        players: {},
        decoders: {},
        lastPacketTime: {}
    }),
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
        }

    },
    mounted() {
        setInterval(this.garbageCollect, 1000);
    }
};
</script>

<style scoped>

</style>

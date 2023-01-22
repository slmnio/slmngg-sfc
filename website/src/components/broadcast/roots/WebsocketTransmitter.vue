<template>
    <div class="websocket-transmitter">
        <h1>Tally Transmitter</h1>
        <code>
            URL: {{ wsUrl }}<br>
            Password: {{ wsPassword }}
        </code>

        <div v-if="isConnected">
            <i class="fas fa-check-circle"></i> Connected
        </div>
        <div v-else>
            <LoadingIcon/>
            Not Connected
        </div>


        <div class="prod-scenes">
            <div v-if="wsPreview" class="prod-preview">{{ wsPreview }}</div>
            <div v-if="wsProgram" class="prod-program">{{ wsProgram }}</div>
        </div>
    </div>
</template>
<script>
import OBSWebSocket from "obs-websocket-js";
import LoadingIcon from "@/components/website/LoadingIcon";

export default {
    name: "WebsocketTransmitter",
    components: { LoadingIcon },
    props: ["client", "wsUrl", "wsPassword"],
    data: () => ({
        obsWs: null,
        isConnected: false,
        wsPreview: false,
        wsProgram: false,

        prodData: {
            minor: true
        },
        noStinger: true
    }),
    computed: {
        state() {
            if (this.isConnected) {
                return this.wsProgram ? "active" : this.wsPreview ? "preview" : "inactive";
            } else {
                return "inactive";
            }
        }
    },

    methods: {
        transmit() {
            this.$socket.client.emit("obs_data_change", {
                clientName: this.client?.key,
                previewScene: this.wsPreview,
                programScene: this.wsProgram
            });
        },
        async connectWs() {
            if (this.isConnected) return;
            try {
                await this.obsWs.connect(this.wsUrl, this.wsPassword);
                await this.updateWsSceneData();
                this.isConnected = true;
                this.transmit();
                console.log("Connected to OBS Websocket");
            } catch (e) {
                console.error("Failed to connect to OBS WebSocket");
                console.error(e);
            }
        },
        async updateWsSceneData() {
            const [programSceneResponse, previewSceneResponse] = await this.obsWs.callBatch([
                {
                    requestType: "GetCurrentProgramScene"
                },
                {
                    requestType: "GetCurrentPreviewScene"
                }
            ]);
            const programScene = programSceneResponse?.responseData?.currentProgramSceneName;
            const previewScene = previewSceneResponse?.responseData?.currentPreviewSceneName;
            this.wsProgram = programScene;
            this.wsPreview = previewScene;
            console.log(`OBS Websocket: Program Scene: ${programScene}, Preview Scene: ${previewScene}`);
        }
    },
    async mounted() {
        this.obsWs = new OBSWebSocket();

        this.obsWs.on("ConnectionOpened", () => {
            this.isConnected = true;
        });

        this.obsWs.on("ConnectionClosed", () => {
            this.isConnected = false;
        });

        this.obsWs.on("CurrentProgramSceneChanged", async () => {
            await this.updateWsSceneData();
            this.transmit();
        });
        this.obsWs.on("CurrentPreviewSceneChanged", async () => {
            await this.updateWsSceneData();
            this.transmit();
        });

        setInterval(() => {
            this.connectWs();
        }, 1000);
    },
    metaInfo() {
        return {
            title: `Websocket Transmitter | ${this.client?.name || this.client?.key || ""}`
        };
    }
};
</script>
<style scoped>
h1 {
    font-size: 5rem;
}

.websocket-transmitter {
    height: 100vh;
    width: 100vw;
    background-color: #000000;
    color: #ffffff;
    display: grid;
    place-items: center;
    font-size: 4rem;
    font-family: "SLMN-Industry", "Industry", sans-serif;
}

.prod-scenes {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 3rem;
    flex-grow: 1;
    font-weight: bold;
    width: 80vw;
}

.prod-scenes div {
    border: 3px solid rgba(255, 255, 255, 0.5);
    padding: 0.5em .25em;
    margin: 0 0.25em;
    background-color: black;
    width: 100%;
    line-height: 1.2;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
}

.prod-scenes .prod-preview {
    color: lime;
    border-color: lime;
    border-radius: .1em;
}

.prod-scenes .prod-program {
    color: #ff4646;
    border-color: #ff0000;
    border-radius: .1em;
}
</style>
